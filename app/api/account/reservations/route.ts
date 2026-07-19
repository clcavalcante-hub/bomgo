import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"
import type { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"
import { getStaysMultiAccountService } from "@/lib/integrations/stays-multi-account"

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

  // Enrich with live listing details (gallery, amenities, coordinates) so
  // the reservation card can show the same info the guest already saw when
  // booking — best-effort per reservation, never blocks the list if one
  // Stays lookup fails or is slow.
  const service = getStaysMultiAccountService()
  const withProperty = await Promise.all(
    reservations.map(async (r) => {
      let images: { src: string; alt: string }[] = []
      let amenities: { key: string; label: string }[] = []
      let latitude: number | null = null
      let longitude: number | null = null
      let fullAddress: string | null = null
      try {
        const listing = await service.getListing(r.origin.externalListingId)
        if (listing) {
          images = listing.images
          amenities = listing.amenities
          latitude = listing.latitude ?? null
          longitude = listing.longitude ?? null
          fullAddress = listing.fullAddress ?? null
        }
      } catch {
        // Best-effort — card still shows the saved name/single image/location.
      }
      return {
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
        propertyFullAddress: fullAddress,
        propertyImages: images,
        propertyAmenities: amenities,
        propertyLatitude: latitude,
        propertyLongitude: longitude,
      }
    }),
  )

  return NextResponse.json({ reservations: withProperty })
}

export const dynamic = "force-dynamic"
