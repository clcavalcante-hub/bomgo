import { NextResponse } from "next/server"
import type { PaymentStatus } from "@/lib/types"
import { queryPayment } from "@/lib/integrations/cielo"
import { isCieloConfigured } from "@/lib/integrations/config"

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
  const transactionId = (payload as { transactionId?: unknown })?.transactionId
  if (typeof transactionId !== "string" || !transactionId) {
    return NextResponse.json<ConfirmErrorResponse>(
      { error: "invalid-request", message: "transactionId ausente." },
      { status: 400, ...noStore },
    )
  }

  if (!isCieloConfigured()) {
    return NextResponse.json<ConfirmErrorResponse>(
      {
        error: "cielo-not-configured",
        message: "Confirmação de pagamento temporariamente indisponível. Tente novamente em instantes.",
      },
      { status: 503, ...noStore },
    )
  }

  const liveStatus = await queryPayment(transactionId)
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
