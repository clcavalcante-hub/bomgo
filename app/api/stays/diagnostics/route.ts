import "server-only"

import { NextResponse } from "next/server"
import { getStaysConnectionRegistry } from "@/lib/integrations/stays-connection-registry"

/**
 * Server-only read-only diagnostics for the PRIMARY Stays connection.
 *
 * Validates HTTP Basic Auth and the three read endpoints:
 *   - GET  /external/v1/booking/searchfilter
 *   - POST /external/v1/booking/search-listings
 *   - POST /external/v1/booking/calculate-price
 *
 * It NEVER returns or logs the login, password or Authorization header — only
 * booleans, HTTP status codes, counts and sanitized error text. No reservation,
 * calendar, client or price write is performed.
 */

const TIMEOUT_MS = 12000

type EndpointReport = {
  endpoint: string
  method: string
  ok: boolean
  status: number | null
  ms: number
  detail: string
}

function authHeader(login: string, password: string): string {
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`
}

function sanitize(text: string): string {
  // Defensive: never echo anything that could resemble a credential header.
  return text.replace(/Basic\s+[A-Za-z0-9+/=]+/g, "Basic ***").slice(0, 300)
}

async function call(
  url: string,
  method: "GET" | "POST",
  header: string,
  body?: unknown,
): Promise<{ status: number | null; ok: boolean; json: any; ms: number; detail: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const started = Date.now()
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: header,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    })
    const ms = Date.now() - started
    let json: any = null
    let raw = ""
    try {
      raw = await res.text()
      json = raw ? JSON.parse(raw) : null
    } catch {
      // keep raw text for the detail if it's not JSON
    }
    const detail = res.ok
      ? "OK"
      : sanitize(typeof json?.message === "string" ? json.message : raw || res.statusText)
    return { status: res.status, ok: res.ok, json, ms, detail }
  } catch (error) {
    const ms = Date.now() - started
    const msg = (error as Error).name === "AbortError" ? `timeout após ${TIMEOUT_MS}ms` : (error as Error).message
    return { status: null, ok: false, json: null, ms, detail: sanitize(msg) }
  } finally {
    clearTimeout(timer)
  }
}

export async function GET() {
  const registry = getStaysConnectionRegistry()
  const connection = await registry.getPrimary()

  if (!connection) {
    return NextResponse.json({ ok: false, reason: "no-primary-connection" }, { status: 500 })
  }

  const hasCredentials = Boolean(connection.apiUrl && connection.login && connection.password)
  let apiHost = ""
  try {
    apiHost = connection.apiUrl ? new URL(connection.apiUrl).host : ""
  } catch {
    apiHost = "(url inválida)"
  }

  const connectionReport = {
    connectionId: connection.connectionId,
    connectionName: connection.connectionName,
    apiHost, // host only, never the full credentialed request
    hasUrl: Boolean(connection.apiUrl),
    hasLogin: Boolean(connection.login),
    hasPassword: Boolean(connection.password),
    active: connection.active,
  }

  if (!hasCredentials) {
    return NextResponse.json({
      ok: false,
      connection: connectionReport,
      mode: "simulated",
      reason: "missing-credentials",
      message:
        "Credenciais incompletas. Configure STAYS_API_URL, STAYS_API_LOGIN e STAYS_API_PASSWORD. Fallback simulado mantido.",
    })
  }

  const header = authHeader(connection.login, connection.password)
  const base = connection.apiUrl.replace(/\/$/, "")
  const endpoints: EndpointReport[] = []

  // 1) GET /searchfilter — also validates auth.
  const filter = await call(`${base}/external/v1/booking/searchfilter`, "GET", header)
  const filterCounts = filter.ok
    ? {
        cities: Array.isArray(filter.json?.cities) ? filter.json.cities.length : 0,
        regions: Array.isArray(filter.json?.regions) ? filter.json.regions.length : 0,
        amenities: Array.isArray(filter.json?.amenities) ? filter.json.amenities.length : 0,
        properties: Array.isArray(filter.json?.properties) ? filter.json.properties.length : 0,
      }
    : null
  endpoints.push({
    endpoint: "/external/v1/booking/searchfilter",
    method: "GET",
    ok: filter.ok,
    status: filter.status,
    ms: filter.ms,
    detail: filterCounts ? `filtros: ${JSON.stringify(filterCounts)}` : filter.detail,
  })

  const authOk = filter.status !== 401 && filter.status !== 403

  // 2) POST /search-listings — 30-day window, 2 guests.
  const from = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10)
  const to = new Date(Date.now() + 33 * 86_400_000).toISOString().slice(0, 10)
  const listings = await call(`${base}/external/v1/booking/search-listings`, "POST", header, {
    from,
    to,
    guests: 2,
    skip: 0,
    limit: 20,
  })
  const listingArray: any[] = Array.isArray(listings.json)
    ? listings.json
    : (listings.json?.listings ?? listings.json?.results ?? [])
  const sampleListingId =
    listingArray.length > 0 ? String(listingArray[0]?.id ?? listingArray[0]?._id ?? "") : null

  // Raw address sample — helps diagnose destination-filter mismatches
  // (e.g. our taxonomy says city:"Aquiraz" but Stays' real field differs).
  // Never used for filtering, read-only diagnostic.
  const addressSample = listingArray.slice(0, 8).map((l) => ({
    id: l?.id ?? l?._id ?? null,
    internalName: l?.internalName ?? null,
    city: l?.address?.city ?? null,
    district: l?.address?.district ?? null,
    region: l?.address?.region ?? null,
    neighborhood: l?.address?.neighborhood ?? null,
  }))

  // Full raw address object + any top-level geo-ish field, for ONE listing —
  // so we can see the real coordinate field name instead of guessing at it.
  // Read-only diagnostic, never used for filtering/display.
  const rawAddressDump = listingArray[0]
    ? {
        address: listingArray[0]?.address ?? null,
        geoTopLevelKeys: Object.keys(listingArray[0]).filter((k) =>
          /lat|lng|lon|geo|coord/i.test(k),
        ),
        latLngValue: listingArray[0]?.latLng ?? null,
        addressKeys: listingArray[0]?.address ? Object.keys(listingArray[0].address) : [],
      }
    : null

  endpoints.push({
    endpoint: "/external/v1/booking/search-listings",
    method: "POST",
    ok: listings.ok,
    status: listings.status,
    ms: listings.ms,
    detail: listings.ok ? `imóveis retornados: ${listingArray.length}` : listings.detail,
  })

  // 3) POST /calculate-price — only if we have a listing id to price.
  let priceReport: EndpointReport
  if (sampleListingId) {
    const price = await call(`${base}/external/v1/booking/calculate-price`, "POST", header, {
      from,
      to,
      listingIds: [sampleListingId],
      guests: 2,
    })
    const priceRow = Array.isArray(price.json) ? price.json[0] : null
    const total = priceRow?._mctotal?.BRL ?? null
    priceReport = {
      endpoint: "/external/v1/booking/calculate-price",
      method: "POST",
      ok: price.ok && Array.isArray(price.json),
      status: price.status,
      ms: price.ms,
      detail: price.ok ? `total BRL: ${total ?? "n/d"} (listing ${sampleListingId})` : price.detail,
    }
  } else {
    priceReport = {
      endpoint: "/external/v1/booking/calculate-price",
      method: "POST",
      ok: false,
      status: null,
      ms: 0,
      detail: "pulado: nenhum listingId disponível vindo de search-listings",
    }
  }
  endpoints.push(priceReport)

  const readsOk = filter.ok && listings.ok
  const mode = authOk && readsOk ? "live" : "simulated"

  return NextResponse.json({
    ok: authOk && readsOk,
    connection: connectionReport,
    auth: {
      ok: authOk,
      status: filter.status,
      detail: authOk ? "Basic Auth aceito" : "credenciais recusadas (401/403)",
    },
    endpoints,
    listingsFound: listingArray.length,
    addressSample,
    rawAddressDump,
    mode,
    recommendation:
      mode === "live"
        ? "Conexão real ativa: a conta principal usa dados reais da Stays; fallback simulado desativado automaticamente para ela."
        : "Conexão real indisponível: fallback simulado mantido. Verifique os endpoints acima.",
  })
}
