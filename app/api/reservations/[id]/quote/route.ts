import { NextResponse } from "next/server"
import { getReservationService } from "@/lib/reservations/reservation-service"
import { statusForErrorCode } from "@/lib/reservations/http"
import { auth } from "@/lib/auth/config"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"
import type { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"

interface QuoteBody {
  checkInDate?: string
  checkOutDate?: string
}

/** POST /api/reservations/[id]/quote — preview price for new dates, no writes. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth()
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id
  if (sessionUserId) {
    const repo = getReservationRepository() as PostgresReservationRepository
    if (typeof repo.getOwnerUserId === "function") {
      const ownerId = await repo.getOwnerUserId(id)
      if (ownerId !== sessionUserId) {
        return NextResponse.json({ error: "Você não tem permissão para acessar esta reserva.", code: "forbidden" }, { status: 403 })
      }
    }
  }

  let body: QuoteBody
  try {
    body = (await request.json()) as QuoteBody
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }
  if (!body.checkInDate || !body.checkOutDate) {
    return NextResponse.json({ error: "Informe checkInDate e checkOutDate." }, { status: 400 })
  }

  const service = getReservationService()
  const result = await service.quoteModification(id, body.checkInDate, body.checkOutDate)
  if (!result.ok) {
    return NextResponse.json({ error: result.message, code: result.code }, { status: statusForErrorCode(result.code) })
  }
  return NextResponse.json(result.value)
}

export const dynamic = "force-dynamic"
