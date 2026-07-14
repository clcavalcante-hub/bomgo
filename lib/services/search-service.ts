import type { Property, SearchCriteria } from "@/lib/types"

// -------------------------------------------------------------------------
// Search service (client entry point)
//
// The heavy lifting now happens server-side in `app/api/search/route.ts`,
// which fans out to the real Stays API for "Reserva Direta Bomgo" and merges
// the partner feeds (locais + Booking + Expedia), always ordering Bomgo
// first per the "Hierarquia dos Resultados" rule. If Stays isn't configured
// or fails, the route transparently falls back to curated data — so this
// contract and the UI never change.
// -------------------------------------------------------------------------

export interface SearchResponse {
  criteria: SearchCriteria
  bomgo: Property[]
  partners: Property[]
  total: number
  live?: boolean
}

export async function searchProperties(criteria: SearchCriteria): Promise<SearchResponse> {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(criteria),
  })
  if (!res.ok) throw new Error("Falha ao buscar acomodações")
  return (await res.json()) as SearchResponse
}

export const defaultCriteria: SearchCriteria = {
  destination: "Fortaleza · Porto das Dunas",
  checkIn: null,
  checkOut: null,
  adults: 2,
  children: 0,
  childrenAges: [],
  rooms: 1,
}

export function serializeCriteria(criteria: SearchCriteria): string {
  const params = new URLSearchParams()
  if (criteria.destination) params.set("destino", criteria.destination)
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
  return {
    destination: params.get("destino") ?? defaultCriteria.destination,
    checkIn: params.get("checkin"),
    checkOut: params.get("checkout"),
    adults: Number(params.get("adultos") ?? defaultCriteria.adults),
    children: Number(params.get("criancas") ?? 0),
    childrenAges: agesRaw ? agesRaw.split(",").map(Number).filter((n) => !Number.isNaN(n)) : [],
    rooms: Number(params.get("quartos") ?? 1),
  }
}
