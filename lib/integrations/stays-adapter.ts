import "server-only"

import type { Amenity, Property, PropertyImage, SearchCriteria } from "@/lib/types"
import type { StaysConnection } from "@/lib/integrations/stays-connection-registry"

/**
 * StaysAdapter — one instance per Stays connection.
 *
 * Wraps the documented READ-ONLY Booking + Content endpoints for a single
 * account and normalizes every result into a Bomgo `Property`, attaching the
 * internal `origin` (connection id, partner, commission, etc.). It never runs
 * on the client and never writes/pays. Each request is guarded by a per-call
 * timeout and resolves to `null` on any auth/network/shape/timeout error so a
 * single failing account can never break the others.
 */

export interface StaysSearchFilter {
  cities: string[]
  regions: string[]
  states: string[]
  amenities: { id: string; label: string }[]
  properties: { id: string; name: string; city: string; region: string }[]
  minPrice: number
  maxPrice: number
}

export interface StaysPrice {
  listingId: string
  from: string
  to: string
  guests: number
  total: number // BRL
  currency: string
  feesIncluded: boolean
  fees: { label: string; value: number }[]
}

const DEFAULT_TIMEOUT_MS = 8000

export class StaysAdapter {
  readonly connection: StaysConnection
  private readonly timeoutMs: number

  constructor(connection: StaysConnection, timeoutMs = DEFAULT_TIMEOUT_MS) {
    this.connection = connection
    this.timeoutMs = timeoutMs
  }

  // -----------------------------------------------------------------------
  // Low-level HTTP (scoped to this connection's credentials)
  // -----------------------------------------------------------------------

  private authHeader(): string {
    const token = Buffer.from(`${this.connection.clientId}:${this.connection.clientSecret}`).toString("base64")
    return `Basic ${token}`
  }

  private baseUrl(): string {
    return this.connection.apiUrl.replace(/\/$/, "")
  }

