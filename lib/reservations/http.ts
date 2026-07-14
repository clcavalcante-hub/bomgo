import "server-only"

import type { ReservationErrorCode } from "@/lib/reservations/reservation-service"

/** Map a service error code to an HTTP status. */
export function statusForErrorCode(code: ReservationErrorCode): number {
  switch (code) {
    case "validation":
      return 400
    case "not_found":
      return 404
    case "mismatch":
      return 409
    case "duplicate":
      return 409
    case "state":
      return 409
    case "unavailable":
      return 422
    case "stays_error":
      return 502
    default:
      return 400
  }
}

/** Stable request id for correlation across logs + audit. */
export function requestIdFrom(request: Request): string {
  return (
    request.headers.get("x-request-id") ??
    `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  )
}
