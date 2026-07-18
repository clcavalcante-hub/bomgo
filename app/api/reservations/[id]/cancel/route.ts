import { NextResponse } from "next/server"
import { getReservationService } from "@/lib/reservations/reservation-service"
import { requestIdFrom, statusForErrorCode } from "@/lib/reservations/http"
import { auth } from "@/lib/auth/config"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"
import type { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"

interface CancelBody {
  reason?: string
}

/** POST /api/reservations/[id]/cancel — cancel on Bomgo + owning Stays account.
 * Only the guest who owns the reservation (or a request with no session at
 * all, e.g. an internal/ops call) may cancel it — otherwise anyone who
 * guessed or leaked a reservationId could cancel someone else's booking. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const requestId = requestIdFrom(request)

  const session = await auth()
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id
  if (sessionUserId) {
    const repo = getReservationRepository() as PostgresReservationRepository
    if (typeof repo.getOwnerUserId === "function") {
      const ownerId = await repo.getOwnerUserId(id)
      if (ownerId !== sessionUserId) {
        return NextResponse.json(
          { error: "Você não tem permissão para cancelar esta reserva.", code: "forbidden", requestId },
          { status: 403 },
        )
      }
    }
  }

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
