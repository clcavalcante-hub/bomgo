import type { Property, SearchCriteria } from '@/lib/types'
import { properties, partnerProperties } from '@/lib/data/properties'
import { sourceConfig } from '@/lib/config'

// -------------------------------------------------------------------------
// Search service (MOCK)
//
// Contract prepared for the real orchestration described in the spec:
//   1. Reserva Direta Bomgo  -> Stays availability API
//   2. Parceiros locais      -> partner feeds
//   3. Booking               -> deep links + CJ Affiliate
//   4. Expedia               -> deep links / future API
//
// Results are always ordered by source priority (Bomgo first), matching the
// "Hierarquia dos Resultados" rule. Swap the body of `searchProperties` for
// the real fan-out + merge later; the return type stays the same.
// -------------------------------------------------------------------------

export interface SearchResponse {
  criteria: SearchCriteria
  bomgo: Property[]
  partners: Property[]
  total: number
}

function matchesGuests(p: Property, criteria: SearchCriteria): boolean {
  const totalGuests = criteria.adults + criteria.children
  return totalGuests === 0 ? true : p.maxGuests >= totalGuests
}

export async function searchProperties(
  criteria: SearchCriteria,
): Promise<SearchResponse> {
  // Simulated latency so the loading experience can be exercised.
  await new Promise((r) => setTimeout(r, 500))

  const bomgo = properties
    .filter((p) => matchesGuests(p, criteria))
    .sort((a, b) => b.rating - a.rating)

  const partners = partnerProperties
    .filter((p) => matchesGuests(p, criteria))
    .sort(
      (a, b) => sourceConfig[a.source].priority - sourceConfig[b.source].priority,
    )

  return {
    criteria,
    bomgo,
    partners,
    total: bomgo.length + partners.length,
  }
}

export const defaultCriteria: SearchCriteria = {
  destination: 'Fortaleza · Porto das Dunas',
  checkIn: null,
  checkOut: null,
  adults: 2,
  children: 0,
  childrenAges: [],
  rooms: 1,
}

export function serializeCriteria(criteria: SearchCriteria): string {
  const params = new URLSearchParams()
  if (criteria.destination) params.set('destino', criteria.destination)
  if (criteria.checkIn) params.set('checkin', criteria.checkIn)
  if (criteria.checkOut) params.set('checkout', criteria.checkOut)
  params.set('adultos', String(criteria.adults))
  params.set('criancas', String(criteria.children))
  if (criteria.childrenAges.length)
    params.set('idades', criteria.childrenAges.join(','))
  params.set('quartos', String(criteria.rooms))
  return params.toString()
}

export function parseCriteria(
  params: URLSearchParams,
): SearchCriteria {
  const agesRaw = params.get('idades')
  return {
    destination: params.get('destino') ?? defaultCriteria.destination,
    checkIn: params.get('checkin'),
    checkOut: params.get('checkout'),
    adults: Number(params.get('adultos') ?? defaultCriteria.adults),
    children: Number(params.get('criancas') ?? 0),
    childrenAges: agesRaw ? agesRaw.split(',').map(Number).filter((n) => !Number.isNaN(n)) : [],
    rooms: Number(params.get('quartos') ?? 1),
  }
}
