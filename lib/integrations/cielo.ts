import "server-only"

import { cieloBaseUrls, cieloConfig, isCieloConfigured } from "@/lib/integrations/config"
import type { PaymentStatus } from "@/lib/types"

/**
 * Cielo eCommerce API 3.0 adapter.
 *
 * Amounts are always sent in cents (integer). Card data flows straight to
 * Cielo and is never persisted by us. Every call is defensive and returns
 * `null` on failure so the payment route can fall back to a simulation.
 * `server-only` guarantees the MerchantKey never reaches the browser.
 */

/** Detect card brand from BIN — Cielo requires this explicitly on some
 * merchant configs; without it, sales can be rejected with "Brand is not
 * supported by selected provider" regardless of the card being valid. */
function detectBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\D/g, "")
  if (/^4/.test(n)) return "Visa"
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "Master"
  if (/^3[47]/.test(n)) return "Amex"
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n)) return "Elo"
  if (/^(30[0-5]|36|38)/.test(n)) return "Diners"
  if (/^(6011|65|64[4-9])/.test(n)) return "Discover"
  if (/^35(2[89]|[3-8]\d)/.test(n)) return "JCB"
  if (/^50[0-9]/.test(n)) return "Aura"
  return "Visa" // safest fallback; overwritten correctly for real cards above
}

function toCents(amount: number): number {
  return Math.round(amount * 100)
}

function headers() {
  return {
    "Content-Type": "application/json",
    MerchantId: cieloConfig.merchantId,
    MerchantKey: cieloConfig.merchantKey,
  }
}

/** Map Cielo numeric status to our PaymentStatus. */
function mapStatus(cieloStatus: number): PaymentStatus {
  // 1 = Authorized, 2 = PaymentConfirmed -> approved
  if (cieloStatus === 1 || cieloStatus === 2) return "approved"
  // 12 = Pending (Pix awaiting payment)
  if (cieloStatus === 12) return "pix-pending"
  // 3 = Denied, 10 = Voided, 13 = Aborted -> declined
  return "declined"
}

export interface CieloSaleResult {
  status: PaymentStatus
  paymentId: string
  pix?: { qrCodeText: string; qrCodeBase64?: string }
}

async function cieloPost(body: unknown): Promise<any | null> {
  try {
    const res = await fetch(`${cieloBaseUrls().transaction}/1/sales/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      cache: "no-store",
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => "")
      console.log("[v0] Cielo sale responded with", res.status, errBody.slice(0, 500))
      return null
    }
    return await res.json()
  } catch (error) {
    console.log("[v0] Cielo request failed:", (error as Error).message)
    return null
  }
}

export async function createCardSale(input: {
  orderId: string
  amount: number
  installments: number
  cardNumber: string
  holder: string
  expiry: string // MM/YYYY or MM/YY
  cvv: string
}): Promise<CieloSaleResult | null> {
  if (!isCieloConfigured()) return null

  const [mm, yyRaw] = input.expiry.split("/").map((s) => s.trim())
  const yyyy = yyRaw?.length === 2 ? `20${yyRaw}` : yyRaw
  const data = await cieloPost({
    MerchantOrderId: input.orderId,
    Payment: {
      Type: "CreditCard",
      Amount: toCents(input.amount),
      Installments: Math.max(1, input.installments),
      Capture: true,
      CreditCard: {
        CardNumber: input.cardNumber.replace(/\s/g, ""),
        Holder: input.holder,
        ExpirationDate: `${mm}/${yyyy}`,
        SecurityCode: input.cvv,
        Brand: detectBrand(input.cardNumber),
      },
    },
  })
  if (!data?.Payment) return null
  return {
    status: mapStatus(Number(data.Payment.Status)),
    paymentId: String(data.Payment.PaymentId ?? ""),
  }
}

export async function createPixSale(input: {
  orderId: string
  amount: number
}): Promise<CieloSaleResult | null> {
  if (!isCieloConfigured()) return null

  const data = await cieloPost({
    MerchantOrderId: input.orderId,
    Payment: {
      Type: "Pix",
      Amount: toCents(input.amount),
    },
  })
  if (!data?.Payment) return null
  return {
    status: "pix-pending",
    paymentId: String(data.Payment.PaymentId ?? ""),
    pix: {
      qrCodeText: String(data.Payment.QrCodeString ?? ""),
      qrCodeBase64: data.Payment.QrCodeBase64Image
        ? `data:image/png;base64,${data.Payment.QrCodeBase64Image}`
        : undefined,
    },
  }
}

/** Poll a payment's current status (used to confirm a Pix payment). */
export async function queryPayment(paymentId: string): Promise<PaymentStatus | null> {
  if (!isCieloConfigured() || !paymentId) return null
  try {
    const res = await fetch(`${cieloBaseUrls().query}/1/sales/${paymentId}`, {
      method: "GET",
      headers: headers(),
      cache: "no-store",
    })
    if (!res.ok) {
      console.log("[v0] Cielo query responded with", res.status)
      return null
    }
    const data = await res.json()
    return mapStatus(Number(data?.Payment?.Status))
  } catch (error) {
    console.log("[v0] Cielo query failed:", (error as Error).message)
    return null
  }
}
