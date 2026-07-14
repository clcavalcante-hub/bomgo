import "server-only"

import type { Property } from "@/lib/types"
import { defaultCriteria } from "@/lib/services/search-service"
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

/** Top-rated live listings for the homepage "seleção especial" section. */
export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
  if (!isStaysConfigured()) return []
  const results = await searchStays(defaultCriteria)
  if (!results) return []
  return results.slice(0, limit).map(stripOrigin)
}

/** Resolves a single live listing by the public slug used in `/imovel/[slug]` and `/checkout/[slug]`. */
export async function getLiveListingBySlug(slug: string): Promise<Property | null> {
  if (!isStaysConfigured()) return null
  const listing = await getStaysListingBySlug(slug)
  return listing ? stripOrigin(listing) : null
}
