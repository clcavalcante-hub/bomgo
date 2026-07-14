import { NextResponse } from "next/server"
import { getReservationService } from "@/lib/reservations/reservation-service"
import { requestIdFrom, statusForErrorCode } from "@/lib/reservations/http"

interface CancelBody {
  reason?: string
}

/** POST /api/reservations/[id]/cancel — cancel on Bomgo + owning Stays account. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const requestId = requestIdFrom(request)

  let body: CancelBody = {}
  try {
    body = (await request.json()) as CancelBody
  } catch {
    // Body is optional for cancellation.
  }

  const service = getReservationService()
  const result = await service.cancel(id, body.reason, requestId)
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code, meta: result.meta, requestId },
      { status: statusForErrorCode(result.code) },
    )
  }
  return NextResponse.json({ ...service.toView(result.value), requestId })
}

export const dynamic = "force-dynamic"
