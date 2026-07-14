import "server-only"

import type { Property, SearchCriteria } from "@/lib/types"
import { StaysAdapter, type StaysPrice, type StaysSearchFilter } from "@/lib/integrations/stays-adapter"
import {
  getStaysConnectionRegistry,
  type StaysConnection,
  type StaysConnectionRepository,
} from "@/lib/integrations/stays-connection-registry"

/**
 * StaysMultiAccountService — consolidates every active Stays connection into a
 * single Bomgo inventory.
 *
 * Search queries all active accounts in parallel; each account is isolated so
 * a slow or failing one (timeout, auth error, malformed payload) never blocks
 * or breaks the others. Results are normalized to the Bomgo `Property` shape,
 * de-duplicated (same physical unit listed in more than one account) and
 * sorted. Reservation-adjacent reads (price, listing content) are always routed
 * back to the exact connection that owns the listing.
 *
 * When no account is active/configured, every method returns `null`/empty so
 * the API routes transparently fall back to curated data.
 */

export interface PerAccountResult {
  connectionId: string
  connectionName: string
  ok: boolean
  count: number
  error?: string
}

export interface MultiAccountSearchResult {
  properties: Property[]
  live: boolean
  perAccount: PerAccountResult[]
}

export class StaysMultiAccountService {
  private readonly registry: StaysConnectionRepository

  constructor(registry: StaysConnectionRepository = getStaysConnectionRegistry()) {
    this.registry = registry
  }

  private async activeAdapters(): Promise<StaysAdapter[]> {
    const connections = await this.registry.listActive()
    return connections.map((c) => new StaysAdapter(c))
  }

  // -----------------------------------------------------------------------
  // Search — parallel across all active accounts
  // -----------------------------------------------------------------------

  async search(criteria: SearchCriteria): Promise<MultiAccountSearchResult> {
    const adapters = await this.activeAdapters()
    if (adapters.length === 0) {
      return { properties: [], live: false, perAccount: [] }
    }

    // Fan out. allSettled + per-adapter try/catch guarantees one bad account
    // cannot reject the whole batch.
    const settled = await Promise.allSettled(
      adapters.map(async (adapter) => {
        const list = await adapter.searchListings(criteria)
        return { adapter, list: list ?? [] }
      }),
    )

    const perAccount: PerAccountResult[] = []
    let collected: Property[] = []
    let anySuccess = false

    settled.forEach((outcome, index) => {
      const connection = adapters[index].connection
      if (outcome.status === "fulfilled") {
        anySuccess = true
        collected = collected.concat(outcome.value.list)
        perAccount.push({
          connectionId: connection.connectionId,
          connectionName: connection.connectionName,
          ok: true,
          count: outcome.value.list.length,
        })
      } else {
        perAccount.push({
          connectionId: connection.connectionId,
          connectionName: connection.connectionName,
          ok: false,
          count: 0,
          error: String(outcome.reason),
        })
      }
    })

    const properties = this.sort(this.dedupe(collected))
    // `live` means at least one real account answered (even with zero results).
    return { properties, live: anySuccess, perAccount }
  }

  /**
   * Remove the same physical unit appearing in more than one account. Keeps the
   * primary account's copy first, then the highest rated. The customer sees a
   * single clean listing regardless of how many accounts carry it.
   */
  private dedupe(properties: Property[]): Property[] {
    const byKey = new Map<string, Property>()
    for (const p of properties) {
      const key = this.dedupeKey(p)
      const existing = byKey.get(key)
      if (!existing) {
        byKey.set(key, p)
        continue
      }
      byKey.set(key, this.preferred(existing, p))
    }
    return Array.from(byKey.values())
  }

  private dedupeKey(p: Property): string {
    const norm = (v: string) =>
      v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim()
    return `${norm(p.name)}|${norm(p.location)}|${p.bedrooms}|${p.maxGuests}`
  }

  private preferred(a: Property, b: Property): Property {
    // Prefer the primary connection (partnerId === null), then higher rating.
    const aPrimary = a.origin?.partnerId == null
    const bPrimary = b.origin?.partnerId == null
    if (aPrimary !== bPrimary) return aPrimary ? a : b
    return b.rating > a.rating ? b : a
  }

