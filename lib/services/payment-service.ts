import type { PaymentMethod, PaymentStatus, PriceBreakdown } from "@/lib/types"

// -------------------------------------------------------------------------
// Payment service (client entry point — Cielo behind the scenes)
//
// Card and Pix processing runs server-side in `app/api/payment/*` and calls
// the Cielo eCommerce API when credentials are present. Card data is sent
// straight to the secure route and never persisted. When Cielo isn't
// configured, the route simulates the resulting states so checkout stays
// fully functional. These contracts and the UI are unchanged.
// -------------------------------------------------------------------------

export interface CardPaymentInput {
  method: "card"
  amount: number
  installments: number
  cardNumber: string
  holder: string
  expiry: string
  cvv: string
}

export interface PixPaymentInput {
  method: "pix"
  amount: number
}

export interface GooglePayPaymentInput {
  method: "googlepay"
  amount: number
  installments: number
  googlePayToken: string
}

export type PaymentInput = CardPaymentInput | PixPaymentInput | GooglePayPaymentInput

export interface PaymentResult {
  status: PaymentStatus
  transactionId: string
  live?: boolean
  pix?: {
    qrCodeText: string
    qrCodeBase64?: string
    expiresInSeconds: number
  }
}

export class PaymentRequestError extends Error {}

export async function processPayment(input: PaymentInput): Promise<PaymentResult> {
  const res = await fetch("/api/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new PaymentRequestError(body?.message ?? "Falha ao processar o pagamento")
  }
  return body as PaymentResult
}

// Confirms a Pix payment by polling the real Cielo status. Never resolves to
// a fabricated "approved" — a failure here must be surfaced to the guest.
export async function confirmPix(transactionId: string): Promise<PaymentResult> {
  const res = await fetch("/api/payment/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactionId }),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new PaymentRequestError(body?.message ?? "Falha ao confirmar o Pix")
  }
  return body as PaymentResult
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

export function generateVoucherCode(): string {
  return `BMG-${generateId("").replace("-", "")}`.slice(0, 12)
}

export interface QuoteRequest {
  propertyId: string
  method: PaymentMethod
  price: PriceBreakdown
}
