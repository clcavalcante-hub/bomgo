import "server-only"

import { getStaysConnectionRegistry, type StaysConnection } from "@/lib/integrations/stays-connection-registry"
import { StaysAdapter } from "@/lib/integrations/stays-adapter"
import { StaysClientAdapter } from "@/lib/reservations/stays-client-adapter"
import { StaysReservationAdapter } from "@/lib/reservations/stays-reservation-adapter"
import { getCheckinInfo, type CheckinSheetInfo } from "@/lib/integrations/checkin-sheet"

export interface OtaReservationView {
  staysReservationId: string
  reservationCode: string | null
  partnerCode: string | null // OTA's own booking reference (e.g. Booking.com's numeric id) — a different value than Stays' own reservationCode, and what guests usually mean by "código da reserva" when the booking came through an OTA
  connectionId: string
  externalListingId: string
  propertyName: string | null
  propertyImage: string | null
  propertyImages: { src: string; alt: string }[]
  propertyLocation: string | null
  propertyFullAddress: string | null
  propertyHouseRules: string[]
  propertyAmenities: { key: string; label: string }[]
  checkInDate: string | null
  checkOutDate: string | null
  total: number | null
  currency: string | null
  status: string | null
  channel: string // "Booking.com" | "Airbnb" | "Expedia" | "Parceiro"
  checkinInfo: CheckinSheetInfo | null
}

// Stays doesn't expose an explicit "sales channel" field on a reservation —
// only `partnerCode` (present for anything that came through a distribution
// partner) and the guest's on-file email, which OTAs frequently relay
// through a recognizable domain. This is a best-effort label, not a
// guaranteed-accurate channel name.
function inferChannel(raw: any): string {
  const email = String(raw?.guestsDetails?.list?.[0]?.email ?? raw?.mainGuest?.email ?? "").toLowerCase()
  if (email.includes("guest.booking.com")) return "Booking.com"
  if (email.includes("airbnb.com")) return "Airbnb"
  if (email.includes("expedia.com")) return "Expedia"
  return raw?.partnerCode ? "Parceiro" : "Reserva direta"
}

// Wide-enough window to catch essentially any real reservation without
// requiring the guest to know their exact dates — Stays requires from/to
// even for an "everything this client has" query.
function wideRange() {
  const now = new Date()
  const from = new Date(now)
  from.setFullYear(from.getFullYear() - 2)
  const to = new Date(now)
  to.setFullYear(to.getFullYear() + 2)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  return { from: iso(from), to: iso(to) }
}

async function reservationsForConnection(
  connection: StaysConnection,
  clientQuery: { email?: string; phone?: string; name?: string },
): Promise<OtaReservationView[]> {
  const clientAdapter = new StaysClientAdapter(connection)
  const clients = await clientAdapter.search(clientQuery)
  console.error(
    `[ota-lookup] connection=${connection.connectionId} clients_found=${clients.length} query=${JSON.stringify(clientQuery)}`,
  )
  if (clients.length === 0) return []

  const reservationAdapter = new StaysReservationAdapter(connection)
  const listingAdapter = new StaysAdapter(connection)
  const range = wideRange()

  const perClient = await Promise.all(
    clients.map((c) => reservationAdapter.listByClientId(c.id, { ...range, dateType: "creation" })),
  )
  const flat = perClient.flat().filter((r) => r.staysReservationId && r.raw?.type !== "canceled")

  const listingCache = new Map<string, Awaited<ReturnType<StaysAdapter["getListing"]>>>()
  const results: OtaReservationView[] = []
  for (const r of flat) {
    const externalListingId = String(r.raw?._idlisting ?? "")
    if (!externalListingId) continue
    if (!listingCache.has(externalListingId)) {
      listingCache.set(externalListingId, await listingAdapter.getListing(externalListingId).catch(() => null))
    }
    const listing = listingCache.get(externalListingId) ?? null
    const checkinInfo = await getCheckinInfo(externalListingId).catch(() => null)
    results.push({
      staysReservationId: r.staysReservationId!,
      reservationCode: r.reservationCode,
      partnerCode: r.raw?.partnerCode ? String(r.raw.partnerCode) : null,
      connectionId: connection.connectionId,
      externalListingId,
      propertyName: listing?.name ?? null,
      propertyImage: listing?.images?.[0]?.src ?? null,
      propertyImages: listing?.images ?? [],
      propertyLocation: listing?.location ?? null,
      propertyFullAddress: listing?.fullAddress ?? null,
      propertyHouseRules: listing?.rules ?? [],
      propertyAmenities: listing?.amenities ?? [],
      checkInDate: r.raw?.checkInDate ?? null,
      checkOutDate: r.raw?.checkOutDate ?? null,
      total: r.total,
      currency: r.currency,
      status: r.raw?.type ?? null,
      channel: inferChannel(r.raw),
      checkinInfo,
    })
  }
  return results
}

