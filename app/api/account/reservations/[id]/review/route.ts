import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"
import type { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"
import { getReview, upsertReview } from "@/lib/reviews/review-repository"

async function requireOwnedReservation(reservationId: string, userId: string) {
  const repo = getReservationRepository() as PostgresReservationRepository
  if (typeof repo.getOwnerUserId !== "function") return true
  const ownerId = await repo.getOwnerUserId(reservationId)
  return ownerId === userId
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  if (!(await requireOwnedReservation(id, userId))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const review = await getReview(id)
  return NextResponse.json({ review })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  if (!(await requireOwnedReservation(id, userId))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: { rating?: number; comment?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid-request" }, { status: 400 })
  }

  const rating = Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Nota deve ser de 1 a 5." }, { status: 400 })
  }
  const comment = (body.comment ?? "").toString().slice(0, 2000)

  const review = await upsertReview({ reservationId: id, userId, rating, comment })
  return NextResponse.json({ review })
}

export const dynamic = "force-dynamic"