  private async fetch<T>(path: string, init?: RequestInit): Promise<T | null> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const res = await fetch(`${this.baseUrl()}${path}`, {
        ...init,
        headers: {
          Authorization: this.authHeader(),
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(init?.headers ?? {}),
        },
        cache: "no-store",
        signal: controller.signal,
      })
      if (!res.ok) {
        console.log(`[v0] Stays[${this.connection.connectionId}] responded`, res.status, path)
        return null
      }
      return (await res.json()) as T
    } catch (error) {
      console.log(`[v0] Stays[${this.connection.connectionId}] request failed:`, (error as Error).message)
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  // -----------------------------------------------------------------------
  // Field helpers
  // -----------------------------------------------------------------------

  private pickMs(ms: unknown): string {
    if (!ms || typeof ms !== "object") return typeof ms === "string" ? ms : ""
    const obj = ms as Record<string, string>
    return obj.pt_BR ?? obj.en_US ?? obj.pt_PT ?? Object.values(obj)[0] ?? ""
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  private nightsBetween(from: string | null, to: string | null): number {
    if (!from || !to) return 1
    const ms = new Date(to).getTime() - new Date(from).getTime()
    const n = Math.round(ms / 86_400_000)
    return n > 0 ? n : 1
  }

  private brl(mc: unknown): number {
    if (!mc || typeof mc !== "object") return Number(mc) || 0
    return Number((mc as Record<string, number>).BRL ?? 0)
  }

  private slugify(value: string): string {
    return value
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  // -----------------------------------------------------------------------
  // Mapping raw Stays listing → Bomgo Property (with internal origin)
  // -----------------------------------------------------------------------

  private mapListing(raw: any, amenityMap: Map<string, string>, criteria?: SearchCriteria): Property | null {
    if (!raw || (!raw._id && !raw.id)) return null

    const shortId = String(raw.id ?? raw._id)
    const longId = String(raw._id ?? raw.id)

    const images: PropertyImage[] = []
    const mainUrl = raw?._t_mainImageMeta?.url
    if (mainUrl) images.push({ src: mainUrl, alt: this.pickMs(raw._mstitle) || "Acomodação Bomgo" })
    if (Array.isArray(raw?._t_imagesMeta)) {
      raw._t_imagesMeta.forEach((img: any) => {
        const src = img?.url ?? img?.src
        if (src && !images.some((i) => i.src === src)) {
          images.push({ src, alt: this.pickMs(raw._mstitle) || "Acomodação Bomgo" })
        }
      })
    }

    const amenities: Amenity[] = Array.isArray(raw?.amenities)
      ? raw.amenities.map((a: any) => {
          const id = String(a?._id ?? a?.id ?? a)
          const label = amenityMap.get(id) ?? this.pickMs(a?._mstitle) ?? id
          return { key: this.slugify(label || id), label }
        })
      : []

    const total = this.brl(raw?.bookingPrice?._mctotal)
    const nights = this.nightsBetween(
      raw?.bookingPrice?.from ?? criteria?.checkIn ?? null,
      raw?.bookingPrice?.to ?? criteria?.checkOut ?? null,
    )
    const nightlyPrice = total > 0 ? Math.round(total / nights) : 0
    const cleaningFee =
      (raw?.bookingPrice?.fees ?? []).reduce((sum: number, f: any) => sum + this.brl(f?._mcval), 0) || 0

    const description = this.stripHtml(this.pickMs(raw._msdesc))
    const typeName = this.pickMs(raw?._t_typeMeta?._mstitle) || "Apartamento"

    // Namespace the internal id so listing ids never collide across accounts.
    const internalPropertyId = `${this.connection.connectionId}:${longId}`

    return {
      id: longId,
      slug: this.slugify(shortId),
      name: this.pickMs(raw._mstitle) || raw.internalName || "Acomodação Bomgo",
      source: "bomgo",
      destination: raw?.address?.city ?? "",
      location: [raw?.address?.region, raw?.address?.city].filter(Boolean).join(", "),
      neighborhood: raw?.address?.region ?? "",
      type: typeName,
      summary: description.slice(0, 140),
      description,
      images,
      rating: Number(raw?.rating ?? 4.8),
      reviewsCount: Number(raw?.reviewsCount ?? 0),
      maxGuests: Number(raw?._i_maxGuests ?? raw?.maxGuests ?? 2),
      bedrooms: Number(raw?._i_rooms ?? raw?.bedrooms ?? 1),
      bathrooms: Number(raw?._f_bathrooms ?? raw?.bathrooms ?? 1),
      areaSqm: Number(raw?._f_square ?? 0),
      nightlyPrice,
      cleaningFee,
      energyFee: 0,
      badges: ["reserva-direta"],
      amenities,
      rules: [],
      featured: Boolean(raw?.featured),
      reviews: [],
      highlight: raw?.instantBooking ? "Reserva imediata confirmada na hora" : undefined,
      // Internal provenance — stripped before it reaches the client.
      origin: {
        internalPropertyId,
        externalListingId: longId,
        staysConnectionId: this.connection.connectionId,
        partnerId: this.connection.partnerId,
        sourceAccount: this.connection.connectionName,
        commissionRule: this.connection.commissionRule,
        directBookingEnabled: true,
        active: this.connection.active,
      },
    }
  }

  // -----------------------------------------------------------------------
  // Search filter (GET /booking/searchfilter)
  // -----------------------------------------------------------------------

  async getSearchFilter(): Promise<StaysSearchFilter | null> {
    const raw = await this.fetch<any>("/external/v1/booking/searchfilter")
    if (!raw) return null
    return {
      cities: (raw.cities ?? []).map((c: any) => String(c?.val ?? "")).filter(Boolean),
      regions: (raw.regions ?? []).map((r: any) => String(r?.val ?? "")).filter(Boolean),
      states: (raw.states ?? []).map((s: any) => String(s?.val ?? "")).filter(Boolean),
      amenities: (raw.amenities ?? []).map((a: any) => ({
        id: String(a?._id ?? ""),
        label: this.pickMs(a?._mstitle),
      })),
      properties: (raw.properties ?? []).map((p: any) => ({
        id: String(p?._id ?? p?.id ?? ""),
        name: p?.internalName ?? this.pickMs(p?._mstitle),
        city: p?.address?.city ?? "",
        region: p?.address?.region ?? "",
      })),
      minPrice: this.brl(raw.minprice),
      maxPrice: this.brl(raw.maxprice) || 10000,
    }
  }

  private async amenityLabelMap(): Promise<Map<string, string>> {
    const filter = await this.getSearchFilter()
    const map = new Map<string, string>()
    filter?.amenities.forEach((a) => map.set(a.id, a.label))
    return map
  }

  private cityFromDestination(destination: string | undefined): string | null {
    if (!destination) return null
    const first = destination.split(/[·,|-]/)[0]?.trim()
    return first || null
  }

  // -----------------------------------------------------------------------
  // Search listings (POST /booking/search-listings)
  // -----------------------------------------------------------------------

  async searchListings(criteria: SearchCriteria): Promise<Property[] | null> {
    const guests = criteria.adults + criteria.children
    const body: Record<string, unknown> = { guests: guests > 0 ? guests : 1, skip: 0, limit: 20 }
    if (criteria.checkIn) body.from = criteria.checkIn
    if (criteria.checkOut) body.to = criteria.checkOut
    const city = this.cityFromDestination(criteria.destination)
    if (city) body.cities = [city]

    const data = await this.fetch<any>("/external/v1/booking/search-listings", {
      method: "POST",
      body: JSON.stringify(body),
    })
    if (!data) return null

    const listings: any[] = Array.isArray(data) ? data : (data.listings ?? data.results ?? [])
    const amenityMap = await this.amenityLabelMap()
    return listings
      .map((l) => this.mapListing(l, amenityMap, criteria))
      .filter((p): p is Property => Boolean(p))
  }

  // -----------------------------------------------------------------------
  // Calculate price (POST /booking/calculate-price)
  // -----------------------------------------------------------------------

  async calculatePrice(input: {
    listingIds: string[]
    from: string
    to: string
    guests: number
    promocode?: string
  }): Promise<StaysPrice[] | null> {
    const body: Record<string, unknown> = {
      listingIds: input.listingIds,
      from: input.from,
      to: input.to,
      guests: input.guests > 0 ? input.guests : 1,
    }
    if (input.promocode) body.promocode = input.promocode

    const data = await this.fetch<any[]>("/external/v1/booking/calculate-price", {
      method: "POST",
      body: JSON.stringify(body),
    })
    if (!Array.isArray(data)) return null

    return data.map((row) => ({
      listingId: String(row?._idlisting ?? ""),
      from: String(row?.from ?? input.from),
      to: String(row?.to ?? input.to),
      guests: Number(row?.guests ?? input.guests),
      total: this.brl(row?._mctotal),
      currency: String(row?.mainCurrency ?? "BRL"),
      feesIncluded: Boolean(row?.feesIncluded),
      fees: (row?.fees ?? []).map((f: any) => ({ label: this.pickMs(f?._mstitle), value: this.brl(f?._mcval) })),
    }))
  }

  // -----------------------------------------------------------------------
  // Content API (GET /content/listings/{id}, /content/properties/{id})
  // -----------------------------------------------------------------------

  async getListing(listingId: string): Promise<Property | null> {
    const data = await this.fetch<any>(`/external/v1/content/listings/${encodeURIComponent(listingId)}`)
    if (!data) return null
    const amenityMap = await this.amenityLabelMap()
    return this.mapListing(data, amenityMap)
  }

  async getProperty(propertyId: string): Promise<{
    id: string
    name: string
    description: string
    city: string
    region: string
    images: PropertyImage[]
  } | null> {
    const raw = await this.fetch<any>(`/external/v1/content/properties/${encodeURIComponent(propertyId)}`)
    if (!raw) return null
    const name = raw.internalName || this.pickMs(raw._mstitle)
    const images: PropertyImage[] = Array.isArray(raw?._t_imagesMeta)
      ? raw._t_imagesMeta.map((img: any) => ({ src: img?.url ?? img?.src ?? "", alt: name })).filter((i: PropertyImage) => i.src)
      : []
    return {
      id: String(raw._id ?? raw.id ?? propertyId),
      name,
      description: this.stripHtml(this.pickMs(raw._msdesc)),
      city: raw?.address?.city ?? "",
      region: raw?.address?.region ?? "",
      images,
    }
  }
}
