import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { getReservationRepository } from "@/lib/reservations/reservation-repository"
import type { PostgresReservationRepository } from "@/lib/reservations/postgres-reservation-repository"
import { getStaysMultiAccountService } from "@/lib/integrations/stays-multi-account"
import { getCheckinInfo, getGuestCheckinData } from "@/lib/integrations/checkin-sheet"
import { getReviewsByReservationIds } from "@/lib/reviews/review-repository"
import { syncReservationStatusFromStays } from "@/lib/reservations/status-sync"

export async function GET() {
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  // Reservation-code login sessions (id `ota:...`) have no row in the users
  // table — they're meant for /minha-reserva, not this Postgres-backed
  // dashboard. Return empty instead of letting a non-UUID id hit the query.
  if (userId.startsWith("ota:")) {
    return NextResponse.json({ reservations: [] })
  }
  const repo = getReservationRepository() as PostgresReservationRepository
  if (typeof repo.listByUserId !== "function") {
    return NextResponse.json({ reservations: [] })
  }
  const reservations = await repo.listByUserId(userId)
  const reviews = await getReviewsByReservationIds(reservations.map((r) => r.reservationId)).catch(
    () => new Map(),
  )

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
      let houseRules: string[] = []
      try {
        const listing = await service.getListing(r.origin.externalListingId)
        if (listing) {
          images = listing.images
          amenities = listing.amenities
          latitude = listing.latitude ?? null
          longitude = listing.longitude ?? null
          fullAddress = listing.fullAddress ?? null
          houseRules = listing.rules ?? []
        }
      } catch {
        // Best-effort — card still shows the saved name/single image/location.
      }
      const checkinInfo = await getCheckinInfo(r.origin.externalListingId)
      const guestCheckinData = await getGuestCheckinData(r.reservationCode ?? "")
      // Reconciles with the live Stays status — catches cancellations (or
      // other changes) made directly in the Stays panel, which never touch
      // Postgres on their own. Best-effort: falls back to r.status on any
      // failure so a Stays hiccup never breaks the account page.
      const liveStatus = await syncReservationStatusFromStays(r, repo)
      return {
        reservationId: r.reservationId,
        reservationCode: r.reservationCode,
        staysReservationId: r.staysReservationId,
        externalListingId: r.origin.externalListingId,
        partnerId: r.origin.partnerId,
        status: liveStatus,
        checkInDate: r.checkInDate,
        checkOutDate: r.checkOutDate,
        guests: r.guests,
        guestsDetails: r.guestsDetails,
        amount: r.amount,
        createdAt: r.createdAt,
        propertyName: r.propertyName,
        propertyImage: r.propertyImage,
        propertyLocation: r.propertyLocation,
        propertyFullAddress: fullAddress,
        propertyHouseRules: houseRules,
        propertyImages: images,
        propertyAmenities: amenities,
        propertyLatitude: latitude,
        propertyLongitude: longitude,
        checkinInfo,
        guestCheckinData,
        review: reviews.get(r.reservationId) ?? null,
      }
    }),
  )

  return NextResponse.json({ reservations: withProperty })
}

export const dynamic = "force-dynamic"