/** Fetches one specific reservation directly (by the Stays internal id +
 * owning connection) — used for a "reserva" login session, which already
 * knows exactly which reservation it is and shouldn't need to re-search by
 * name/email. Mirrors the same enrichment as reservationsForConnection. */
export async function getOtaReservationById(
  connectionId: string,
  staysReservationId: string,
): Promise<OtaReservationView | null> {
  try {
    const connection = await getStaysConnectionRegistry().getById(connectionId)
    if (!connection) return null
    const reservationAdapter = new StaysReservationAdapter(connection)
    const result = await reservationAdapter.retrieve(staysReservationId)
    if (!result.ok || !result.raw) return null
    const raw = result.raw
    const externalListingId = String(raw?._idlisting ?? "")
    if (!externalListingId) return null

    const listingAdapter = new StaysAdapter(connection)
    const listing = await listingAdapter.getListing(externalListingId).catch(() => null)
    const checkinInfo = await getCheckinInfo(externalListingId).catch(() => null)

    return {
      staysReservationId,
      reservationCode: result.reservationCode,
      partnerCode: raw?.partnerCode ? String(raw.partnerCode) : null,
      connectionId: connection.connectionId,
      externalListingId,
      propertyName: listing?.name ?? null,
      propertyImage: listing?.images?.[0]?.src ?? null,
      propertyImages: listing?.images ?? [],
      propertyLocation: listing?.location ?? null,
      propertyFullAddress: listing?.fullAddress ?? null,
      propertyHouseRules: listing?.rules ?? [],
      propertyAmenities: listing?.amenities ?? [],
      checkInDate: raw?.checkInDate ?? null,
      checkOutDate: raw?.checkOutDate ?? null,
      total: result.total,
      currency: result.currency,
      status: raw?.type ?? null,
      channel: inferChannel(raw),
      checkinInfo,
    }
  } catch {
    return null
  }
}

/** Search every active Stays connection for reservations belonging to a
 * guest identified by email/phone/name — surfaces bookings made directly
 * on an OTA (never through Bomgo's own checkout) so the guest sees them in
 * the same account, read-only. */
export async function findOtaReservations(query: {
  email?: string
  phone?: string
  name?: string
}): Promise<OtaReservationView[]> {
  if (!query.email && !query.phone && !query.name) return []
  const connections = await getStaysConnectionRegistry().listActive()
  console.error(
    `[ota-lookup] active_connections=${connections.length} (${connections.map((c) => c.connectionId).join(", ")})`,
  )
  if (connections.length === 0) return []

  const settled = await Promise.allSettled(connections.map((c) => reservationsForConnection(c, query)))
  const all: OtaReservationView[] = []
  for (const outcome of settled) {
    if (outcome.status === "fulfilled") all.push(...outcome.value)
  }
  // De-dup in case the same client matched more than once across connections.
  const seen = new Set<string>()
  return all.filter((r) => {
    const key = `${r.connectionId}:${r.staysReservationId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Finds exactly one OTA reservation matching a guest's name plus either a
 * reservation code or a check-in date (or both) — the same "prove you know
 * your own booking" check used by /minha-reserva and by the reservation-code
 * login. Returns an error message (not an exception) when the match is
 * ambiguous or absent, so callers can show it directly. */
export async function findSingleOtaReservation(input: {
  name: string
  code?: string
  checkin?: string
}): Promise<{ reservation: OtaReservationView | null; error: string | null }> {
  const name = input.name.trim()
  const code = input.code?.trim() ?? ""
  const checkin = input.checkin?.trim() ?? ""
  if (!name || (!code && !checkin)) {
    return { reservation: null, error: "Informe o nome completo e o código da reserva (ou a data de check-in)." }
  }
  try {
    const matches = await findOtaReservations({ name })
    const dateMatches = checkin ? matches.filter((r) => r.checkInDate?.slice(0, 10) === checkin) : matches
    const filteredMatches = code
      ? dateMatches.filter(
          (r) => r.reservationCode?.toUpperCase() === code.toUpperCase() || r.partnerCode?.toUpperCase() === code.toUpperCase(),
        )
      : dateMatches

    if (filteredMatches.length === 1) return { reservation: filteredMatches[0], error: null }
    if (filteredMatches.length > 1) {
      return {
        reservation: null,
        error: "Encontramos mais de uma reserva com esses dados. Informe também a data de check-in para confirmar qual é a sua.",
      }
    }
    return { reservation: null, error: "Não encontramos uma reserva com esses dados. Confira o nome e o código." }
  } catch {
    return { reservation: null, error: "Não foi possível consultar sua reserva agora. Tente novamente em instantes." }
  }
}
