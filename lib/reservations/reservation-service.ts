import "server-only"

import type {
  InternalReservation,
  ReservationAmount,
  ReservationCustomer,
  ReservationGuestDetails,
  ReservationStatus,
  ReservationView,
} from "@/lib/types"
import { reservationConfig } from "@/lib/integrations/config"
import { getStaysMultiAccountService, type StaysMultiAccountService } from "@/lib/integrations/stays-multi-account"
import type { StaysConnection } from "@/lib/integrations/stays-connection-registry"
import { getReservationRepository, type ReservationRepository } from "@/lib/reservations/reservation-repository"
import {
  getReservationAuditService,
  type ReservationAuditService,
} from "@/lib/reservations/reservation-audit-service"
import {
  getReservationStateMachine,
  ReservationStateError,
  type ReservationStateMachine,
} from "@/lib/reservations/reservation-state-machine"
import {
  getReservationConnectionResolver,
  type ReservationConnectionResolver,
} from "@/lib/reservations/reservation-connection-resolver"
import { StaysClientAdapter } from "@/lib/reservations/stays-client-adapter"
import { StaysReservationAdapter } from "@/lib/reservations/stays-reservation-adapter"
import { formatLocalDate, startOfLocalDay } from "@/lib/dates"

// -------------------------------------------------------------------------
// Result contract (routes map `code` to HTTP status)
// -------------------------------------------------------------------------

export type ReservationErrorCode =
  | "validation"
  | "not_found"
  | "mismatch"
  | "unavailable"
  | "duplicate"
  | "stays_error"
  | "state"

export type ServiceResult<T> = { ok: true; value: T } | { ok: false; code: ReservationErrorCode; message: string; meta?: Record<string, unknown> }

export interface CreateReservationInput {
  externalListingId: string
  connectionHint?: string | null
  checkInDate: string // YYYY-MM-DD
  checkOutDate: string // YYYY-MM-DD
  guestsDetails: ReservationGuestDetails
  customer: ReservationCustomer
  idempotencyKey?: string | null
  requestId?: string
  promocode?: string
  /**
   * Server-derived pricing used ONLY in simulated (no-credentials) mode. The
   * route computes this from the curated catalog — never from the browser
   * total — so the "never trust the client price" rule holds even in preview.
   */
  fallbackPricing?: { nightlyPrice: number; cleaningFee: number; energyFee: number }
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

function nightsBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  const n = Math.round(ms / 86_400_000)
  return n > 0 ? n : 0
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())
}

export class ReservationService {
  constructor(
    private readonly repo: ReservationRepository = getReservationRepository(),
    private readonly audit: ReservationAuditService = getReservationAuditService(),
    private readonly stateMachine: ReservationStateMachine = getReservationStateMachine(),
    private readonly resolver: ReservationConnectionResolver = getReservationConnectionResolver(),
    private readonly multiAccount: StaysMultiAccountService = getStaysMultiAccountService(),
  ) {}

  // -----------------------------------------------------------------------
  // Create — the full obligatory flow
  // -----------------------------------------------------------------------

