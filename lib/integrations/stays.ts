import "server-only"

import type { Amenity, Property, PropertyImage, SearchCriteria } from "@/lib/types"
import { isStaysConfigured, staysConfig } from "@/lib/integrations/config"

/**
 * Stays.net READ-ONLY adapter — powers "Reserva Direta Bomgo" inventory.
 *
 * Implements exactly the documented Booking + Content endpoints:
 *   GET  /external/v1/booking/searchfilter      → available filter values
 *   POST /external/v1/booking/search-listings   → bookable listings
 *   POST /external/v1/booking/calculate-price    → real price for a stay
 *   GET  /external/v1/content/listings/{id}      → full listing content
 *   GET  /external/v1/content/properties/{id}    → property-level content
 *
 * Auth is HTTP Basic with client_id:client_secret. Every call is defensive:
 * any auth/network/shape error resolves to `null` so the API route can fall
 * back to curated data. Nothing here ever runs on the client (`server-only`),
 * so credentials never reach the browser. This step is read-only: no
 * reservation/booking writes and no payments.
 */

// -------------------------------------------------------------------------
// Low-level HTTP
// -------------------------------------------------------------------------

function authHeader(): string {
  const token = Buffer.from(`${staysConfig.clientId}:${staysConfig.clientSecret}`).toString("base64")
  return `Basic ${token}`
}

function baseUrl(): string {
  return staysConfig.apiUrl.replace(/\/$/, "")
}

async function staysFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      // Availability/pricing changes constantly — never cache.
      cache: "no-store",
    })
    if (!res.ok) {
      console.log("[v0] Stays responded with", res.status, path)
      return null
    }
    return (await res.json()) as T
  } catch (error) {
    console.log("[v0] Stays request failed:", (error as Error).message)
    return null
  }
}

// -------------------------------------------------------------------------
// Field helpers (Stays uses multilingual `_ms*`, numeric `_i_/_f_`, meta `_t_`)
// -------------------------------------------------------------------------

/** Pick a localized string, preferring pt_BR then en_US then first value. */
function pickMs(ms: unknown): string {
  if (!ms || typeof ms !== "object") return typeof ms === "string" ? ms : ""
  const obj = ms as Record<string, string>
  return obj.pt_BR ?? obj.en_US ?? obj.pt_PT ?? Object.values(obj)[0] ?? ""
}

/** Strip HTML tags that Stays returns inside descriptions. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function nightsBetween(from: string | null, to: string | null): number {
  if (!from || !to) return 1
  const ms = new Date(to).getTime() - new Date(from).getTime()
  const n = Math.round(ms / 86_400_000)
  return n > 0 ? n : 1
}

function brl(mc: unknown): number {
  if (!mc || typeof mc !== "object") return Number(mc) || 0
  return Number((mc as Record<string, number>).BRL ?? 0)
}

function slugify(value: string): string {
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// -------------------------------------------------------------------------
// Search filter (GET /booking/searchfilter)
// -------------------------------------------------------------------------

export interface StaysSearchFilter {
  cities: string[]
  regions: string[]
  states: string[]
  amenities: { id: string; label: string }[]
  properties: { id: string; name: string; city: string; region: string }[]
  minPrice: number
  maxPrice: number
}

/** Build a map of amenity _id → localized label for listing mapping. */
async function amenityLabelMap(): Promise<Map<string, string>> {
  const filter = await getStaysSearchFilter()
  const map = new Map<string, string>()
  filter?.amenities.forEach((a) => map.set(a.id, a.label))
  return map
}

export async function getStaysSearchFilter(): Promise<StaysSearchFilter | null> {
  if (!isStaysConfigured()) return null
  const raw = await staysFetch<any>("/external/v1/booking/searchfilter")
  if (!raw) return null
  return {
    cities: (raw.cities ?? []).map((c: any) => String(c?.val ?? "")).filter(Boolean),
    regions: (raw.regions ?? []).map((r: any) => String(r?.val ?? "")).filter(Boolean),
    states: (raw.states ?? []).map((s: any) => String(s?.val ?? "")).filter(Boolean),
    amenities: (raw.amenities ?? []).map((a: any) => ({
      id: String(a?._id ?? ""),
      label: pickMs(a?._mstitle),
    })),
    properties: (raw.properties ?? []).map((p: any) => ({
      id: String(p?._id ?? p?.id ?? ""),
      name: p?.internalName ?? pickMs(p?._mstitle),
      city: p?.address?.city ?? "",
      region: p?.address?.region ?? "",
    })),
    minPrice: brl(raw.minprice),
    maxPrice: brl(raw.maxprice) || 10000,
  }
}

// -------------------------------------------------------------------------
// Mapping raw Stays listings → Bomgo Property
// -------------------------------------------------------------------------

