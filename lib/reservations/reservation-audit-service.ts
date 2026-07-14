import "server-only"

import type { ReservationAuditEntry, ReservationStatus } from "@/lib/types"

/**
 * ReservationAuditService — append-only trail of every reservation action.
 *
 * Each entry correlates a `requestId` with a status transition so operations
 * (and future dispute resolution) can reconstruct exactly what happened, on
 * which connection, and whether it hit Stays or the simulated fallback.
 *
 * Storage is an in-memory ring buffer for preview; the `record` boundary is
 * async so it can be pointed at a durable log/table later without changing
 * callers.
 */
export interface ReservationAuditService {
  record(input: {
    reservationId: string
    requestId: string
    action: string
    fromStatus?: ReservationStatus | null
    toStatus?: ReservationStatus | null
    meta?: Record<string, unknown>
  }): Promise<void>
  listFor(reservationId: string): Promise<ReservationAuditEntry[]>
}

const MAX_ENTRIES = 1000

class InMemoryReservationAuditService implements ReservationAuditService {
  private entries: ReservationAuditEntry[] = []

  async record(input: {
    reservationId: string
    requestId: string
    action: string
    fromStatus?: ReservationStatus | null
    toStatus?: ReservationStatus | null
    meta?: Record<string, unknown>
  }): Promise<void> {
    const entry: ReservationAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      reservationId: input.reservationId,
      requestId: input.requestId,
      action: input.action,
      fromStatus: input.fromStatus ?? null,
      toStatus: input.toStatus ?? null,
      at: new Date().toISOString(),
      meta: input.meta,
    }
    this.entries.push(entry)
    if (this.entries.length > MAX_ENTRIES) this.entries.shift()
    console.log(
      `[v0] audit reservation=${entry.reservationId} req=${entry.requestId} ${entry.action}`,
      entry.fromStatus,
      "->",
      entry.toStatus,
    )
  }

  async listFor(reservationId: string): Promise<ReservationAuditEntry[]> {
    return this.entries.filter((e) => e.reservationId === reservationId)
  }
}

const globalStore = globalThis as unknown as {
  __bomgoReservationAudit?: ReservationAuditService
}

export function getReservationAuditService(): ReservationAuditService {
  if (!globalStore.__bomgoReservationAudit) {
    globalStore.__bomgoReservationAudit = new InMemoryReservationAuditService()
  }
  return globalStore.__bomgoReservationAudit
}
