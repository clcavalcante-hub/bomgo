import { NextResponse } from "next/server"
import { getReservationService } from "@/lib/reservations/reservation-service"
import { requestIdFrom, statusForErrorCode } from "@/lib/reservations/http"

/**
 * POST /api/reservations/[id]/expire
 *
 * Expires a single unpaid hold: verifies no payment happened, releases/cancels
 * the hold on the owning Stays account, and moves the internal status to
 * `expired`. A confirmed (paid) reservation is refused.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const requestId = requestIdFrom(request)

  const service = getReservationService()
  const result = await service.expire(id, requestId)
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code, requestId },
      { status: statusForErrorCode(result.code) },
    )
  }
  return NextResponse.json({ ...service.toView(result.value), requestId })
}

export const dynamic = "force-dynamic"