  async create(input: CreateReservationInput): Promise<ServiceResult<InternalReservation>> {
    const requestId = input.requestId ?? newId("req")

    // 0. Validate.
    const validation = this.validateCreate(input)
    if (validation) return { ok: false, code: "validation", message: validation }

    // 1. Idempotency — return the existing reservation for a repeated key.
    if (input.idempotencyKey) {
      const existing = await this.repo.getByIdempotencyKey(input.idempotencyKey)
      if (existing) {
        console.log(`[v0] reservation idempotency hit key=${input.idempotencyKey} -> ${existing.reservationId}`)
        return { ok: true, value: existing }
      }
    }

    // 2. Resolve the OWNING connection (never auto-switch).
    const outcome = await this.resolver.resolve({
      externalListingId: input.externalListingId,
      connectionHint: input.connectionHint,
    })
    if (outcome.kind === "not_found") {
      return { ok: false, code: "not_found", message: "Imóvel não encontrado em nenhuma conexão." }
    }
    if (outcome.kind === "mismatch") {
      return {
        ok: false,
        code: "mismatch",
        message: "A conexão informada não é a dona do imóvel. A conexão não pode ser trocada automaticamente.",
        meta: { owner: outcome.owner.connectionId, hinted: outcome.hinted },
      }
    }
    const connection = outcome.connection
    const simulated = outcome.kind === "simulated"

    const nights = nightsBetween(input.checkInDate, input.checkOutDate)
    const guests = input.guestsDetails.adults + input.guestsDetails.children

    // 3. Recalculate price on Stays (live) — NEVER trust the browser total.
    const amountResult = await this.resolveAmount({ input, connection, simulated, nights, guests })
    if (!amountResult.ok) return amountResult

    // 4. Recheck availability on the owning account (live only).
    if (!simulated) {
      const available = await this.multiAccount.getListing(input.externalListingId)
      if (!available) {
        return { ok: false, code: "unavailable", message: "Imóvel indisponível para as datas selecionadas." }
      }
    }

    // 5. Prevent double-booking the same unit for overlapping dates.
    const overlap = await this.repo.findActiveOverlap({
      externalListingId: input.externalListingId,
      staysConnectionId: connection.connectionId,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
    })
    if (overlap) {
      return {
        ok: false,
        code: "duplicate",
        message: "Já existe uma reserva ativa para este imóvel nas datas selecionadas.",
        meta: { reservationId: overlap.reservationId },
      }
    }

    // 6+7. Find/create client and create the HOLD on the correct account.
    let staysClientId: string | null = null
    let staysReservationId: string | null = null
    let reservationCode: string | null = null

    if (!simulated) {
      const clientAdapter = new StaysClientAdapter(connection)
      const client = await clientAdapter.findOrCreate(input.customer)
      if (!client) {
        return this.persistSyncError({ input, connection, requestId, amount: amountResult.value, guests, reason: "client" })
      }
      staysClientId = client.id

      const reservationAdapter = new StaysReservationAdapter(connection)
      const hold = await reservationAdapter.createHold({
        listingId: input.externalListingId,
        clientId: client.id,
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        guests,
        guestsDetails: input.guestsDetails,
        promocode: input.promocode,
        internalNote: `Bomgo hold req=${requestId}`,
      })
      if (!hold.ok || !hold.staysReservationId) {
        return this.persistSyncError({ input, connection, requestId, amount: amountResult.value, guests, reason: "reservation", meta: { status: hold.status, error: hold.error } })
      }
      staysReservationId = hold.staysReservationId
      reservationCode = hold.reservationCode
    } else {
      // Simulated: no Stays write. Deterministic fake identifiers.
      staysClientId = `sim-client-${newId("c")}`
      staysReservationId = `sim-res-${newId("r")}`
      reservationCode = `BMG-${staysReservationId.slice(-6).toUpperCase()}`
    }

    // 8. Persist as a pre-reservation (hold) with a validity deadline.
    const now = new Date()
    const holdExpiresAt = new Date(now.getTime() + reservationConfig.holdTtlMinutes * 60_000).toISOString()
    const reservation: InternalReservation = {
      reservationId: `${connection.connectionId}:${newId("bmg")}`,
      idempotencyKey: input.idempotencyKey ?? null,
      status: "pre_reserved",
      origin: {
        internalPropertyId: `${connection.connectionId}:${input.externalListingId}`,
        externalListingId: input.externalListingId,
        staysConnectionId: connection.connectionId,
        partnerId: connection.partnerId,
        sourceAccount: connection.connectionName,
      },
      staysReservationId,
      reservationCode,
      staysClientId,
      customer: input.customer,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      guests,
      guestsDetails: input.guestsDetails,
      amount: amountResult.value,
      simulated,
      holdExpiresAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      requestId,
    }

    await this.repo.create(reservation)
    await this.audit.record({
      reservationId: reservation.reservationId,
      requestId,
      action: simulated ? "create_hold_simulated" : "create_hold",
      fromStatus: "draft",
      toStatus: "pre_reserved",
      meta: {
        connectionId: connection.connectionId,
        staysReservationId,
        total: amountResult.value.total,
        priceSource: amountResult.value.source,
      },
    })

    return { ok: true, value: reservation }
  }

  // -----------------------------------------------------------------------
  // Retrieve
  // -----------------------------------------------------------------------

