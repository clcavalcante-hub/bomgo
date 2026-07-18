import "server-only"

import { cieloBaseUrls } from "@/lib/integrations/config"
import type { CieloCredentials } from "@/lib/integrations/cielo-connection-registry"
import { detectCardBrand } from "@/lib/card-brand"
import type { PaymentStatus } from "@/lib/types"

/**
 * Cielo eCommerce API 3.0 adapter.
 *
 * Every call takes an explicit `CieloCredentials` — the caller (payment
 * route) resolves WHICH merchant account to use per reservation (via
 * cieloCredentialsForConnection), so a partner's booking is always charged
 * on the partner's own Cielo account, never Bomgo's.
 *
 * Amounts are always sent in cents (integer). Card data flows straight to
 * Cielo and is never persisted by us. Every call is defensive and returns
 * `null` on failure so the payment route can fall back to a simulation.
 * `server-only` guarantees the MerchantKey never reaches the browser.
 */

function isConfigured(creds: CieloCredentials): boolean {
  return Boolean(creds.merchantId && creds.merchantKey)
}

function toCents(amount: number): number {
  return Math.round(amount * 100)
}

function headers(creds: CieloCredentials) {
  return {
    "Content-Type": "application/json",
    MerchantId: creds.merchantId,
    MerchantKey: creds.merchantKey,
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

async function cieloPost(creds: CieloCredentials, body: unknown): Promise<any | null> {
  try {
    const res = await fetch(`${cieloBaseUrls().transaction}/1/sales/`, {
      method: "POST",
      headers: headers(creds),
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

export async function createCardSale(
  creds: CieloCredentials,
  input: {
    orderId: string
    amount: number
    installments: number
    cardNumber: string
    holder: string
    expiry: string // MM/YYYY or MM/YY
    cvv: string
  },
): Promise<CieloSaleResult | null> {
  if (!isConfigured(creds)) return null

  const [mm, yyRaw] = input.expiry.split("/").map((s) => s.trim())
  const yyyy = yyRaw?.length === 2 ? `20${yyRaw}` : yyRaw
  const data = await cieloPost(creds, {
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
        Brand: detectCardBrand(input.cardNumber),
      },
    },
  })
  if (!data?.Payment) return null
  return {
    status: mapStatus(Number(data.Payment.Status)),
    paymentId: String(data.Payment.PaymentId ?? ""),
  }
}

/**
 * Google Pay via Cielo — consumes the encrypted payment token the Google Pay
 * JS API returns (gateway: "cielo" in tokenizationSpecification). Cielo API
 * 3.0 accepts it as a CreditCard sale with the raw Google Pay token passed
 * through instead of a card number.
 *
 * NOTE: field names below (`Wallet.Type` / `Wallet.GooglePayToken`) are our
 * best-effort match to Cielo's documented Google Pay contract — confirm
 * against a real sandbox/production response before trusting this with
 * real charges. If Cielo rejects the shape, the response body (now logged
 * in cieloPost) will show the exact validation error.
 */
export async function createGooglePaySale(
  creds: CieloCredentials,
  input: {
    orderId: string
    amount: number
    installments: number
    googlePayToken: string // raw JSON string from paymentMethodData.tokenizationData.token
  },
): Promise<CieloSaleResult | null> {
  if (!isConfigured(creds)) return null

  const data = await cieloPost(creds, {
    MerchantOrderId: input.orderId,
    Payment: {
      Type: "CreditCard",
      Amount: toCents(input.amount),
      Installments: Math.max(1, input.installments),
      Capture: true,
      Wallet: {
        Type: "GooglePay",
        GooglePayToken: input.googlePayToken,
      },
    },
  })
  if (!data?.Payment) return null
  return {
    status: mapStatus(Number(data.Payment.Status)),
    paymentId: String(data.Payment.PaymentId ?? ""),
  }
}

export async function createPixSale(
  creds: CieloCredentials,
  input: {
    orderId: string
    amount: number
  },
): Promise<CieloSaleResult | null> {
  if (!isConfigured(creds)) return null

  const data = await cieloPost(creds, {
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
export async function queryPayment(creds: CieloCredentials, paymentId: string): Promise<PaymentStatus | null> {
  if (!isConfigured(creds) || !paymentId) return null
  try {
    const res = await fetch(`${cieloBaseUrls().query}/1/sales/${paymentId}`, {
      method: "GET",
      headers: headers(creds),
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
