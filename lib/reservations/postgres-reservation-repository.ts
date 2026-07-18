import "server-only"

import type { InternalReservation } from "@/lib/types"
import { query } from "@/lib/db"
import type { ReservationRepository } from "@/lib/reservations/reservation-repository"

/** Maps a Postgres row back into the InternalReservation shape the service uses. */
function rowToReservation(row: any): InternalReservation {
  return {
    reservationId: row.reservation_id,
    idempotencyKey: row.idempotency_key,
    status: row.status,
    origin: {
      internalPropertyId: row.internal_property_id,
      externalListingId: row.external_listing_id,
      staysConnectionId: row.stays_connection_id,
      partnerId: row.partner_id,
      sourceAccount: row.source_account,
    },
    staysReservationId: row.stays_reservation_id,
    reservationCode: row.reservation_code,
    staysClientId: row.stays_client_id,
    customer: {
      firstName: row.customer_first_name,
      lastName: row.customer_last_name,
      email: row.customer_email,
      phone: row.customer_phone ?? undefined,
      document: row.customer_document ?? undefined,
    },
    checkInDate: toDateStr(row.check_in_date),
    checkOutDate: toDateStr(row.check_out_date),
    guests: row.guests,
    guestsDetails: { adults: row.adults, children: row.children },
    amount: row.amount,
    simulated: row.simulated,
    holdExpiresAt: row.hold_expires_at ? new Date(row.hold_expires_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    requestId: row.request_id,
  }
}

// Postgres DATE columns come back as JS Date objects (midnight UTC) — format
// back to plain YYYY-MM-DD, never through a timezone-shifting toISOString().
function toDateStr(d: unknown): string {
  if (typeof d === "string") return d.slice(0, 10)
  if (d instanceof Date) {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
  return String(d)
}

export class PostgresReservationRepository implements ReservationRepository {
  async create(r: InternalReservation): Promise<InternalReservation> {
    await query(
      `INSERT INTO reservations (
        reservation_id, idempotency_key, status, internal_property_id, external_listing_id,
        stays_connection_id, partner_id, source_account, stays_reservation_id, reservation_code,
        stays_client_id, customer_first_name, customer_last_name, customer_email, customer_phone,
        customer_document, check_in_date, check_out_date, guests, adults, children, amount,
        simulated, hold_expires_at, request_id, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
      ON CONFLICT (reservation_id) DO NOTHING`,
      [
        r.reservationId,
        r.idempotencyKey,
        r.status,
        r.origin.internalPropertyId,
        r.origin.externalListingId,
        r.origin.staysConnectionId,
        r.origin.partnerId,
        r.origin.sourceAccount,
        r.staysReservationId,
        r.reservationCode,
        r.staysClientId,
        r.customer.firstName,
        r.customer.lastName,
        r.customer.email,
        r.customer.phone ?? null,
        r.customer.document ?? null,
        r.checkInDate,
        r.checkOutDate,
        r.guests,
        r.guestsDetails.adults,
        r.guestsDetails.children,
        JSON.stringify(r.amount),
        r.simulated,
        r.holdExpiresAt,
        r.requestId,
        r.createdAt,
        r.updatedAt,
      ],
    )
    return r
  }

  /** Denormalized display info (name/image/location) for the customer's
   * reservation list — set right after creation, outside the storage-agnostic
   * reservation-service so it never needs to know about property display data. */
  async setPropertyMeta(reservationId: string, meta: { name: string; image: string; location: string }): Promise<void> {
    await query(
      "UPDATE reservations SET property_name = $1, property_image = $2, property_location = $3 WHERE reservation_id = $4",
      [meta.name, meta.image, meta.location, reservationId],
    )
  }

  /** Owner check for authorizing self-service actions (cancel, etc.) —
   * returns null if the reservation has no linked account. */
  async getOwnerUserId(reservationId: string): Promise<string | null> {
    const rows = await query<{ user_id: string | null }>("SELECT user_id FROM reservations WHERE reservation_id = $1", [
      reservationId,
    ])
    return rows[0]?.user_id ?? null
  }

  /** Link a reservation to a logged-in user — called separately from create()
   * so the storage-agnostic reservation-service never needs to know about
   * accounts at all. */
  async linkUser(reservationId: string, userId: string): Promise<void> {
    await query("UPDATE reservations SET user_id = $1 WHERE reservation_id = $2", [userId, reservationId])
  }

  async update(r: InternalReservation): Promise<InternalReservation> {
    await query(
      `UPDATE reservations SET
        status=$2, stays_reservation_id=$3, reservation_code=$4, stays_client_id=$5,
        amount=$6, simulated=$7, hold_expires_at=$8, updated_at=$9
       WHERE reservation_id=$1`,
      [
        r.reservationId,
        r.status,
        r.staysReservationId,
        r.reservationCode,
        r.staysClientId,
        JSON.stringify(r.amount),
        r.simulated,
        r.holdExpiresAt,
        r.updatedAt,
      ],
    )
    return r
  }

  async getById(reservationId: string): Promise<InternalReservation | null> {
    const rows = await query("SELECT * FROM reservations WHERE reservation_id = $1", [reservationId])
    return rows[0] ? rowToReservation(rows[0]) : null
  }

  async getByIdempotencyKey(key: string): Promise<InternalReservation | null> {
    const rows = await query("SELECT * FROM reservations WHERE idempotency_key = $1", [key])
    return rows[0] ? rowToReservation(rows[0]) : null
  }

  async findActiveOverlap(input: {
    externalListingId: string
    staysConnectionId: string
    checkInDate: string
    checkOutDate: string
  }): Promise<InternalReservation | null> {
    const rows = await query(
      `SELECT * FROM reservations
       WHERE external_listing_id = $1 AND stays_connection_id = $2
         AND status IN ('pre_reserved','awaiting_payment','confirmed')
         AND check_in_date < $4 AND check_out_date > $3
       LIMIT 1`,
      [input.externalListingId, input.staysConnectionId, input.checkInDate, input.checkOutDate],
    )
    return rows[0] ? rowToReservation(rows[0]) : null
  }

  async findExpirable(now: string): Promise<InternalReservation[]> {
    const rows = await query(
      `SELECT * FROM reservations
       WHERE status IN ('pre_reserved','awaiting_payment') AND hold_expires_at IS NOT NULL AND hold_expires_at <= $1`,
      [now],
    )
    return rows.map(rowToReservation)
  }

  async list(): Promise<InternalReservation[]> {
    const rows = await query("SELECT * FROM reservations ORDER BY created_at DESC")
    return rows.map(rowToReservation)
  }

  async listByUserId(userId: string): Promise<(InternalReservation & {
    propertyName: string | null
    propertyImage: string | null
    propertyLocation: string | null
  })[]> {
    const rows = await query("SELECT * FROM reservations WHERE user_id = $1 ORDER BY created_at DESC", [userId])
    return rows.map((row) => ({
      ...rowToReservation(row),
      propertyName: row.property_name,
      propertyImage: row.property_image,
      propertyLocation: row.property_location,
    }))
  }
}
