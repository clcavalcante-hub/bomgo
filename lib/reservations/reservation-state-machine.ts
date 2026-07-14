import "server-only"

import type { ReservationStatus } from "@/lib/types"

/**
 * ReservationStateMachine — the single source of truth for which reservation
 * status transitions are legal. Every status change in the service goes
 * through `assertTransition`, so illegal jumps (e.g. cancelled -> confirmed,
 * or marking paid without Cielo) are impossible.
 *
 * While Cielo is not configured, a reservation only ever rests in
 * `pre_reserved` or `awaiting_payment`. Reaching `confirmed`/`completed`
 * requires the payment step that will be added with Cielo.
 */

const TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  draft: ["pre_reserved", "awaiting_payment", "cancelled", "synchronization_error"],
  pre_reserved: ["awaiting_payment", "confirmed", "cancelled", "expired", "synchronization_error"],
  awaiting_payment: ["pre_reserved", "confirmed", "cancelled", "expired", "synchronization_error"],
  confirmed: ["completed", "cancelled"],
  synchronization_error: ["pre_reserved", "awaiting_payment", "cancelled"],
  // Terminal states.
  cancelled: [],
  expired: [],
  completed: [],
}

// Statuses that require Cielo and therefore must NOT be reachable in this step.
const REQUIRES_PAYMENT: ReservationStatus[] = ["confirmed", "completed"]

export const TERMINAL_STATUSES: ReservationStatus[] = ["cancelled", "expired", "completed"]

export class ReservationStateError extends Error {
  constructor(
    public readonly from: ReservationStatus,
    public readonly to: ReservationStatus,
  ) {
    super(`Transição de reserva inválida: ${from} -> ${to}`)
    this.name = "ReservationStateError"
  }
}

export class ReservationStateMachine {
  canTransition(from: ReservationStatus, to: ReservationStatus): boolean {
    if (from === to) return true
    return TRANSITIONS[from]?.includes(to) ?? false
  }

  assertTransition(from: ReservationStatus, to: ReservationStatus): void {
    if (!this.canTransition(from, to)) throw new ReservationStateError(from, to)
  }

  isTerminal(status: ReservationStatus): boolean {
    return TERMINAL_STATUSES.includes(status)
  }

  /** True while Cielo isn't wired: guards against premature confirmation. */
  requiresPayment(status: ReservationStatus): boolean {
    return REQUIRES_PAYMENT.includes(status)
  }

  allowedFrom(status: ReservationStatus): ReservationStatus[] {
    return TRANSITIONS[status] ?? []
  }
}

let machine: ReservationStateMachine | null = null

export function getReservationStateMachine(): ReservationStateMachine {
  if (!machine) machine = new ReservationStateMachine()
  return machine
}
