import "server-only"

import type { Amenity, Property, PropertyImage, SearchCriteria } from "@/lib/types"
import { isStaysConfigured, staysConfig } from "@/lib/integrations/config"

/**
 * Stays.net adapter — powers "Reserva Direta Bomgo" inventory.
 *
 * All calls are defensive: any auth/network/shape error resolves to `null`
 * so the API route can fall back to curated data. Nothing here ever runs on
 * the client (guarded by `server-only`), so credentials stay secret.
 */

function authHeader(): string {
  const token = Buffer.from(`${staysConfig.login}:${staysConfig.password}`).toString("base64")
  return `Basic ${token}`
}

async function staysFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${staysConfig.apiUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      // Availability changes constantly — never cache.
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

/** Map a raw Stays listing to our Property shape, tolerating missing fields. */
function mapListing(raw: any): Property | null {
  if (!raw || (!raw._id && !raw.id)) return null
  const id = String(raw._id ?? raw.id)
  const images: PropertyImage[] = Array.isArray(raw.images)
    ? raw.images
        .map((img: any) => ({
          src: img?.url ?? img?._id ?? img?.src ?? "",
          alt: img?.caption ?? raw.internalName ?? "Acomodação Bomgo",
        }))
        .filter((i: PropertyImage) => i.src)
    : []

  const amenities: Amenity[] = Array.isArray(raw.amenities)
    ? raw.amenities.map((a: any) => ({
        key: String(a?._id ?? a?.key ?? a).toLowerCase(),
        label: String(a?.name ?? a?.label ?? a),
      }))
    : []

  const price = Number(raw?.price?.value ?? raw?.basePrice ?? raw?.nightlyPrice ?? 0)

  return {
    id,
    slug: String(raw.slug ?? raw.internalName ?? id)
      .toLowerCase()
      .replace(/\s+/g, "-"),
    name: raw.title ?? raw.internalName ?? "Acomodação Bomgo",
    source: "bomgo",
    destination: raw?.address?.city ?? raw?.city ?? "",
    location: raw?.address?.region ?? raw?.address?.city ?? "",
    neighborhood: raw?.address?.neighborhood ?? "",
    type: raw?.propertyTypeName ?? raw?.type ?? "Apartamento",
    summary: raw?.subtitle ?? raw?.shortDescription ?? "",
    description: raw?.description ?? "",
    images,
    rating: Number(raw?.rating ?? 4.8),
    reviewsCount: Number(raw?.reviewsCount ?? 0),
    maxGuests: Number(raw?.maxGuests ?? raw?.accommodates ?? 2),
    bedrooms: Number(raw?.bedrooms ?? raw?._idtype ?? 1),
    bathrooms: Number(raw?.bathrooms ?? 1),
    areaSqm: Number(raw?.area ?? 0),
    nightlyPrice: price,
    cleaningFee: Number(raw?.cleaningFee ?? 0),
    energyFee: Number(raw?.energyFee ?? 0),
    badges: ["reserva-direta"],
    amenities,
    rules: Array.isArray(raw?.rules) ? raw.rules.map(String) : [],
    featured: Boolean(raw?.featured),
    reviews: [],
    highlight: raw?.highlight,
  }
}

/**
 * Search available Bomgo inventory for the given criteria.
 * Returns `null` when Stays is not configured or the call fails.
 */
export async function searchStays(criteria: SearchCriteria): Promise<Property[] | null> {
  if (!isStaysConfigured()) return null

  const params = new URLSearchParams()
  if (criteria.checkIn) params.set("checkIn", criteria.checkIn)
  if (criteria.checkOut) params.set("checkOut", criteria.checkOut)
  params.set("adults", String(criteria.adults))
  params.set("children", String(criteria.children))

  const data = await staysFetch<any>(`/external/v1/booking/search?${params.toString()}`)
  if (!data) return null

  const listings: any[] = Array.isArray(data) ? data : (data.listings ?? data.results ?? [])
  const mapped = listings.map(mapListing).filter((p): p is Property => Boolean(p))
  return mapped
}

/** Fetch a single Bomgo listing by slug/id. Returns `null` on any miss. */
export async function getStaysListing(idOrSlug: string): Promise<Property | null> {
  if (!isStaysConfigured()) return null
  const data = await staysFetch<any>(`/external/v1/content/listings/${encodeURIComponent(idOrSlug)}`)
  if (!data) return null
  return mapListing(data)
}

/** Create a real reservation in Stays. Returns the confirmation id or null. */
export async function createStaysReservation(payload: {
  listingId: string
  checkIn: string | null
  checkOut: string | null
  guest: { firstName: string; lastName: string; email: string; phone: string; document: string }
  adults: number
  children: number
}): Promise<{ id: string } | null> {
  if (!isStaysConfigured()) return null
  const data = await staysFetch<any>(`/external/v1/booking/reservations`, {
    method: "POST",
    body: JSON.stringify({
      _idlisting: payload.listingId,
      checkInDate: payload.checkIn,
      checkOutDate: payload.checkOut,
      guestsDetails: {
        adults: payload.adults,
        children: payload.children,
        list: [
          {
            name: `${payload.guest.firstName} ${payload.guest.lastName}`,
            email: payload.guest.email,
            phone: payload.guest.phone,
            document: payload.guest.document,
          },
        ],
      },
    }),
  })
  if (!data?._id && !data?.id) return null
  return { id: String(data._id ?? data.id) }
}
