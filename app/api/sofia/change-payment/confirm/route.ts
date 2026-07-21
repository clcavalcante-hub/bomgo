import { NextResponse } from "next/server"
import { queryPixPayment } from "@/lib/integrations/cielo"
import { cieloCredentialsForConnection } from "@/lib/integrations/cielo-connection-registry"
import { getChangeCase } from "@/lib/sofia/change-case"
import { getChangePayment, tokenMatchesPayment, updateChangePaymentStatus } from "@/lib/sofia/change-payment"

const noStore = { headers: { "Cache-Control": "no-store" } }

export async function POST(request: Request) {
  let token = ""
  try { token = String(((await request.json()) as { token?: string }).token || "").trim() } catch {}
  const changeCase = await getChangeCase(token)
  if (!changeCase) return NextResponse.json({ error: "invalid-link" }, { status: 404, ...noStore })
  const payment = await getChangePayment(changeCase.protocol)
  if (!payment?.payment_id || !tokenMatchesPayment(payment, token)) {
    return NextResponse.json({ error: "payment-not-found" }, { status: 404, ...noStore })
  }
  const creds = cieloCredentialsForConnection("bomgo-principal")
  const status = await queryPixPayment(creds, payment.payment_id)
  if (!status) return NextResponse.json({ error: "cielo-request-failed" }, { status: 502, ...noStore })
  await updateChangePaymentStatus(changeCase.protocol, status)
  return NextResponse.json({ status, transactionId: payment.payment_id }, noStore)
}

export const dynamic = "force-dynamic"
