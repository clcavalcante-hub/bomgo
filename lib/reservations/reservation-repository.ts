import "server-only"

import type { InternalReservation } from "@/lib/types"
import { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"

/**
 * ReservationRepository — persistence boundary for reservations.
 *
 * The interface is intentionally storage-agnostic and async so the in-memory
 * mock below can be swapped for a Postgres/Supabase implementation later
 * WITHOUT touching the service, the state machine or any route. Swap the
 * factory at the bottom (`getReservationRepository`) and nothing else changes.
 *
 * NOTE: the in-memory store is a *mock for preview only*. It is not a durable
 * solution — a real deployment must provide a database-backed implementation.
 * A module-level global is used so data survives dev-server HMR within a
 * single process (mirroring the connection registry pattern).
 */
export interface ReservationRepository {
  create(reservation: InternalReservation): Promise<InternalReservation>
  update(reservation: InternalReservation): Promise<InternalReservation>
  getById(reservationId: string): Promise<InternalReservation | null>
  getByIdempotencyKey(key: string): Promise<InternalReservation | null>
  /**
   * Guard against double-booking the same unit for overlapping dates. Returns
   * an existing *active* (pre_reserved/awaiting_payment/confirmed) reservation
   * for the same listing whose date range overlaps, if any.
   */
  findActiveOverlap(input: {
    externalListingId: string
    staysConnectionId: string
    checkInDate: string
    checkOutDate: string
  }): Promise<InternalReservation | null>
  /** All reservations whose hold deadline is in the past and still unpaid. */
  findExpirable(now: string): Promise<InternalReservation[]>
  list(): Promise<InternalReservation[]>
}

const ACTIVE_STATUSES = new Set(["pre_reserved", "awaiting_payment", "confirmed"])

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  // Half-open interval overlap: [aStart, aEnd) ∩ [bStart, bEnd)
  return aStart < bEnd && bStart < aEnd
}

class InMemoryReservationRepository implements ReservationRepository {
  private store = new Map<string, InternalReservation>()

  async create(reservation: InternalReservation): Promise<InternalReservation> {
    this.store.set(reservation.reservationId, reservation)
    return reservation
  }

  async update(reservation: InternalReservation): Promise<InternalReservation> {
    this.store.set(reservation.reservationId, reservation)
    return reservation
  }

  async getById(reservationId: string): Promise<InternalReservation | null> {
    return this.store.get(reservationId) ?? null
  }

  async getByIdempotencyKey(key: string): Promise<InternalReservation | null> {
    for (const r of this.store.values()) {
      if (r.idempotencyKey && r.idempotencyKey === key) return r
    }
    return null
  }

  async findActiveOverlap(input: {
    externalListingId: string
    staysConnectionId: string
    checkInDate: string
    checkOutDate: string
  }): Promise<InternalReservation | null> {
    for (const r of this.store.values()) {
      if (r.origin.externalListingId !== input.externalListingId) continue
      if (r.origin.staysConnectionId !== input.staysConnectionId) continue
      if (!ACTIVE_STATUSES.has(r.status)) continue
      if (rangesOverlap(r.checkInDate, r.checkOutDate, input.checkInDate, input.checkOutDate)) {
        return r
      }
    }
    return null
  }

  async findExpirable(now: string): Promise<InternalReservation[]> {
    const out: InternalReservation[] = []
    for (const r of this.store.values()) {
      const holdOpen = r.status === "pre_reserved" || r.status === "awaiting_payment"
      if (holdOpen && r.holdExpiresAt && r.holdExpiresAt <= now) out.push(r)
    }
    return out
  }

  async list(): Promise<InternalReservation[]> {
    return Array.from(this.store.values())
  }
}

// Global singleton (survives HMR in dev). Uses Postgres when DATABASE_URL is
// configured — falls back to the in-memory mock only if it isn't (so local
// preview without a database still works, but production always persists).
const globalStore = globalThis as unknown as {
  __bomgoReservationRepo?: ReservationRepository
}

export function getReservationRepository(): ReservationRepository {
  if (!globalStore.__bomgoReservationRepo) {
    if (process.env.DATABASE_URL) {
      globalStore.__bomgoReservationRepo = new PostgresReservationRepository()
    } else {
      globalStore.__bomgoReservationRepo = new InMemoryReservationRepository()
    }
  }
  return globalStore.__bomgoReservationRepo!
}
