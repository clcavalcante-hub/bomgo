import "server-only"

import { query } from "@/lib/db"

export interface Review {
  reservationId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
}

let schemaReady: Promise<void> | null = null

// Lazy schema creation — this repo has no separate migration runner, so the
// table is created on first use, matching how the rest of the app is
// deployed (see /areas/infrastructure.md for the VPS Postgres setup).
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = query(`
      CREATE TABLE IF NOT EXISTS reviews (
        reservation_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `).then(() => undefined)
  }
  return schemaReady
}

export async function getReview(reservationId: string): Promise<Review | null> {
  await ensureSchema()
  const rows = await query<{
    reservation_id: string
    rating: number
    comment: string
    created_at: string
    updated_at: string
  }>("SELECT reservation_id, rating, comment, created_at, updated_at FROM reviews WHERE reservation_id = $1", [
    reservationId,
  ])
  const row = rows[0]
  if (!row) return null
  return {
    reservationId: row.reservation_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getReviewsByReservationIds(reservationIds: string[]): Promise<Map<string, Review>> {
  await ensureSchema()
  if (reservationIds.length === 0) return new Map()
  const rows = await query<{
    reservation_id: string
    rating: number
    comment: string
    created_at: string
    updated_at: string
  }>(
    "SELECT reservation_id, rating, comment, created_at, updated_at FROM reviews WHERE reservation_id = ANY($1)",
    [reservationIds],
  )
  const map = new Map<string, Review>()
  for (const row of rows) {
    map.set(row.reservation_id, {
      reservationId: row.reservation_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  }
  return map
}

export async function upsertReview(input: {
  reservationId: string
  userId: string
  rating: number
  comment: string
}): Promise<Review> {
  await ensureSchema()
  const rows = await query<{
    reservation_id: string
    rating: number
    comment: string
    created_at: string
    updated_at: string
  }>(
    `INSERT INTO reviews (reservation_id, user_id, rating, comment, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (reservation_id)
     DO UPDATE SET rating = $3, comment = $4, updated_at = now()
     RETURNING reservation_id, rating, comment, created_at, updated_at`,
    [input.reservationId, input.userId, input.rating, input.comment],
  )
  const row = rows[0]
  return {
    reservationId: row.reservation_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
