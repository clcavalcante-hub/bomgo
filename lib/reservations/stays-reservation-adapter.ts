import "server-only"

import type { StaysConnection } from "@/lib/integrations/stays-connection-registry"
import type { ReservationGuestDetails } from "@/lib/types"
import { staysWrite } from "@/lib/reservations/stays-write-client"

/**
 * StaysReservationAdapter — reservation endpoints for ONE Stays connection.
 *
 * Wraps the documented Booking API reservation endpoints:
 *   - POST   /external/v1/booking/reservations             (create)
 *   - GET    /external/v1/booking/reservations/{id}        (retrieve)
 *   - PATCH  /external/v1/booking/reservations/{id}        (modify / cancel)
 *
 * The Stays checkout-redirect endpoint is intentionally NOT used: Bomgo's
 * checkout is native (Cielo, next step). A creation uses type "reserved" (a
 * hold awaiting payment), never "booked", so nothing is confirmed/paid here.
 */

export interface StaysReservationResult {
  ok: boolean
  status: number
  staysReservationId: string | null // `_id`
  reservationCode: string | null // `id`
  total: number | null
  currency: string | null
  raw: any
  error?: string
}

function mapResult(res: {
  ok: boolean
  status: number
  data: any
  error?: string
}): StaysReservationResult {
  const data = res.data
  return {
    ok: res.ok,
    status: res.status,
    staysReservationId: data?._id ? String(data._id) : null,
    reservationCode: data?.id ? String(data.id) : null,
    total: data?.price?._f_total != null ? Number(data.price._f_total) : null,
    currency: data?.price?.currency ?? null,
    raw: data,
    error: res.error,
  }
}

export class StaysReservationAdapter {
  constructor(private readonly connection: StaysConnection) {}

  /** Create a HOLD (type "reserved") on the owning account. */
  async createHold(input: {
    listingId: string
    clientId: string
    checkInDate: string
    checkOutDate: string
    checkInTime?: string
    checkOutTime?: string
    guests: number
    guestsDetails: ReservationGuestDetails
    promocode?: string
    internalNote?: string
  }): Promise<StaysReservationResult> {
    const body: Record<string, unknown> = {
      type: "reserved", // hold — never "booked" until payment (Cielo) succeeds
      listingId: input.listingId,
      _idclient: input.clientId,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      guests: input.guests,
      guestsDetails: { adults: input.guestsDetails.adults, children: input.guestsDetails.children },
    }
    if (input.checkInTime) body.checkInTime = input.checkInTime
    if (input.checkOutTime) body.checkOutTime = input.checkOutTime
    if (input.promocode) body.promocode = input.promocode
    if (input.internalNote) body.internalNote = input.internalNote

    const res = await staysWrite<any>(this.connection, {
      method: "POST",
      path: "/external/v1/booking/reservations",
      body,
    })
    return mapResult(res)
  }

  /** Retrieve a reservation from the owning account. */
  async retrieve(reservationId: string): Promise<StaysReservationResult> {
    const res = await staysWrite<any>(this.connection, {
      method: "GET",
      path: `/external/v1/booking/reservations/${encodeURIComponent(reservationId)}`,
    })
    return mapResult(res)
  }

  /** Modify a reservation (dates/guests). `type` is intentionally omitted. */
  async modify(
    reservationId: string,
    changes: Partial<{
      checkInDate: string
      checkOutDate: string
      guests: number
      guestsDetails: ReservationGuestDetails
      internalNote: string
    }>,
  ): Promise<StaysReservationResult> {
    const res = await staysWrite<any>(this.connection, {
      method: "PATCH",
      path: `/external/v1/booking/reservations/${encodeURIComponent(reservationId)}`,
      body: changes,
    })
    return mapResult(res)
  }

  /** Cancel a reservation (PATCH type "canceled"). */
  async cancel(reservationId: string, cancelMessage?: string): Promise<StaysReservationResult> {
    const res = await staysWrite<any>(this.connection, {
      method: "PATCH",
      path: `/external/v1/booking/reservations/${encodeURIComponent(reservationId)}`,
      body: { type: "canceled", cancelMessage: cancelMessage ?? "Cancelado pela Bomgo" },
    })
    return mapResult(res)
  }

  /** List a client's reservations in the owning account — used to surface
   * OTA-sourced bookings (Booking.com/Airbnb/Expedia) the guest made
   * outside Bomgo's own checkout but that still live on the same Stays
   * account. `from`/`to`/`dateType` are required by the Stays API even for
   * an "everything this client has" query, so callers pass a wide window. */
  async listByClientId(
    clientId: string,
    range: { from: string; to: string; dateType?: "arrival" | "departure" | "creation" | "creationorig" | "included" },
  ): Promise<StaysReservationResult[]> {
    const params = new URLSearchParams({
      _idclient: clientId,
      from: range.from,
      to: range.to,
      dateType: range.dateType ?? "creation",
      limit: "20",
    })
    const res = await staysWrite<any>(this.connection, {
      method: "GET",
      path: `/external/v1/booking/reservations?${params.toString()}`,
    })
    if (!res.ok || !res.data) return []
    const list: any[] = Array.isArray(res.data) ? res.data : []
    return list.map((data) => ({
      ok: true,
      status: 200,
      staysReservationId: data?._id ? String(data._id) : null,
      reservationCode: data?.id ? String(data.id) : null,
      total: data?.price?._f_total != null ? Number(data.price._f_total) : null,
      currency: data?.price?.currency ?? null,
      raw: data,
    }))
  }
}
