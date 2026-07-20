import "server-only"

import type { Amenity, Property, PropertyImage, SearchCriteria } from "@/lib/types"
import type { StaysConnection } from "@/lib/integrations/stays-connection-registry"
import { filterByDestinationRegion } from "@/lib/data/destination-taxonomy"
import { formatPropertyTitle } from "@/lib/text/property-title"
import { sanitizeDescriptionText } from "@/lib/text/property-description"
import { formatPlaceName } from "@/lib/text/place-name"

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
    // HTTP Basic Authentication: Authorization: Basic base64(login:password).
    const token = Buffer.from(`${this.connection.login}:${this.connection.password}`).toString("base64")
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

  /**
   * Stays' `/booking/search-listings` requires a `from`/`to` window — real
   * accounts reject (or return nothing for) a dateless "browse everything"
   * call. The customer's own chosen dates always take priority; when they
   * haven't picked any yet (home, "imóveis em destaque", the initial /busca
   * view before the calendar is touched), we default to a near-future
   * 3-night window so real availability and pricing are still shown instead
   * of an empty/failed search.
   */
  private resolveSearchWindow(criteria: SearchCriteria): { from: string; to: string } {
    if (criteria.checkIn && criteria.checkOut) return { from: criteria.checkIn, to: criteria.checkOut }
    const from = new Date()
    from.setUTCDate(from.getUTCDate() + 14)
    const to = new Date(from)
    to.setUTCDate(to.getUTCDate() + 3)
    const iso = (d: Date) => d.toISOString().slice(0, 10)
    return { from: iso(from), to: iso(to) }
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

    const description = sanitizeDescriptionText(this.stripHtml(this.pickMs(raw._msdesc)))
    const houseRules = this.stripHtml(this.pickMs(raw._mshouserules))
    const typeName = this.pickMs(raw?._t_typeMeta?._mstitle) || "Apartamento"

    // Stays' real address field for bairro is `district`. Some accounts may
    // expose it as `region` or `neighborhood` instead — try in that order,
    // but never invent a value that isn't present in the raw address.
    const district = formatPlaceName(raw?.address?.district ?? raw?.address?.region ?? raw?.address?.neighborhood ?? "")
    const city = formatPlaceName(raw?.address?.city ?? "")
    const street = formatPlaceName(raw?.address?.street ?? "")
    const streetNumber = raw?.address?.streetNumber ?? ""
    const fullAddress =
      [street && streetNumber ? `${street}, ${streetNumber}` : street, district, city].filter(Boolean).join(" — ") ||
      null
    // Coordinates live at raw.latLng._f_lat / raw.latLng._f_lng (confirmed via
    // diagnostics — NOT under raw.address, and not the generic lat/lng names
    // tried before). Kept as a fallback chain in case other Stays accounts
    // expose it differently. Never fabricated: null when nothing real is present.
    const rawLat = raw?.latLng?._f_lat ?? raw?.address?.lat ?? raw?.lat
    const rawLng = raw?.latLng?._f_lng ?? raw?.address?.lng ?? raw?.lng
    const latitude = rawLat != null && !Number.isNaN(Number(rawLat)) ? Number(rawLat) : null
    const longitude = rawLng != null && !Number.isNaN(Number(rawLng)) ? Number(rawLng) : null

    // Namespace the internal id so listing ids never collide across accounts.
    const internalPropertyId = `${this.connection.connectionId}:${longId}`

    return {
      id: longId,
      code: shortId,
      slug: this.slugify(shortId),
      name: formatPropertyTitle(this.pickMs(raw._mstitle) || raw.internalName || "Acomodação Bomgo"),
      source: "bomgo",
      destination: city,
      location: [district, city].filter(Boolean).join(", "),
      neighborhood: district,
      fullAddress,
      latitude,
      longitude,
      type: typeName,
      summary: description.slice(0, 140),
      description,
      images,
      // Never invent a rating: 0 (never rated) is a real, honest value —
      // unlike a fabricated 4.8 default, it cannot skew rating-based sorting.
      rating: Number(raw?.rating ?? 0),
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
      rules: houseRules ? [houseRules] : [],
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
        name: formatPropertyTitle(p?.internalName ?? this.pickMs(p?._mstitle) ?? ""),
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

  // -----------------------------------------------------------------------
  // Search listings (POST /booking/search-listings)
  // -----------------------------------------------------------------------

  /**
   * Full catalog, independent of any booking-calendar availability.
   *
   * `/booking/search-listings` only returns listings that are FREE for the
   * given window — a fully booked-out unit simply never appears, which is
   * correct once the guest has chosen real dates, but wrong for "ver todas
   * as hospedagens" / any dateless browse: the person expects to see every
   * active listing that exists, not a subset filtered by an arbitrary
   * default 3-night window 14 days out. `/content/listings` (Content API)
   * lists the catalog itself, with no availability filtering at all.
   */
  private async browseAllListings(requestId: string): Promise<Property[] | null> {
    const tag = `[search:${requestId}] stays[${this.connection.connectionId}] browse-catalog`
    const PAGE_SIZE = 20
    const MAX_PAGES = 6 // up to 120 listings in the catalog
    const rawListings: any[] = []

    for (let page = 0; page < MAX_PAGES; page++) {
      const data = await this.fetch<any>(
        `/external/v1/content/listings?status=active&skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`,
      )
      if (!data) {
        if (page === 0) {
          console.log(`${tag} falha ao listar catalogo`)
          return null
        }
        break
      }
      const pageListings: any[] = Array.isArray(data) ? data : (data.listings ?? data.results ?? [])
      rawListings.push(...pageListings)
      if (pageListings.length < PAGE_SIZE) break
    }
    console.log(`${tag} catalogo completo: ${rawListings.length} listings`)

    const amenityMap = await this.amenityLabelMap()
    const mapped = rawListings
      .map((l) => this.mapListing(l, amenityMap))
      .filter((p): p is Property => Boolean(p))

    // Content API listings never include price — quote each one for the
    // same default near-future window a dateless view already implies.
    // calculate-price's documented multi-ID request shape (all listings in
    // one call) turned out unreliable in practice (returned prices for only
    // a subset), so this reuses the exact per-listing call already proven
    // correct elsewhere (enrichWithDefaultPrice), just run in small
    // parallel batches instead of one call per listing sequentially.
    const { from, to } = this.resolveSearchWindow({ checkIn: null, checkOut: null } as SearchCriteria)
    const nights = this.nightsBetween(from, to)
    const needsPrice = mapped.filter((p) => p.nightlyPrice <= 0)
    const CHUNK = 5
    for (let i = 0; i < needsPrice.length; i += CHUNK) {
      const chunk = needsPrice.slice(i, i + CHUNK)
      await Promise.all(
        chunk.map(async (property) => {
          const quotes = await this.calculatePrice({ listingIds: [property.id], from, to, guests: 1 })
          const quote = quotes?.[0]
          if (!quote || quote.total <= 0) return
          const feesTotal = quote.fees.reduce((sum, f) => sum + f.value, 0)
          property.nightlyPrice = Math.round((quote.total - feesTotal) / nights)
        }),
      )
    }
    console.log(`${tag} precos preenchidos: ${needsPrice.filter((p) => p.nightlyPrice > 0).length}/${needsPrice.length}`)

    return mapped
  }

  async searchListings(criteria: SearchCriteria, requestId = "-"): Promise<Property[] | null> {
    const tag = `[search:${requestId}] stays[${this.connection.connectionId}]`
    // No dates chosen yet => real catalog browse, not an availability search
    // artificially narrowed to whatever's free in a made-up default window.
    if (!criteria.checkIn && !criteria.checkOut) {
      const catalog = await this.browseAllListings(requestId)
      if (!catalog) return null
      // Content API has no city filter param — apply the same destination
      // matching (city + bairro) the dated path applies server-side/guard-side.
      const destination = criteria.destination
      let filtered = destination?.city
        ? catalog.filter(
            (p) => p.destination.toLowerCase() === destination.city!.toLowerCase(),
          )
        : catalog
      filtered = filterByDestinationRegion(filtered, destination)
      console.log(`${tag} catalogo apos filtro de destino: ${filtered.length}`)
      return filtered
    }

    const guests = criteria.adults + criteria.children
    const { from, to } = this.resolveSearchWindow(criteria)
    const destination = criteria.destination
    const PAGE_SIZE = 20 // Stays' documented max per request — not configurable higher.
    const MAX_PAGES = 4 // safety cap: up to 80 listings per account per search

    const allListings: any[] = []
    for (let page = 0; page < MAX_PAGES; page++) {
      const body: Record<string, unknown> = {
        guests: guests > 0 ? guests : 1,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        from,
        to,
      }
      if (destination?.city) body.cities = [destination.city]

      const data = await this.fetch<any>("/external/v1/booking/search-listings", {
        method: "POST",
        body: JSON.stringify(body),
      })
      if (!data) {
        if (page === 0) {
          console.log(`${tag} falha na chamada real (ver log de fetch acima) — não retorna array vazio disfarçado`)
          return null
        }
        break // later page failed — keep what we already gathered instead of discarding it
      }

      const pageListings: any[] = Array.isArray(data) ? data : (data.listings ?? data.results ?? [])
      allListings.push(...pageListings)
      console.log(`${tag} pagina ${page + 1}: recebidos ${pageListings.length}`, { cities: body.cities ?? "(sem filtro)" })

      if (pageListings.length < PAGE_SIZE) break // last page reached
    }
    console.log(`${tag} total recebido da Stays (todas as paginas): ${allListings.length}`)

    const amenityMap = await this.amenityLabelMap()
    let mapped = allListings
      .map((l) => this.mapListing(l, amenityMap, criteria))
      .filter((p): p is Property => Boolean(p))
    console.log(`${tag} após normalização: ${mapped.length}`)

    // District guard: when the requested destination has a known bairro
    // (e.g. "Porto das Dunas" inside the município "Aquiraz"), never let a
    // listing from a different bairro through, even if Stays' city-level
    // filter is broader than expected. Uses only real address data the
    // listing itself returned — no invented data.
    mapped = filterByDestinationRegion(mapped, destination)
    console.log(`${tag} após filtro de destino (bairro): ${mapped.length}`)

    return mapped
  }

  // -----------------------------------------------------------------------
  // Resolve a listing by its public slug (POST /booking/search-listings,
  // browse mode — no dates/destination filter, matched against the exact
  // same deterministic `slugify(shortId)` used everywhere else).
  // -----------------------------------------------------------------------

  /**
   * Real Stays ids observed in this account (AP101, OI01H, BR01I…) are plain
   * uppercase alphanumeric — exactly what `slugify` leaves untouched other
   * than lower-casing. So `slug.toUpperCase()` recovers the original id, and
   * `/content/listings/{id}` (Content API) resolves it directly: no
   * availability window, no dates, no pagination — a listing that's fully
   * booked out is still a valid page to view.
   */
  private async findListingBySlugDirect(slug: string): Promise<Property | null> {
    const direct = await this.getListing(slug.toUpperCase())
    return direct && direct.slug === slug ? direct : null
  }

  /**
   * Fallback for the rare id shape the uppercase guess above doesn't recover
   * (ids containing characters `slugify` actually alters). Browses this
   * account's full catalog with the exact same "no dates chosen yet" default
   * window real customer searches use — paginated to cover accounts of any
   * size — and matches the slug client-side with the identical `mapListing`
   * logic.
   */
  private async findListingBySlugByBrowsing(slug: string, requestId: string): Promise<Property | null> {
    const tag = `[slug:${requestId}] stays[${this.connection.connectionId}]`
    const { from, to } = this.resolveSearchWindow({ checkIn: null, checkOut: null } as SearchCriteria)
    const pageSize = 200
    const maxListings = 2000
    let amenityMap: Map<string, string> | null = null
    for (let skip = 0; skip < maxListings; skip += pageSize) {
      const data = await this.fetch<any>("/external/v1/booking/search-listings", {
        method: "POST",
        body: JSON.stringify({ guests: 1, skip, limit: pageSize, from, to }),
      })
      if (!data) {
        console.log(`${tag} falha na chamada real ao resolver slug "${slug}" (skip=${skip})`)
        return null
      }
      amenityMap ??= await this.amenityLabelMap()
      const listings: any[] = Array.isArray(data) ? data : (data.listings ?? data.results ?? [])
      for (const raw of listings) {
        const mapped = this.mapListing(raw, amenityMap)
        if (mapped && mapped.slug === slug) return mapped
      }
      if (listings.length < pageSize) break
    }
    console.log(`${tag} slug "${slug}" não encontrado no catálogo (direto nem por navegação)`)
    return null
  }

  async findListingBySlug(slug: string, requestId = "-"): Promise<Property | null> {
    const direct = await this.findListingBySlugDirect(slug)
    if (direct) return direct
    return this.findListingBySlugByBrowsing(slug, requestId)
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

  /**
   * Real per-day availability for one listing — the actual booking
   * calendar, not the search-listings "is it free for THIS window" filter.
   * Powers the property page's date picker so booked dates show disabled,
   * instead of every future date looking selectable regardless of real
   * reservations.
   */
  async getCalendar(listingId: string, from: string, to: string): Promise<string[] | null> {
    const data = await this.fetch<any[]>(
      `/external/v1/calendar/listing/${encodeURIComponent(listingId)}?from=${from}&to=${to}`,
    )
    if (!Array.isArray(data)) return null
    return data.filter((day) => Number(day?.avail ?? 1) <= 0).map((day) => String(day?.date ?? "")).filter(Boolean)
  }

  // -----------------------------------------------------------------------
  // Content API (GET /content/listings/{id}, /content/properties/{id})
  // -----------------------------------------------------------------------

  async getListing(listingId: string): Promise<Property | null> {
    const data = await this.fetch<any>(`/external/v1/content/listings/${encodeURIComponent(listingId)}`)
    if (!data) return null
    const amenityMap = await this.amenityLabelMap()
    const property = this.mapListing(data, amenityMap)
    if (!property) return null
    // The Content API never includes pricing (only booking/search-listings
    // does) — a listing viewed before the guest picks dates would otherwise
    // show a fake "R$ 0,00/noite". Quote the same default near-future window
    // every dateless search already uses so the page always shows a real,
    // Stays-confirmed starting price; checkout re-confirms the guest's actual
    // dates regardless.
    if (property.nightlyPrice > 0) return property
    return this.enrichWithDefaultPrice(property)
  }

  private async enrichWithDefaultPrice(property: Property): Promise<Property> {
    const { from, to } = this.resolveSearchWindow({ checkIn: null, checkOut: null } as SearchCriteria)
    const quotes = await this.calculatePrice({ listingIds: [property.id], from, to, guests: 1 })
    const quote = quotes?.[0]
    if (!quote || quote.total <= 0) return property
    const nights = this.nightsBetween(from, to)
    const feesTotal = quote.fees.reduce((sum, f) => sum + f.value, 0)
    const subtotal = quote.total - feesTotal
    return {
      ...property,
      nightlyPrice: Math.round(subtotal / nights),
      cleaningFee: quote.fees.find((f) => /limpeza/i.test(f.label))?.value ?? property.cleaningFee,
      energyFee: quote.fees.find((f) => /energia|eletricidade/i.test(f.label))?.value ?? property.energyFee,
    }
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
    const name = formatPropertyTitle(raw.internalName || this.pickMs(raw._mstitle))
    const images: PropertyImage[] = Array.isArray(raw?._t_imagesMeta)
      ? raw._t_imagesMeta.map((img: any) => ({ src: img?.url ?? img?.src ?? "", alt: name })).filter((i: PropertyImage) => i.src)
      : []
    return {
      id: String(raw._id ?? raw.id ?? propertyId),
      name,
      description: sanitizeDescriptionText(this.stripHtml(this.pickMs(raw._msdesc))),
      city: formatPlaceName(raw?.address?.city ?? ""),
      region: formatPlaceName(raw?.address?.district ?? raw?.address?.region ?? raw?.address?.neighborhood ?? ""),
      images,
    }
  }
}
