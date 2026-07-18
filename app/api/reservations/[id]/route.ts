import { NextResponse } from "next/server"
import { getReservationService } from "@/lib/reservations/reservation-service"
import { requestIdFrom, statusForErrorCode } from "@/lib/reservations/http"
import type { ReservationGuestDetails } from "@/lib/types"
import { auth } from "@/lib/auth/config"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"
import type { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"

async function assertOwnership(reservationId: string): Promise<NextResponse | null> {
  const session = await auth()
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id
  if (!sessionUserId) return null // unauthenticated calls (internal/ops) pass through unchanged
  const repo = getReservationRepository() as PostgresReservationRepository
  if (typeof repo.getOwnerUserId !== "function") return null
  const ownerId = await repo.getOwnerUserId(reservationId)
  if (ownerId !== sessionUserId) {
    return NextResponse.json({ error: "Você não tem permissão para acessar esta reserva.", code: "forbidden" }, { status: 403 })
  }
  return null
}

/** GET /api/reservations/[id] — retrieve a reservation view. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const denied = await assertOwnership(id)
  if (denied) return denied
  const service = getReservationService()
  const result = await service.get(id)
  if (!result.ok) {
    return NextResponse.json({ error: result.message, code: result.code }, { status: statusForErrorCode(result.code) })
  }
  return NextResponse.json(service.toView(result.value))
}

interface PatchBody {
  checkInDate?: string
  checkOutDate?: string
  guests?: { adults?: number; children?: number }
}

/** PATCH /api/reservations/[id] — modify dates/guests (price recalculated). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const requestId = requestIdFrom(request)
  const denied = await assertOwnership(id)
  if (denied) return denied

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }

  const guestsDetails: ReservationGuestDetails | undefined = body.guests
    ? { adults: Number(body.guests.adults ?? 0), children: Number(body.guests.children ?? 0) }
    : undefined

  const service = getReservationService()
  const result = await service.modify(
    id,
    { checkInDate: body.checkInDate, checkOutDate: body.checkOutDate, guestsDetails },
    requestId,
  )
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code, meta: result.meta, requestId },
      { status: statusForErrorCode(result.code) },
    )
  }
  return NextResponse.json({ ...service.toView(result.value), requestId })
}

export const dynamic = "force-dynamic"
