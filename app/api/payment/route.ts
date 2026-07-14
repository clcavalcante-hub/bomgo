import { NextResponse } from "next/server"
import type { PaymentStatus } from "@/lib/types"
import { createCardSale, createPixSale } from "@/lib/integrations/cielo"

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

interface CardBody {
  method: "card"
  amount: number
  installments: number
  cardNumber: string
  holder: string
  expiry: string
  cvv: string
}
interface PixBody {
  method: "pix"
  amount: number
}
type Body = CardBody | PixBody

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

function fakePixPayload(amount: number): string {
  const value = amount.toFixed(2)
  return `00020126BR.GOV.BCB.PIX01BOMGO${generateId("PIX")}5204000053039865406${value}5802BR5910BOMGO PAY6009FORTALEZA62070503***6304AB12`
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body

  if (body.method === "pix") {
    const real = await createPixSale({ orderId: generateId("ORD"), amount: body.amount })
    if (real) {
      return NextResponse.json<PaymentResult>({
        status: "pix-pending",
        transactionId: real.paymentId,
        live: true,
        pix: {
          qrCodeText: real.pix?.qrCodeText ?? "",
          qrCodeBase64: real.pix?.qrCodeBase64,
          expiresInSeconds: 15 * 60,
        },
      })
    }
    // Fallback simulation.
    await new Promise((r) => setTimeout(r, 1200))
    return NextResponse.json<PaymentResult>({
      status: "pix-pending",
      transactionId: generateId("TX"),
      live: false,
      pix: { qrCodeText: fakePixPayload(body.amount), expiresInSeconds: 15 * 60 },
    })
  }

  // Card.
  const real = await createCardSale({
    orderId: generateId("ORD"),
    amount: body.amount,
    installments: body.installments,
    cardNumber: body.cardNumber,
    holder: body.holder,
    expiry: body.expiry,
    cvv: body.cvv,
  })
  if (real) {
    return NextResponse.json<PaymentResult>({
      status: real.status,
      transactionId: real.paymentId,
      live: true,
    })
  }

  // Fallback simulation: decline known test numbers, approve otherwise.
  await new Promise((r) => setTimeout(r, 1500))
  const digits = body.cardNumber.replace(/\s/g, "")
  const declined = digits.endsWith("0000") || digits.startsWith("4000")
  return NextResponse.json<PaymentResult>({
    status: declined ? "declined" : "approved",
    transactionId: generateId("TX"),
    live: false,
  })
}

// Payment is always computed per-request; never statically cached.
export const dynamic = "force-dynamic"
