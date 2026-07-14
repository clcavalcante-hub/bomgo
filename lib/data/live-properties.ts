import "server-only"

import type { Property, SearchCriteria } from "@/lib/types"
import { getStaysListingBySlug, searchStays, stripOrigin } from "@/lib/integrations/stays"
import { isStaysConfigured } from "@/lib/integrations/config"

/**
 * Server-only reads of real Stays inventory for pages that used to render
 * the curated `lib/data/properties.ts` catalog (home highlights, property
 * page, checkout). There is no mock fallback here on purpose: when Stays is
 * not configured, or a lookup genuinely fails, these return `null`/`[]` and
 * the caller shows an honest empty/not-found state instead of fabricated
 * content.
 */

// No destination filter: the homepage highlights whatever is actually
// configured in the connected Stays account(s), never a specific
// neighborhood. `defaultCriteria` from search-service.ts scopes the
// `/busca` page's initial view to "Porto das Dunas, Aquiraz" — reusing it
// here would hide every real listing outside that one bairro.
const FEATURED_CRITERIA: SearchCriteria = {
  destination: null,
  checkIn: null,
  checkOut: null,
  adults: 2,
  children: 0,
  childrenAges: [],
  rooms: 1,
}

/** Top-rated live listings for the homepage "seleção especial" section. */
export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
  if (!isStaysConfigured()) return []
  // searchStays() already returns results sorted by rating (desc).
  const results = await searchStays(FEATURED_CRITERIA)
  if (!results) return []
  return results.slice(0, limit).map(stripOrigin)
}

/** Resolves a single live listing by the public slug used in `/imovel/[slug]` and `/checkout/[slug]`. */
export async function getLiveListingBySlug(slug: string): Promise<Property | null> {
  if (!isStaysConfigured()) return null
  const listing = await getStaysListingBySlug(slug)
  return listing ? stripOrigin(listing) : null
}
