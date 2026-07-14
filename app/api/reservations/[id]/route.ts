import { NextResponse } from "next/server"
import { getReservationService } from "@/lib/reservations/reservation-service"
import { requestIdFrom, statusForErrorCode } from "@/lib/reservations/http"
import type { ReservationGuestDetails } from "@/lib/types"

/** GET /api/reservations/[id] — retrieve a reservation view. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
