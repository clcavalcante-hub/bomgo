/**
 * Preview reservations store.
 *
 * Confirmed reservations are kept in localStorage so the customer area (/conta)
 * can list them without a backend. The `StoredReservation` shape is the exact
 * payload a real reservations endpoint would return, so swapping to the Stays
 * booking API + a database later is a drop-in replacement.
 */

export interface StoredReservation {
  code: string
  propertySlug: string
  propertyName: string
  propertyImage: string
  location: string
  checkInLabel: string
  checkOutLabel: string
  total: number
  method: 'pix' | 'card' | 'googlepay'
  createdAt: string
}

const KEY = 'bomgo.reservations'

export function getReservations(): StoredReservation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as StoredReservation[]) : []
  } catch {
    return []
  }
}

export function saveReservation(reservation: StoredReservation) {
  if (typeof window === 'undefined') return
  try {
    const current = getReservations()
    // De-dupe by voucher code in case of re-render.
    const next = [reservation, ...current.filter((r) => r.code !== reservation.code)]
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}
