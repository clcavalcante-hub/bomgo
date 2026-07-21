import "server-only"

import https from "node:https"
import type { PaymentStatus } from "@/lib/types"

/**
 * Banco Inter Pix API adapter (API PJ — cobrança imediata via Pix).
 *
 * Auth is OAuth2 client_credentials PLUS mutual TLS: every call (including
 * the token request itself) must present the client certificate issued by
 * Inter, not just the client_id/secret. That's why this file uses Node's
 * `https` module directly with a custom Agent, instead of the global
 * `fetch` — client certs aren't something the standard fetch API exposes.
 *
 * Runs only on routes using the Node.js runtime (the Next.js default for
 * API routes — none of this repo's routes opt into the Edge runtime).
 *
 * Env vars required (set in Vercel → Project → Environment Variables):
 *   INTER_CLIENT_ID       — from the Inter Empresas API integration
 *   INTER_CLIENT_SECRET   — from the Inter Empresas API integration
 *   INTER_CERT_BASE64     — the .crt file, base64-encoded (whole file, no line breaks needed)
 *   INTER_KEY_BASE64      — the .key file, base64-encoded
 *   INTER_PIX_KEY         — the Pix key registered on the Inter account that receives payment
 *
 * Every call returns `null` on any failure (missing config, network error,
 * non-2xx response) so callers can fall back to an explicit error response —
 * mirrors the Cielo adapter's contract, never fabricates a fake success.
 */

const INTER_HOST = "cdpj.partners.bancointer.com.br"

interface InterCredentials {
  clientId: string
  clientSecret: string
  cert: string
  key: string
  pixKey: string
}

function credentialsFromEnv(): InterCredentials | null {
  const clientId = process.env.INTER_CLIENT_ID
  const clientSecret = process.env.INTER_CLIENT_SECRET
  const certB64 = process.env.INTER_CERT_BASE64
  const keyB64 = process.env.INTER_KEY_BASE64
  const pixKey = process.env.INTER_PIX_KEY
  if (!clientId || !clientSecret || !certB64 || !keyB64 || !pixKey) return null
  try {
    return {
      clientId,
      clientSecret,
      cert: Buffer.from(certB64, "base64").toString("utf8"),
      key: Buffer.from(keyB64, "base64").toString("utf8"),
      pixKey,
    }
  } catch {
    return null
  }
}

export function isInterConfigured(): boolean {
  return credentialsFromEnv() !== null
}

function mtlsRequest(
  creds: InterCredentials,
  options: { method: string; path: string; headers?: Record<string, string> },
  body?: string,
): Promise<{ status: number; json: any } | null> {
  return new Promise((resolve) => {
    const req = https.request(
      {
        host: INTER_HOST,
        port: 443,
        path: options.path,
        method: options.method,
        cert: creds.cert,
        key: creds.key,
        headers: {
          "Content-Type": "application/json",
          ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let raw = ""
        res.on("data", (chunk) => (raw += chunk))
        res.on("end", () => {
          const status = res.statusCode ?? 0
          if (status < 200 || status >= 300) {
            console.log("[v0] Inter API responded with", status, raw.slice(0, 500))
            resolve(null)
            return
          }
          try {
            resolve({ status, json: raw ? JSON.parse(raw) : {} })
          } catch {
            resolve(null)
          }
        })
      },
    )
    req.on("error", (error) => {
      console.log("[v0] Inter API request failed:", error.message)
      resolve(null)
    })
    if (body) req.write(body)
    req.end()
  })
}

// Simple module-scope token cache — good enough within a warm serverless
// instance; a cold start just re-fetches. Tokens last ~1h (`expires_in`).
let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(creds: InterCredentials): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value
  }
  const body = new URLSearchParams({
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    grant_type: "client_credentials",
    scope: "cob.write cob.read pix.write pix.read webhook.write webhook.read",
  }).toString()
  const res = await mtlsRequest(
    creds,
    {
      method: "POST",
      path: "/oauth/v2/token",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": String(Buffer.byteLength(body)) },
    },
    body,
  )
  if (!res?.json?.access_token) return null
  cachedToken = {
    value: res.json.access_token,
    expiresAt: Date.now() + (Number(res.json.expires_in) || 3300) * 1000,
  }
  return cachedToken.value
}

function generateTxid(): string {
  // Inter requires 26–35 alphanumeric characters, no separators.
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let out = ""
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function mapStatus(interStatus: string | undefined): PaymentStatus {
  if (interStatus === "CONCLUIDA") return "approved"
  if (interStatus === "ATIVA") return "pix-pending"
  // REMOVIDA_PELO_USUARIO_RECEBEDOR, REMOVIDA_PELO_PSP, or unknown
  return "declined"
}

export interface InterPixResult {
  status: PaymentStatus
  txid: string
  pixCopiaECola: string
}

/** Creates an immediate Pix charge ("cobrança imediata"). Amount in reais (not cents). */
export async function createInterPixCharge(input: {
  amount: number
  description: string
  expiresInSeconds?: number
}): Promise<InterPixResult | null> {
  const creds = credentialsFromEnv()
  if (!creds) return null
  const token = await getAccessToken(creds)
  if (!token) return null

  const txid = generateTxid()
  const body = JSON.stringify({
    calendario: { expiracao: input.expiresInSeconds ?? 900 },
    valor: { original: input.amount.toFixed(2) },
    chave: creds.pixKey,
    solicitacaoPagador: input.description.slice(0, 140),
  })
  const res = await mtlsRequest(
    creds,
    { method: "PUT", path: `/pix/v2/cob/${txid}`, headers: { Authorization: `Bearer ${token}` } },
    body,
  )
  if (!res?.json) return null
  return {
    status: mapStatus(res.json.status),
    txid: res.json.txid ?? txid,
    pixCopiaECola: res.json.pixCopiaECola ?? "",
  }
}

/** Queries the current status of a previously created charge, by txid. */
export async function queryInterPix(txid: string): Promise<PaymentStatus | null> {
  const creds = credentialsFromEnv()
  if (!creds) return null
  const token = await getAccessToken(creds)
  if (!token) return null

  const res = await mtlsRequest(
    creds,
    { method: "GET", path: `/pix/v2/cob/${txid}`, headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res?.json) return null
  return mapStatus(res.json.status)
}
