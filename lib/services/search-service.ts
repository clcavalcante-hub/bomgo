import type { Property, SearchCriteria } from "@/lib/types"
import { resolveDestinationInput } from "@/lib/data/destination-taxonomy"

// -------------------------------------------------------------------------
// Search service (client entry point)
//
// The heavy lifting now happens server-side in `app/api/search/route.ts`,
// which fans out to the real Stays API for "Reserva Direta Bomgo" and merges
// the partner feeds. Destination is a structured `DestinationSelection`
// (never a concatenated free-text string) resolved once here from the URL.
// -------------------------------------------------------------------------

export interface SearchResponse {
  criteria: SearchCriteria
  bomgo: Property[]
  partners: Property[]
  total: number
  live?: boolean
  requestId?: string
}

export class SearchRequestError extends Error {
  requestId?: string
  constructor(message: string, requestId?: string) {
    super(message)
    this.name = "SearchRequestError"
    this.requestId = requestId
  }
}

export async function searchProperties(criteria: SearchCriteria): Promise<SearchResponse> {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(criteria),
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message = body?.message ?? "Falha ao buscar acomodações"
    throw new SearchRequestError(message, body?.requestId)
  }
  return body as SearchResponse
}

export const defaultCriteria: SearchCriteria = {
  destination: null,
  checkIn: null,
  checkOut: null,
  adults: 2,
  children: 0,
  childrenAges: [],
  rooms: 1,
}

export function serializeCriteria(criteria: SearchCriteria): string {
  const params = new URLSearchParams()
  // Serializes the destination's stable label — parseCriteria re-resolves it
  // back into the same structured DestinationSelection via the taxonomy.
  // An intentionally cleared destination always writes the explicit "todos"
  // sentinel, never an omitted/empty param — some routers silently drop
  // empty query values, which would otherwise fall back to the default.
  params.set("destino", criteria.destination?.label || "todos")
  if (criteria.checkIn) params.set("checkin", criteria.checkIn)
  if (criteria.checkOut) params.set("checkout", criteria.checkOut)
  params.set("adultos", String(criteria.adults))
  params.set("criancas", String(criteria.children))
  if (criteria.childrenAges.length) params.set("idades", criteria.childrenAges.join(","))
  params.set("quartos", String(criteria.rooms))
  return params.toString()
}

export function parseCriteria(params: URLSearchParams): SearchCriteria {
  const agesRaw = params.get("idades")
  const destinoParam = params.get("destino")
  // "todos" is an explicit, robust sentinel meaning "no destination filter" —
  // safer than an empty destino= value, which some routers/links silently
  // drop from the URL, causing it to fall back to the default destination.
  const destination =
    destinoParam === "todos"
      ? null
      : params.has("destino")
        ? resolveDestinationInput(destinoParam)
        : defaultCriteria.destination
  return {
    destination,
    checkIn: params.get("checkin"),
    checkOut: params.get("checkout"),
    adults: Number(params.get("adultos") ?? defaultCriteria.adults),
    children: Number(params.get("criancas") ?? 0),
    childrenAges: agesRaw ? agesRaw.split(",").map(Number).filter((n) => !Number.isNaN(n)) : [],
    rooms: Number(params.get("quartos") ?? 1),
  }
}
