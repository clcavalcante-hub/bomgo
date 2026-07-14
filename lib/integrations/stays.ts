import "server-only"

import type { Property, SearchCriteria } from "@/lib/types"
import { getStaysMultiAccountService } from "@/lib/integrations/stays-multi-account"
import type { StaysPrice, StaysSearchFilter } from "@/lib/integrations/stays-adapter"

/**
 * Public Stays facade.
 *
 * This is the ONLY module the API routes import. It keeps the exact same
 * function/type surface as before, but every call now delegates to the
 * multi-account service, which consolidates the Bomgo primary account plus all
 * active partner accounts (Beach Living, Verdefan, and any future one).
 *
 * The single-account era is gone: there is no module-level credential here.
 * Connections live in the server-only registry; secrets never leave the server
 * and the internal `origin` is stripped before search results reach the client.
 */

export type { StaysSearchFilter, StaysPrice }

/** Consolidated availability across every active account (origin preserved). */
export async function searchStays(criteria: SearchCriteria, requestId?: string): Promise<Property[] | null> {
  const { properties, live } = await getStaysMultiAccountService().search(criteria, requestId)
  return live ? properties : null
}

/** Merged search filter (union of cities/regions/amenities across accounts). */
export async function getStaysSearchFilter(): Promise<StaysSearchFilter | null> {
  return getStaysMultiAccountService().getSearchFilter()
}

/** Real price, routed to each listing's owning account. */
export async function calculateStaysPrice(input: {
  listingIds: string[]
  from: string
  to: string
  guests: number
  promocode?: string
}): Promise<StaysPrice[] | null> {
  return getStaysMultiAccountService().calculatePrice(input)
}

/** Full listing content, routed to the owning account. */
export async function getStaysListing(listingId: string): Promise<Property | null> {
  return getStaysMultiAccountService().getListing(listingId)
}

/** Resolve a listing by its public URL slug across every active account. */
export async function getStaysListingBySlug(slug: string, requestId?: string): Promise<Property | null> {
  return getStaysMultiAccountService().getListingBySlug(slug, requestId)
}

/** Property-level content, routed to the owning account. */
export async function getStaysProperty(propertyId: string) {
  return getStaysMultiAccountService().getProperty(propertyId)
}

/**
 * Remove internal provenance before a property is serialized to the browser.
 * The customer must never see which Stays account a listing came from.
 */
export function stripOrigin(property: Property): Property {
  const { origin, ...rest } = property
  void origin
  return rest
}