function mapListing(raw: any, amenityMap: Map<string, string>, criteria?: SearchCriteria): Property | null {
  if (!raw || (!raw._id && !raw.id)) return null

  const shortId = String(raw.id ?? raw._id)
  const longId = String(raw._id ?? raw.id)

  const images: PropertyImage[] = []
  const mainUrl = raw?._t_mainImageMeta?.url
  if (mainUrl) images.push({ src: mainUrl, alt: pickMs(raw._mstitle) || "Acomodação Bomgo" })
  if (Array.isArray(raw?._t_imagesMeta)) {
    raw._t_imagesMeta.forEach((img: any) => {
      const src = img?.url ?? img?.src
      if (src && !images.some((i) => i.src === src)) {
        images.push({ src, alt: pickMs(raw._mstitle) || "Acomodação Bomgo" })
      }
    })
  }

  const amenities: Amenity[] = Array.isArray(raw?.amenities)
    ? raw.amenities.map((a: any) => {
        const id = String(a?._id ?? a?.id ?? a)
        const label = amenityMap.get(id) ?? pickMs(a?._mstitle) ?? id
        return { key: slugify(label || id), label }
      })
    : []

  // search-listings returns a period total in bookingPrice._mctotal.BRL.
  const total = brl(raw?.bookingPrice?._mctotal)
  const nights = nightsBetween(
    raw?.bookingPrice?.from ?? criteria?.checkIn ?? null,
    raw?.bookingPrice?.to ?? criteria?.checkOut ?? null,
  )
  const nightlyPrice = total > 0 ? Math.round(total / nights) : 0

  const cleaningFee =
    (raw?.bookingPrice?.fees ?? []).reduce((sum: number, f: any) => sum + brl(f?._mcval), 0) || 0

  const description = stripHtml(pickMs(raw._msdesc))
  const typeName = pickMs(raw?._t_typeMeta?._mstitle) || "Apartamento"

  return {
    id: longId,
    slug: slugify(shortId),
    name: pickMs(raw._mstitle) || raw.internalName || "Acomodação Bomgo",
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
  }
}

// -------------------------------------------------------------------------
// Search listings (POST /booking/search-listings)
// -------------------------------------------------------------------------

/** Derive a city hint from the free-text destination ("Fortaleza · ..."). */
function cityFromDestination(destination: string | undefined): string | null {
  if (!destination) return null
  const first = destination.split(/[·,|-]/)[0]?.trim()
  return first || null
}

export async function searchStays(criteria: SearchCriteria): Promise<Property[] | null> {
  if (!isStaysConfigured()) return null

  const guests = criteria.adults + criteria.children
  const body: Record<string, unknown> = {
    guests: guests > 0 ? guests : 1,
    skip: 0,
    limit: 20,
  }
  if (criteria.checkIn) body.from = criteria.checkIn
  if (criteria.checkOut) body.to = criteria.checkOut
  const city = cityFromDestination(criteria.destination)
  if (city) body.cities = [city]

  const data = await staysFetch<any>("/external/v1/booking/search-listings", {
    method: "POST",
    body: JSON.stringify(body),
  })
  if (!data) return null

  const listings: any[] = Array.isArray(data) ? data : (data.listings ?? data.results ?? [])
  const amenityMap = await amenityLabelMap()
  return listings
    .map((l) => mapListing(l, amenityMap, criteria))
    .filter((p): p is Property => Boolean(p))
}

// -------------------------------------------------------------------------
// Calculate price (POST /booking/calculate-price)
// -------------------------------------------------------------------------

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

export async function calculateStaysPrice(input: {
  listingIds: string[]
  from: string
  to: string
  guests: number
  promocode?: string
}): Promise<StaysPrice[] | null> {
  if (!isStaysConfigured()) return null
  const body: Record<string, unknown> = {
    listingIds: input.listingIds,
    from: input.from,
    to: input.to,
    guests: input.guests > 0 ? input.guests : 1,
  }
  if (input.promocode) body.promocode = input.promocode

  const data = await staysFetch<any[]>("/external/v1/booking/calculate-price", {
    method: "POST",
    body: JSON.stringify(body),
  })
  if (!Array.isArray(data)) return null

  return data.map((row) => ({
    listingId: String(row?._idlisting ?? ""),
    from: String(row?.from ?? input.from),
    to: String(row?.to ?? input.to),
    guests: Number(row?.guests ?? input.guests),
    total: brl(row?._mctotal),
    currency: String(row?.mainCurrency ?? "BRL"),
    feesIncluded: Boolean(row?.feesIncluded),
    fees: (row?.fees ?? []).map((f: any) => ({ label: pickMs(f?._mstitle), value: brl(f?._mcval) })),
  }))
}

// -------------------------------------------------------------------------
// Content API (GET /content/listings/{id}, /content/properties/{id})
// -------------------------------------------------------------------------

/** Fetch a single Bomgo listing's full content by short or long id. */
export async function getStaysListing(listingId: string): Promise<Property | null> {
  if (!isStaysConfigured()) return null
  const data = await staysFetch<any>(`/external/v1/content/listings/${encodeURIComponent(listingId)}`)
  if (!data) return null
  const amenityMap = await amenityLabelMap()
  return mapListing(data, amenityMap)
}

/** Fetch property-level content (title, address, images) by property id. */
export async function getStaysProperty(propertyId: string): Promise<{
  id: string
  name: string
  description: string
  city: string
  region: string
  images: PropertyImage[]
} | null> {
  if (!isStaysConfigured()) return null
  const raw = await staysFetch<any>(`/external/v1/content/properties/${encodeURIComponent(propertyId)}`)
  if (!raw) return null
  const name = raw.internalName || pickMs(raw._mstitle)
  const images: PropertyImage[] = Array.isArray(raw?._t_imagesMeta)
    ? raw._t_imagesMeta
        .map((img: any) => ({ src: img?.url ?? img?.src ?? "", alt: name }))
        .filter((i: PropertyImage) => i.src)
    : []
  return {
    id: String(raw._id ?? raw.id ?? propertyId),
    name,
    description: stripHtml(pickMs(raw._msdesc)),
    city: raw?.address?.city ?? "",
    region: raw?.address?.region ?? "",
    images,
  }
}
