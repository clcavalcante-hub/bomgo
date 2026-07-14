import { NextResponse } from "next/server"
import { allProperties } from "@/lib/data/properties"
import { getReservationService } from "@/lib/reservations/reservation-service"
import { requestIdFrom, statusForErrorCode } from "@/lib/reservations/http"
import type { ReservationCustomer, ReservationGuestDetails } from "@/lib/types"

interface CreateBody {
  listingId?: string // external Stays listing id (or curated slug/id in preview)
  connectionId?: string | null // optional owning-connection hint (never auto-switched)
  checkInDate?: string
  checkOutDate?: string
  guests?: { adults?: number; children?: number }
  customer?: Partial<ReservationCustomer>
  promocode?: string
}

/**
 * POST /api/reservations
 *
 * Creates a pre-reservation (hold) on the CORRECT Stays account for the
 * listing. Price is recalculated server-side (never trusted from the body),
 * availability is rechecked, double-booking is blocked, and an Idempotency-Key
 * header prevents duplicate holds. With no credentials it simulates the hold
 * and flags `simulated: true`.
 */
export async function POST(request: Request) {
  const requestId = requestIdFrom(request)
  const idempotencyKey = request.headers.get("idempotency-key")

  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 })
  }

  const guestsDetails: ReservationGuestDetails = {
    adults: Number(body.guests?.adults ?? 0),
    children: Number(body.guests?.children ?? 0),
  }

  // Server-derived fallback pricing (simulated mode only) — from the curated
  // catalog, NEVER from the browser. Matches by external id or slug.
  const catalog = allProperties.find(
    (p) => p.id === body.listingId || p.slug === body.listingId,
  )
  const fallbackPricing = catalog
    ? { nightlyPrice: catalog.nightlyPrice, cleaningFee: catalog.cleaningFee, energyFee: catalog.energyFee }
    : undefined

  const service = getReservationService()
  const result = await service.create({
    externalListingId: String(body.listingId ?? ""),
    connectionHint: body.connectionId ?? null,
    checkInDate: String(body.checkInDate ?? ""),
    checkOutDate: String(body.checkOutDate ?? ""),
    guestsDetails,
    customer: {
      firstName: String(body.customer?.firstName ?? ""),
      lastName: String(body.customer?.lastName ?? ""),
      email: String(body.customer?.email ?? ""),
      phone: body.customer?.phone,
      document: body.customer?.document,
    },
    idempotencyKey,
    requestId,
    promocode: body.promocode,
    fallbackPricing,
  })

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code, meta: result.meta, requestId },
      { status: statusForErrorCode(result.code) },
    )
  }

  return NextResponse.json({ ...service.toView(result.value), requestId }, { status: 201 })
}

export const dynamic = "force-dynamic"