  async get(reservationId: string): Promise<ServiceResult<InternalReservation>> {
    const reservation = await this.repo.getById(reservationId)
    if (!reservation) return { ok: false, code: "not_found", message: "Reserva não encontrada." }
    return { ok: true, value: reservation }
  }

  // -----------------------------------------------------------------------
  // Modify (dates / guests) — routed to the owning account
  // -----------------------------------------------------------------------

  async modify(
    reservationId: string,
    changes: { checkInDate?: string; checkOutDate?: string; guestsDetails?: ReservationGuestDetails },
    requestId = newId("req"),
  ): Promise<ServiceResult<InternalReservation>> {
    const reservation = await this.repo.getById(reservationId)
    if (!reservation) return { ok: false, code: "not_found", message: "Reserva não encontrada." }
    if (this.stateMachine.isTerminal(reservation.status)) {
      return { ok: false, code: "state", message: `Reserva ${reservation.status} não pode ser modificada.` }
    }

    const checkInDate = changes.checkInDate ?? reservation.checkInDate
    const checkOutDate = changes.checkOutDate ?? reservation.checkOutDate
    if (!isValidDate(checkInDate) || !isValidDate(checkOutDate) || checkInDate >= checkOutDate) {
      return { ok: false, code: "validation", message: "Datas inválidas." }
    }
    const guestsDetails = changes.guestsDetails ?? reservation.guestsDetails
    const guests = guestsDetails.adults + guestsDetails.children
    const nights = nightsBetween(checkInDate, checkOutDate)

    // Recalculate price for the new terms — never carry over a stale total.
    const connection = await this.resolver.getById(reservation.origin.staysConnectionId)
    if (!connection) return { ok: false, code: "not_found", message: "Conexão da reserva indisponível." }

    const amountResult = await this.resolveAmount({
      input: {
        externalListingId: reservation.origin.externalListingId,
        checkInDate,
        checkOutDate,
        fallbackPricing: {
          nightlyPrice: reservation.amount.nightlyPrice,
          cleaningFee: reservation.amount.fees,
          energyFee: 0,
        },
      },
      connection,
      simulated: reservation.simulated,
      nights,
      guests,
    })
    if (!amountResult.ok) return amountResult

    if (!reservation.simulated && reservation.staysReservationId) {
      const adapter = new StaysReservationAdapter(connection)
      const res = await adapter.modify(reservation.staysReservationId, {
        checkInDate,
        checkOutDate,
        guests,
        guestsDetails,
      })
      if (!res.ok) {
        return { ok: false, code: "stays_error", message: "Falha ao modificar a reserva na Stays.", meta: { status: res.status } }
      }
    }

    const updated: InternalReservation = {
      ...reservation,
      checkInDate,
      checkOutDate,
      guests,
      guestsDetails,
      amount: amountResult.value,
      updatedAt: new Date().toISOString(),
    }
    await this.repo.update(updated)
    await this.audit.record({
      reservationId,
      requestId,
      action: "modify",
      fromStatus: reservation.status,
      toStatus: updated.status,
      meta: { checkInDate, checkOutDate, guests, total: updated.amount.total },
    })
    return { ok: true, value: updated }
  }

  // -----------------------------------------------------------------------
  // Cancel — routed to the owning account
  // -----------------------------------------------------------------------

  async cancel(reservationId: string, message?: string, requestId = newId("req")): Promise<ServiceResult<InternalReservation>> {
    const reservation = await this.repo.getById(reservationId)
    if (!reservation) return { ok: false, code: "not_found", message: "Reserva não encontrada." }
    if (reservation.status === "cancelled") return { ok: true, value: reservation }

    try {
      this.stateMachine.assertTransition(reservation.status, "cancelled")
    } catch (error) {
      if (error instanceof ReservationStateError) {
        return { ok: false, code: "state", message: error.message }
      }
      throw error
    }

    if (!reservation.simulated && reservation.staysReservationId) {
      const connection = await this.resolver.getById(reservation.origin.staysConnectionId)
      if (connection) {
        const adapter = new StaysReservationAdapter(connection)
        const res = await adapter.cancel(reservation.staysReservationId, message)
        if (!res.ok) {
          // Record drift but still reflect the intent locally as sync error.
          const errored = await this.transition(reservation, "synchronization_error", requestId, "cancel_failed", {
            status: res.status,
          })
          return { ok: false, code: "stays_error", message: "Falha ao cancelar na Stays.", meta: { reservationId: errored.reservationId } }
        }
      }
    }

    const cancelled = await this.transition(reservation, "cancelled", requestId, "cancel", { message })
    return { ok: true, value: cancelled }
  }

