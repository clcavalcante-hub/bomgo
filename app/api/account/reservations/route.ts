import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"
import type { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"

export async function GET() {
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const repo = getReservationRepository() as PostgresReservationRepository
  if (typeof repo.listByUserId !== "function") {
    return NextResponse.json({ reservations: [] })
  }
  const reservations = await repo.listByUserId(userId)
  return NextResponse.json({
    reservations: reservations.map((r) => ({
      reservationId: r.reservationId,
      reservationCode: r.reservationCode,
      status: r.status,
      checkInDate: r.checkInDate,
      checkOutDate: r.checkOutDate,
      guests: r.guests,
      amount: r.amount,
      createdAt: r.createdAt,
      propertyName: r.propertyName,
      propertyImage: r.propertyImage,
      propertyLocation: r.propertyLocation,
    })),
  })
}

export const dynamic = "force-dynamic"
