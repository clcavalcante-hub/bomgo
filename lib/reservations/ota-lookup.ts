import "server-only"

import { getStaysConnectionRegistry, type StaysConnection } from "@/lib/integrations/stays-connection-registry"
import { StaysAdapter } from "@/lib/integrations/stays-adapter"
import { StaysClientAdapter } from "@/lib/reservations/stays-client-adapter"
import { StaysReservationAdapter } from "@/lib/reservations/stays-reservation-adapter"

export interface OtaReservationView {
  staysReservationId: string
  reservationCode: string | null
  partnerCode: string | null // OTA's own booking reference (e.g. Booking.com's numeric id) — a different value than Stays' own reservationCode, and what guests usually mean by "código da reserva" when the booking came through an OTA
  connectionId: string
  externalListingId: string
  propertyName: string | null
  propertyImage: string | null
  propertyLocation: string | null
  checkInDate: string | null
  checkOutDate: string | null
  total: number | null
  currency: string | null
  status: string | null
  channel: string // "Booking.com" | "Airbnb" | "Expedia" | "Parceiro"
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
    results.push({
      staysReservationId: r.staysReservationId!,
      reservationCode: r.reservationCode,
      partnerCode: r.raw?.partnerCode ? String(r.raw.partnerCode) : null,
      connectionId: connection.connectionId,
      externalListingId,
      propertyName: listing?.name ?? null,
      propertyImage: listing?.images?.[0]?.src ?? null,
      propertyLocation: listing?.location ?? null,
      checkInDate: r.raw?.checkInDate ?? null,
      checkOutDate: r.raw?.checkOutDate ?? null,
      total: r.total,
      currency: r.currency,
      status: r.raw?.type ?? null,
      channel: inferChannel(r.raw),
    })
  }
  return results
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