  // -----------------------------------------------------------------------
  // Expiration — release unpaid holds past their validity window
  // -----------------------------------------------------------------------

  async expire(reservationId: string, requestId = newId("req")): Promise<ServiceResult<InternalReservation>> {
    const reservation = await this.repo.getById(reservationId)
    if (!reservation) return { ok: false, code: "not_found", message: "Reserva não encontrada." }

    // Only unpaid holds can expire. A confirmed/paid reservation never expires.
    if (reservation.status !== "pre_reserved" && reservation.status !== "awaiting_payment") {
      return { ok: false, code: "state", message: `Reserva ${reservation.status} não é elegível para expiração.` }
    }

    await this.releaseOnStays(reservation, requestId)
    const expired = await this.transition(reservation, "expired", requestId, "expire")
    return { ok: true, value: expired }
  }

  /** Sweep: expire every hold whose deadline has passed. Safe to call on a cron. */
  async expireDue(requestId = newId("sweep")): Promise<{ expired: string[] }> {
    const now = new Date().toISOString()
    const due = await this.repo.findExpirable(now)
    const expired: string[] = []
    for (const reservation of due) {
      await this.releaseOnStays(reservation, requestId)
      await this.transition(reservation, "expired", requestId, "expire_sweep")
      expired.push(reservation.reservationId)
    }
    return { expired }
  }

  // -----------------------------------------------------------------------
  // View mapping (public/ops shape returned by routes)
  // -----------------------------------------------------------------------

  toView(reservation: InternalReservation): ReservationView {
    return {
      reservationId: reservation.reservationId,
      staysReservationId: reservation.staysReservationId,
      reservationCode: reservation.reservationCode,
      connectionId: reservation.origin.staysConnectionId,
      status: reservation.status,
      amount: reservation.amount,
      holdExpiresAt: reservation.holdExpiresAt,
      simulated: reservation.simulated,
    }
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private validateCreate(input: CreateReservationInput): string | null {
    if (!input.externalListingId) return "listingId é obrigatório."
    if (!isValidDate(input.checkInDate) || !isValidDate(input.checkOutDate)) return "Datas inválidas."
    if (input.checkInDate >= input.checkOutDate) return "checkOut deve ser posterior ao checkIn."
    // Compare against today's LOCAL calendar date, never UTC — `toISOString()`
    // rolls back to "yesterday" in any timezone behind UTC after ~21h local.
    if (input.checkInDate < formatLocalDate(startOfLocalDay(new Date()))) return "checkIn não pode ser no passado."
    const { adults, children } = input.guestsDetails ?? { adults: 0, children: 0 }
    if (!adults || adults < 1) return "É necessário ao menos 1 adulto."
    if (children < 0) return "Número de crianças inválido."
    const c = input.customer
    if (!c?.firstName || !c?.lastName || !c?.email) return "Dados do cliente incompletos."
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) return "E-mail inválido."
    return null
  }

