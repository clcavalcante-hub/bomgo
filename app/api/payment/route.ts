import { NextResponse } from "next/server"
import type { PaymentStatus } from "@/lib/types"
import { createCardSale, createPixSale, createGooglePaySale } from "@/lib/integrations/cielo"
import { cieloCredentialsForConnection } from "@/lib/integrations/cielo-connection-registry"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"
import { authoritativePaymentAmount } from "@/lib/payments/authoritative-amount"

export interface PaymentResult {
  status: PaymentStatus
  transactionId: string
  live: boolean
  pix?: {
    qrCodeText: string
    qrCodeBase64?: string
    expiresInSeconds: number
  }
}

export interface PaymentErrorResponse {
  error: "cielo-not-configured" | "cielo-request-failed" | "invalid-request"
  message: string
}

interface CardBody {
  method: "card"
  amount: number
  installments: number
  cardNumber: string
  holder: string
  expiry: string
  cvv: string
  reservationId: string
}
interface PixBody {
  method: "pix"
  amount: number
  reservationId: string
}
interface GooglePayBody {
  method: "googlepay"
  amount: number
  installments: number
  googlePayToken: string
  reservationId: string
}
type Body = CardBody | PixBody | GooglePayBody

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

function isValidBody(body: unknown): body is Body {
  if (!body || typeof body !== "object") return false
  const b = body as Record<string, unknown>
  if (typeof b.amount !== "number" || !(b.amount > 0)) return false
  if (typeof b.reservationId !== "string" || !b.reservationId) return false
  if (b.method === "pix") return true
  if (b.method === "googlepay") {
    return typeof b.installments === "number" && typeof b.googlePayToken === "string" && b.googlePayToken.length > 0
  }
  if (b.method === "card") {
    return (
      typeof b.installments === "number" &&
      typeof b.cardNumber === "string" &&
      typeof b.holder === "string" &&
      typeof b.expiry === "string" &&
      typeof b.cvv === "string"
    )
  }
  return false
}

const noStore = { headers: { "Cache-Control": "no-store" } }

// Bomgo nunca aprova/reprova um pagamento sem uma resposta real da Cielo.
// Quando a integração não está configurada, ou a chamada real falha, a rota
// retorna um erro explícito — jamais simula "approved"/"declined".
//
// Which Cielo MERCHANT ACCOUNT gets charged depends on which partner owns
// the property being booked — resolved from the reservation's Stays
// connection (bomgo-principal, beach-living, verdefan...), never a single
// hardcoded account, so a partner's guest never gets charged into Bomgo's
// own Cielo account or vice-versa.
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<PaymentErrorResponse>(
      { error: "invalid-request", message: "Corpo da requisição inválido." },
      { status: 400, ...noStore },
    )
  }
  if (!isValidBody(body)) {
    return NextResponse.json<PaymentErrorResponse>(
      { error: "invalid-request", message: "Dados de pagamento incompletos ou inválidos." },
      { status: 400, ...noStore },
    )
  }

  const reservation = await getReservationRepository().getById(body.reservationId)
  if (!reservation) {
    return NextResponse.json<PaymentErrorResponse>(
      { error: "invalid-request", message: "Reserva não encontrada." },
      { status: 404, ...noStore },
    )
  }
  // Defense in depth — the "Pague agora" button is already disabled in the
  // UI outside these two statuses, but a UI state is bypassable. A
  // cancelled, already-confirmed, completed, or expired reservation must
  // never accept a new charge, so this is enforced here too, not just on
  // the client.
  if (reservation.status !== "pre_reserved" && reservation.status !== "awaiting_payment") {
    return NextResponse.json<PaymentErrorResponse>(
      { error: "invalid-request", message: "Esta reserva não está mais disponível para pagamento." },
      { status: 409, ...noStore },
    )
  }
  const amount = authoritativePaymentAmount(reservation.amount.total, body.amount)
  if (amount === null) {
    return NextResponse.json<PaymentErrorResponse>(
      {
        error: "invalid-request",
        message: "O valor da tela está desatualizado. Atualize a página antes de tentar novamente.",
      },
      { status: 409, ...noStore },
    )
  }
  const creds = cieloCredentialsForConnection(reservation.origin.staysConnectionId)
  if (!creds.merchantId || !creds.merchantKey) {
    return NextResponse.json<PaymentErrorResponse>(
      {
        error: "cielo-not-configured",
        message: "Pagamentos estão temporariamente indisponíveis. Tente novamente em instantes.",
      },
      { status: 503, ...noStore },
    )
  }

  if (body.method === "pix") {
    const real = await createPixSale(creds, { orderId: generateId("ORD"), amount })
    if (!real) {
      return NextResponse.json<PaymentErrorResponse>(
        { error: "cielo-request-failed", message: "Não foi possível gerar o Pix agora. Tente novamente." },
        { status: 502, ...noStore },
      )
    }
    return NextResponse.json<PaymentResult>(
      {
        status: "pix-pending",
        transactionId: real.paymentId,
        live: true,
        pix: {
          qrCodeText: real.pix?.qrCodeText ?? "",
          qrCodeBase64: real.pix?.qrCodeBase64,
          expiresInSeconds: 15 * 60,
        },
      },
      noStore,
    )
  }

  if (body.method === "googlepay") {
    const real = await createGooglePaySale(creds, {
      orderId: generateId("ORD"),
      amount,
      installments: body.installments,
      googlePayToken: body.googlePayToken,
    })
    if (!real) {
      return NextResponse.json<PaymentErrorResponse>(
        { error: "cielo-request-failed", message: "Não foi possível processar o Google Pay agora. Tente novamente." },
        { status: 502, ...noStore },
      )
    }
    return NextResponse.json<PaymentResult>(
      { status: real.status, transactionId: real.paymentId, live: true },
      noStore,
    )
  }

  // Card.
  const real = await createCardSale(creds, {
    orderId: generateId("ORD"),
    amount,
    installments: body.installments,
    cardNumber: body.cardNumber,
    holder: body.holder,
    expiry: body.expiry,
    cvv: body.cvv,
  })
  if (!real) {
    return NextResponse.json<PaymentErrorResponse>(
      { error: "cielo-request-failed", message: "Não foi possível processar o pagamento agora. Tente novamente." },
      { status: 502, ...noStore },
    )
  }
  return NextResponse.json<PaymentResult>(
    {
      status: real.status,
      transactionId: real.paymentId,
      live: true,
    },
    noStore,
  )
}

// Payment is always computed per-request; never statically cached.
export const dynamic = "force-dynamic"
