import { NextResponse } from "next/server"
import type { Property, SearchCriteria } from "@/lib/types"
import { properties, partnerProperties } from "@/lib/data/properties"
import { sourceConfig } from "@/lib/config"
import { searchStays, stripOrigin } from "@/lib/integrations/stays"

export interface SearchResponse {
  criteria: SearchCriteria
  bomgo: Property[]
  partners: Property[]
  total: number
  live: boolean // true when Bomgo inventory came from the real Stays API
}

function matchesGuests(p: Property, criteria: SearchCriteria): boolean {
  const totalGuests = criteria.adults + criteria.children
  return totalGuests === 0 ? true : p.maxGuests >= totalGuests
}

export async function POST(request: Request) {
  const criteria = (await request.json()) as SearchCriteria

  // 1. Reserva Direta Bomgo — consolidated across all active Stays accounts.
  //    `origin` is stripped so the client can never tell which account a
  //    listing came from; the server keeps routing internally by connection.
  const liveBomgo = await searchStays(criteria)
  const bomgo = (liveBomgo && liveBomgo.length > 0 ? liveBomgo : properties)
    .filter((p) => matchesGuests(p, criteria))
    .sort((a, b) => b.rating - a.rating)
    .map(stripOrigin)

  // 2. Parceiros (locais + Booking + Expedia via deep links) — curated feed.
  const partners = partnerProperties
    .filter((p) => matchesGuests(p, criteria))
    .sort((a, b) => sourceConfig[a.source].priority - sourceConfig[b.source].priority)

  const response: SearchResponse = {
    criteria,
    bomgo,
    partners,
    total: bomgo.length + partners.length,
    live: Boolean(liveBomgo && liveBomgo.length > 0),
  }

  return NextResponse.json(response)
}
