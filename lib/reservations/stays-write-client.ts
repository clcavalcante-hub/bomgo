import "server-only"

import { reservationConfig } from "@/lib/integrations/config"
import type { StaysConnection } from "@/lib/integrations/stays-connection-registry"

/**
 * Shared write client for Stays Booking endpoints.
 *
 * Centralizes Basic auth, per-call timeout and a controlled retry budget for
 * the mutating client/reservation adapters. Retries only idempotent-safe
 * failures (network/timeout/5xx); 4xx responses are returned immediately so
 * business errors (e.g. validation) are not retried. Secrets never leave the
 * server.
 */

export interface StaysWriteResult<T> {
  ok: boolean
  status: number
  data: T | null
  error?: string
  attempts: number
}

interface StaysWriteRequest {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  path: string
  body?: unknown
}

function authHeader(connection: StaysConnection): string {
  // HTTP Basic Authentication: Authorization: Basic base64(login:password).
  const token = Buffer.from(`${connection.login}:${connection.password}`).toString("base64")
  return `Basic ${token}`
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function staysWrite<T>(
  connection: StaysConnection,
  request: StaysWriteRequest,
): Promise<StaysWriteResult<T>> {
  const { requestTimeoutMs, maxRetries } = reservationConfig
  const url = `${connection.apiUrl.replace(/\/$/, "")}${request.path}`
  let attempts = 0
  let lastError = ""

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs)
    try {
      const res = await fetch(url, {
        method: request.method,
        headers: {
          Authorization: authHeader(connection),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: request.body != null ? JSON.stringify(request.body) : undefined,
        cache: "no-store",
        signal: controller.signal,
      })

      // Client errors are terminal — retrying won't help and could duplicate.
      if (res.status >= 400 && res.status < 500) {
        const text = await res.text().catch(() => "")
        console.log(`[v0] Stays[${connection.connectionId}] ${request.method} ${request.path} -> ${res.status}`)
        return { ok: false, status: res.status, data: null, error: text || `HTTP ${res.status}`, attempts }
      }

      // Server errors are retryable.
      if (res.status >= 500) {
        lastError = `HTTP ${res.status}`
        if (attempt < maxRetries) {
          await sleep(250 * (attempt + 1))
          continue
        }
        return { ok: false, status: res.status, data: null, error: lastError, attempts }
      }

      const data = (await res.json().catch(() => null)) as T | null
      return { ok: true, status: res.status, data, attempts }
    } catch (error) {
      // Network error or timeout (AbortError) — retryable.
      lastError = (error as Error).message
      console.log(`[v0] Stays[${connection.connectionId}] ${request.method} ${request.path} failed: ${lastError}`)
      if (attempt < maxRetries) {
        await sleep(250 * (attempt + 1))
        continue
      }
      return { ok: false, status: 0, data: null, error: lastError, attempts }
    } finally {
      clearTimeout(timer)
    }
  }

  return { ok: false, status: 0, data: null, error: lastError || "unknown", attempts }
}
