export function toPaymentCents(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.round(value * 100)
}

/**
 * Payment totals are owned by the server-side reservation. The browser value
 * is accepted only as a consistency check so stale or tampered screens fail
 * closed instead of charging a different amount.
 */
export function authoritativePaymentAmount(serverTotal: number, clientTotal: number): number | null {
  const serverCents = toPaymentCents(serverTotal)
  const clientCents = toPaymentCents(clientTotal)
  if (serverCents <= 0 || clientCents <= 0 || serverCents !== clientCents) return null
  return serverCents / 100
}
