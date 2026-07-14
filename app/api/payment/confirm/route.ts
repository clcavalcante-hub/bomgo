import { NextResponse } from "next/server"
import type { PaymentStatus } from "@/lib/types"
import { queryPayment } from "@/lib/integrations/cielo"

export interface ConfirmResult {
  status: PaymentStatus
  transactionId: string
  live: boolean
}

export async function POST(request: Request) {
  const { transactionId } = (await request.json()) as { transactionId: string }

  // Real Cielo Pix status polling when configured.
  const liveStatus = await queryPayment(transactionId)
  if (liveStatus) {
    return NextResponse.json<ConfirmResult>({
      status: liveStatus,
      transactionId,
      live: true,
    })
  }

  // Fallback: simulate the confirmation webhook resolving to approved.
  await new Promise((r) => setTimeout(r, 1000))
  return NextResponse.json<ConfirmResult>({
    status: "approved",
    transactionId,
    live: false,
  })
}

export const dynamic = "force-dynamic"
