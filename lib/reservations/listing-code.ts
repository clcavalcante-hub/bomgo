import "server-only"

import { StaysAdapter } from "@/lib/integrations/stays-adapter"
import { getStaysConnectionRegistry } from "@/lib/integrations/stays-connection-registry"
import type { InternalReservation } from "@/lib/types"

/**
 * Resolves the short Stays listing code (e.g. "LC03F") for a reservation's
 * property — used to decide payment routing (Cielo vs Inter Pix) server-side,
 * mirroring the same CIELO_ELIGIBLE_CODES list the client already checks in
 * checkout-flow.tsx. Returns null on any failure so callers can fall back
 * safely instead of throwing mid-payment.
 */
export async function listingCodeForReservation(reservation: InternalReservation): Promise<string | null> {
  try {
    const connection = await getStaysConnectionRegistry().getById(reservation.origin.staysConnectionId)
    if (!connection) return null
    const adapter = new StaysAdapter(connection)
    const property = await adapter.getListing(reservation.origin.externalListingId)
    return property?.code ?? null
  } catch {
    return null
  }
}
