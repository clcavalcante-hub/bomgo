import { NextResponse } from "next/server"
import type { PaymentStatus } from "@/lib/types"
import { queryPayment } from "@/lib/integrations/cielo"
import { cieloCredentialsForConnection } from "@/lib/integrations/cielo-connection-registry"
import { queryInterPix } from "@/lib/integrations/inter-pix"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"

export interface ConfirmResult {
  status: PaymentStatus
  transactionId: string
  live: boolean
}

export interface ConfirmErrorResponse {
  error: "cielo-not-configured" | "cielo-request-failed" | "invalid-request"
  message: string
}

const noStore = { headers: { "Cache-Control": "no-store" } }

// Never resolves a Pix confirmation to "approved" without a real status from
// Cielo — a missing/failed query must surface as an error, not a fake success.
export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json<ConfirmErrorResponse>(
      { error: "invalid-request", message: "Corpo da requisição inválido." },
      { status: 400, ...noStore },
    )
  }
  const { transactionId, reservationId } = (payload ?? {}) as { transactionId?: unknown; reservationId?: unknown }
  if (typeof transactionId !== "string" || !transactionId) {
    return NextResponse.json<ConfirmErrorResponse>(
      { error: "invalid-request", message: "transactionId ausente." },
      { status: 400, ...noStore },
    )
  }
  if (typeof reservationId !== "string" || !reservationId) {
    return NextResponse.json<ConfirmErrorResponse>(
      { error: "invalid-request", message: "reservationId ausente." },
      { status: 400, ...noStore },
    )
  }

  const reservation = await getReservationRepository().getById(reservationId)
  if (!reservation) {
    return NextResponse.json<ConfirmErrorResponse>(
      { error: "invalid-request", message: "Reserva não encontrada." },
      { status: 404, ...noStore },
    )
  }

  if (transactionId.startsWith("inter:")) {
    const txid = transactionId.slice("inter:".length)
    const liveStatus = await queryInterPix(txid)
    if (!liveStatus) {
      return NextResponse.json<ConfirmErrorResponse>(
        { error: "cielo-request-failed", message: "Não foi possível confirmar o pagamento agora. Tente novamente." },
        { status: 502, ...noStore },
      )
    }
    return NextResponse.json<ConfirmResult>({ status: liveStatus, transactionId, live: true }, noStore)
  }

  const creds = cieloCredentialsForConnection(reservation.origin.staysConnectionId)
  if (!creds.merchantId || !creds.merchantKey) {
    return NextResponse.json<ConfirmErrorResponse>(
      {
        error: "cielo-not-configured",
        message: "Confirmação de pagamento temporariamente indisponível. Tente novamente em instantes.",
      },
      { status: 503, ...noStore },
    )
  }

  const liveStatus = await queryPayment(creds, transactionId)
  if (!liveStatus) {
    return NextResponse.json<ConfirmErrorResponse>(
      { error: "cielo-request-failed", message: "Não foi possível confirmar o pagamento agora. Tente novamente." },
      { status: 502, ...noStore },
    )
  }
  return NextResponse.json<ConfirmResult>(
    {
      status: liveStatus,
      transactionId,
      live: true,
    },
    noStore,
  )
}

export const dynamic = "force-dynamic"
