import "server-only"

import {
  getStaysConnectionRegistry,
  type StaysConnection,
  type StaysConnectionRepository,
} from "@/lib/integrations/stays-connection-registry"
import { getStaysMultiAccountService, type StaysMultiAccountService } from "@/lib/integrations/stays-multi-account"

/**
 * ReservationConnectionResolver — decides WHICH Stays account a reservation
 * must be created on, and refuses to ever silently switch accounts.
 *
 * Two modes:
 *  - LIVE (at least one configured account): asks the multi-account service
 *    which active connection actually owns the listing. If the caller passes a
 *    `connectionHint`, it MUST match the resolved owner or the resolution
 *    fails (`mismatch`) — we never auto-route to a different/primary account.
 *  - SIMULATED (no configured account): there is no real owner to honor, so we
 *    resolve to the hinted connection (or the primary) purely for internal
 *    bookkeeping and mark the result `simulated` — no Stays write will happen.
 */

export type ResolveOutcome =
  | { kind: "live"; connection: StaysConnection }
  | { kind: "simulated"; connection: StaysConnection }
  | { kind: "not_found" }
  | { kind: "mismatch"; owner: StaysConnection; hinted: string }

export class ReservationConnectionResolver {
  constructor(
    private readonly registry: StaysConnectionRepository = getStaysConnectionRegistry(),
    private readonly multiAccount: StaysMultiAccountService = getStaysMultiAccountService(),
  ) {}

  async resolve(input: { externalListingId: string; connectionHint?: string | null }): Promise<ResolveOutcome> {
    const active = await this.registry.listActive()

    // SIMULATED: nothing configured. Honor the hint if valid, else primary.
    if (active.length === 0) {
      let connection: StaysConnection | null = null
      if (input.connectionHint) connection = await this.registry.getById(input.connectionHint)
      if (!connection) connection = await this.registry.getPrimary()
      if (!connection) return { kind: "not_found" }
      return { kind: "simulated", connection }
    }

    // LIVE: find the true owner among active accounts.
    const owner = await this.multiAccount.resolveConnectionForListing(input.externalListingId)
    if (!owner) return { kind: "not_found" }

    // Never auto-switch: a provided hint must agree with the true owner.
    if (input.connectionHint && input.connectionHint !== owner.connectionId) {
      return { kind: "mismatch", owner, hinted: input.connectionHint }
    }
    return { kind: "live", connection: owner }
  }

  async getById(connectionId: string): Promise<StaysConnection | null> {
    return this.registry.getById(connectionId)
  }
}

let resolver: ReservationConnectionResolver | null = null

export function getReservationConnectionResolver(): ReservationConnectionResolver {
  if (!resolver) resolver = new ReservationConnectionResolver()
  return resolver
}