  private sort(properties: Property[]): Property[] {
    return [...properties].sort((a, b) => b.rating - a.rating)
  }

  // -----------------------------------------------------------------------
  // Merged search filter (union across active accounts)
  // -----------------------------------------------------------------------

  async getSearchFilter(): Promise<StaysSearchFilter | null> {
    const adapters = await this.activeAdapters()
    if (adapters.length === 0) return null

    const settled = await Promise.allSettled(adapters.map((a) => a.getSearchFilter()))
    const filters = settled
      .filter((s): s is PromiseFulfilledResult<StaysSearchFilter | null> => s.status === "fulfilled")
      .map((s) => s.value)
      .filter((f): f is StaysSearchFilter => Boolean(f))

    if (filters.length === 0) return null

    const uniq = (values: string[]) => Array.from(new Set(values.filter(Boolean)))
    const amenities = Array.from(
      new Map(filters.flatMap((f) => f.amenities).map((a) => [a.id, a])).values(),
    )
    const properties = Array.from(
      new Map(filters.flatMap((f) => f.properties).map((p) => [p.id, p])).values(),
    )
    return {
      cities: uniq(filters.flatMap((f) => f.cities)),
      regions: uniq(filters.flatMap((f) => f.regions)),
      states: uniq(filters.flatMap((f) => f.states)),
      amenities,
      properties,
      minPrice: Math.min(...filters.map((f) => f.minPrice)),
      maxPrice: Math.max(...filters.map((f) => f.maxPrice)),
    }
  }

  // -----------------------------------------------------------------------
  // Owner resolution + routed reads
  // -----------------------------------------------------------------------

  /**
   * Find which active connection owns a listing. Queries active accounts in
   * parallel and returns the first that resolves the listing, so downstream
   * reservation/price/block calls always use the correct account.
   */
  async resolveConnectionForListing(externalListingId: string): Promise<StaysConnection | null> {
    const adapters = await this.activeAdapters()
    if (adapters.length === 0) return null

    const settled = await Promise.allSettled(
      adapters.map(async (adapter) => {
        const listing = await adapter.getListing(externalListingId)
        if (listing) return adapter.connection
        throw new Error("not-found")
      }),
    )
    for (const outcome of settled) {
      if (outcome.status === "fulfilled" && outcome.value) return outcome.value
    }
    return null
  }

  /** Full listing content, routed to the owning account. */
  async getListing(externalListingId: string): Promise<Property | null> {
    const adapters = await this.activeAdapters()
    if (adapters.length === 0) return null

    const settled = await Promise.allSettled(adapters.map((a) => a.getListing(externalListingId)))
    for (const outcome of settled) {
      if (outcome.status === "fulfilled" && outcome.value) return outcome.value
    }
    return null
  }

  /** Property-level content, routed to the owning account. */
  async getProperty(propertyId: string) {
    const adapters = await this.activeAdapters()
    if (adapters.length === 0) return null

    const settled = await Promise.allSettled(adapters.map((a) => a.getProperty(propertyId)))
    for (const outcome of settled) {
      if (outcome.status === "fulfilled" && outcome.value) return outcome.value
    }
    return null
  }

  /**
   * Real price for one or more listings. Listings may belong to different
   * accounts, so we ask every active account for the ids and merge whatever
   * each one recognizes — each listing is therefore priced by its owner.
   */
  async calculatePrice(input: {
    listingIds: string[]
    from: string
    to: string
    guests: number
    promocode?: string
  }): Promise<StaysPrice[] | null> {
    const adapters = await this.activeAdapters()
    if (adapters.length === 0) return null

    const settled = await Promise.allSettled(adapters.map((a) => a.calculatePrice(input)))
    const merged = new Map<string, StaysPrice>()
    let anySuccess = false
    for (const outcome of settled) {
      if (outcome.status === "fulfilled" && Array.isArray(outcome.value)) {
        anySuccess = true
        for (const price of outcome.value) {
          if (price.listingId && !merged.has(price.listingId)) merged.set(price.listingId, price)
        }
      }
    }
    if (!anySuccess) return null
    return Array.from(merged.values())
  }
}

// Singleton for the app to share.
let service: StaysMultiAccountService | null = null

export function getStaysMultiAccountService(): StaysMultiAccountService {
  if (!service) service = new StaysMultiAccountService()
  return service
}