  private async resolveAmount(args: {
    input: Pick<CreateReservationInput, "externalListingId" | "checkInDate" | "checkOutDate" | "promocode" | "fallbackPricing">
    connection: StaysConnection
    simulated: boolean
    nights: number
    guests: number
  }): Promise<ServiceResult<ReservationAmount>> {
    const { input, simulated, nights, guests } = args

    if (!simulated) {
      // Authoritative price straight from the owning Stays account.
      const prices = await this.multiAccount.calculatePrice({
        listingIds: [input.externalListingId],
        from: input.checkInDate,
        to: input.checkOutDate,
        guests,
        promocode: input.promocode,
      })
      const row = prices?.find((p) => p.listingId === input.externalListingId) ?? prices?.[0]
      if (!row || !row.total) {
        return { ok: false, code: "unavailable", message: "Não foi possível calcular o preço na Stays para as datas." }
      }
      const fees = row.fees.reduce((sum, f) => sum + f.value, 0)
      return {
        ok: true,
        value: {
          currency: row.currency || "BRL",
          nightlyPrice: nights > 0 ? Math.round((row.total - fees) / nights) : row.total,
          nights,
          subtotal: row.total - fees,
          fees,
          total: row.total,
          source: "stays",
        },
      }
    }

    // Simulated: derive from server-provided catalog pricing (not the browser).
    const fp = input.fallbackPricing ?? { nightlyPrice: 0, cleaningFee: 0, energyFee: 0 }
    const subtotal = fp.nightlyPrice * (nights > 0 ? nights : 1)
    const fees = fp.cleaningFee + fp.energyFee
    return {
      ok: true,
      value: {
        currency: "BRL",
        nightlyPrice: fp.nightlyPrice,
        nights: nights > 0 ? nights : 1,
        subtotal,
        fees,
        total: subtotal + fees,
        source: "simulated",
      },
    }
  }

  private async persistSyncError(args: {
    input: CreateReservationInput
    connection: StaysConnection
    requestId: string
    amount: ReservationAmount
    guests: number
    reason: string
    meta?: Record<string, unknown>
  }): Promise<ServiceResult<InternalReservation>> {
    const { input, connection, requestId, amount, guests, reason, meta } = args
    const now = new Date().toISOString()
    const reservation: InternalReservation = {
      reservationId: `${connection.connectionId}:${newId("bmg")}`,
      idempotencyKey: input.idempotencyKey ?? null,
      status: "synchronization_error",
      origin: {
        internalPropertyId: `${connection.connectionId}:${input.externalListingId}`,
        externalListingId: input.externalListingId,
        staysConnectionId: connection.connectionId,
        partnerId: connection.partnerId,
        sourceAccount: connection.connectionName,
      },
      staysReservationId: null,
      reservationCode: null,
      staysClientId: null,
      customer: input.customer,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      guests,
      guestsDetails: input.guestsDetails,
      amount,
      simulated: false,
      holdExpiresAt: null,
      createdAt: now,
      updatedAt: now,
      requestId,
    }
    await this.repo.create(reservation)
    await this.audit.record({
      reservationId: reservation.reservationId,
      requestId,
      action: `create_failed_${reason}`,
      fromStatus: "draft",
      toStatus: "synchronization_error",
      meta,
    })
    return {
      ok: false,
      code: "stays_error",
      message: "Falha ao registrar a reserva na Stays. Nenhuma cobrança foi feita.",
      meta: { reservationId: reservation.reservationId, reason, ...meta },
    }
  }

  private async releaseOnStays(reservation: InternalReservation, requestId: string): Promise<void> {
    if (reservation.simulated || !reservation.staysReservationId) return
    const connection = await this.resolver.getById(reservation.origin.staysConnectionId)
    if (!connection) return
    const adapter = new StaysReservationAdapter(connection)
    const res = await adapter.cancel(reservation.staysReservationId, "Pré-reserva expirada sem pagamento")
    if (!res.ok) {
      console.log(`[v0] release-on-expire failed reservation=${reservation.reservationId} status=${res.status}`)
      await this.audit.record({
        reservationId: reservation.reservationId,
        requestId,
        action: "expire_release_failed",
        fromStatus: reservation.status,
        toStatus: reservation.status,
        meta: { status: res.status },
      })
    }
  }

  private async transition(
    reservation: InternalReservation,
    to: ReservationStatus,
    requestId: string,
    action: string,
    meta?: Record<string, unknown>,
  ): Promise<InternalReservation> {
    this.stateMachine.assertTransition(reservation.status, to)
    const updated: InternalReservation = { ...reservation, status: to, updatedAt: new Date().toISOString() }
    await this.repo.update(updated)
    await this.audit.record({
      reservationId: reservation.reservationId,
      requestId,
      action,
      fromStatus: reservation.status,
      toStatus: to,
      meta,
    })
    return updated
  }
}

let service: ReservationService | null = null

export function getReservationService(): ReservationService {
  if (!service) service = new ReservationService()
  return service
}
