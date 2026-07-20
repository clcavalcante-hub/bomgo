import "server-only"

import type { InternalReservation, ReservationStatus } from "@/lib/types"
import type { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"
import { getStaysConnectionRegistry } from "@/lib/integrations/stays-connection-registry"
import { StaysReservationAdapter } from "@/lib/reservations/stays-reservation-adapter"

// Stays' raw `type` field on a reservation, mapped to Bomgo's internal
// status enum. Only the unambiguous cases are mapped — "blocked" /
// "maintenance" / "contract" aren't guest reservation states and are left
// alone rather than guessed at.
const STAYS_TYPE_TO_STATUS: Record<string, ReservationStatus> = {
  reserved: "pre_reserved",
  booked: "confirmed",
  canceled: "cancelled",
}

/**
 * The account page previously only showed whatever status was last written
 * to Postgres by Bomgo's own flow (payment webhook, cancel button, etc).
 * If a reservation is cancelled directly in the Stays panel — bypassing the
 * site entirely — that local copy never finds out and stays stale forever.
 *
 * Best-effort, non-blocking: on read, re-check the live Stays status and
 * reconcile the local row if it drifted. Never throws — a Stays hiccup
 * should never break the account page, it just means the guest sees
 * whatever was last known instead of a live number.
 */
export async function syncReservationStatusFromStays(
  reservation: InternalReservation,
  repo: PostgresReservationRepository,
): Promise<ReservationStatus> {
  if (!reservation.staysReservationId || !reservation.origin?.staysConnectionId) {
    return reservation.status
  }
  // These are terminal on Bomgo's side — no need to keep re-checking Stays
  // for a stay that's already finished or a hold that already expired.
  if (reservation.status === "completed" || reservation.status === "expired") {
    return reservation.status
  }

  try {
    const connection = await getStaysConnectionRegistry().getById(reservation.origin.staysConnectionId)
    if (!connection) return reservation.status

    const adapter = new StaysReservationAdapter(connection)
    const result = await adapter.retrieve(reservation.staysReservationId)
    if (!result.ok || !result.raw) return reservation.status

    const staysType = String(result.raw?.type ?? "")
    const mapped = STAYS_TYPE_TO_STATUS[staysType]
    if (!mapped || mapped === reservation.status) return reservation.status

    const updated: InternalReservation = { ...reservation, status: mapped, updatedAt: new Date().toISOString() }
    await repo.update(updated)
    return mapped
  } catch {
    return reservation.status
  }
}
