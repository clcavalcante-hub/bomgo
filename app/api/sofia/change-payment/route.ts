import { NextResponse } from "next/server"
import { createPixSale } from "@/lib/integrations/cielo"
import { cieloCredentialsForConnection } from "@/lib/integrations/cielo-connection-registry"
import { getChangeCase } from "@/lib/sofia/change-case"
import {
  claimChangePayment,
  failChangePayment,
  getChangePayment,
  retryChangePayment,
  saveCreatedChangePix,
  tokenMatchesPayment,
} from "@/lib/sofia/change-payment"

const noStore = { headers: { "Cache-Control": "no-store" } }

export async function POST(request: Request) {
  let token = ""
  try {
    token = String(((await request.json()) as { token?: string }).token || "").trim()
  } catch {}
  const changeCase = await getChangeCase(token)
  if (!changeCase) return NextResponse.json({ error: "invalid-link" }, { status: 404, ...noStore })
  const amount = changeCase.approved_amount_brl
  if (changeCase.status !== "awaiting_payment" || amount == null || amount <= 0) {
    return NextResponse.json({ error: "not-approved", message: "O pagamento ainda não foi liberado." }, { status: 409, ...noStore })
  }

  let claim = await claimChangePayment(changeCase.protocol, token, amount)
  let existing = await getChangePayment(changeCase.protocol)
  if (claim === "existing" && (existing?.status === "failed" || existing?.status === "declined")) {
    claim = (await retryChangePayment(changeCase.protocol, token, amount)) ? "claimed" : "existing"
    existing = await getChangePayment(changeCase.protocol)
  }
  if (claim === "existing" && existing) {
    if (!tokenMatchesPayment(existing, token) || Number(existing.amount_brl) !== amount) {
      return NextResponse.json({ error: "conflict" }, { status: 409, ...noStore })
    }
    if (existing.status === "pix-pending" && existing.payment_id && existing.pix_qr_code) {
      return NextResponse.json({ status: "pix-pending", transactionId: existing.payment_id, pix: { qrCodeText: existing.pix_qr_code, qrCodeBase64: existing.pix_qr_base64 } }, noStore)
    }
    return NextResponse.json({ error: "processing", message: "Pagamento em processamento." }, { status: 409, ...noStore })
  }

  const creds = cieloCredentialsForConnection("bomgo-principal")
  if (!creds.merchantId || !creds.merchantKey) {
    await failChangePayment(changeCase.protocol)
    return NextResponse.json({ error: "cielo-not-configured" }, { status: 503, ...noStore })
  }
  const orderId = `S3${changeCase.protocol.replaceAll("-", "")}`
  const payment = await createPixSale(creds, { orderId, amount })
  if (!payment?.paymentId || !payment.pix?.qrCodeText) {
    await failChangePayment(changeCase.protocol)
    return NextResponse.json({ error: "cielo-request-failed" }, { status: 502, ...noStore })
  }
  await saveCreatedChangePix(changeCase.protocol, payment.paymentId, payment.pix.qrCodeText, payment.pix.qrCodeBase64)
  return NextResponse.json({ status: "pix-pending", transactionId: payment.paymentId, pix: { qrCodeText: payment.pix.qrCodeText, qrCodeBase64: payment.pix.qrCodeBase64 } }, noStore)
}

export const dynamic = "force-dynamic"
