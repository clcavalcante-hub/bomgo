import { NextResponse } from "next/server"
import { calculateStaysPrice } from "@/lib/integrations/stays"
import { isStaysConfigured } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

const noStore = { headers: { "Cache-Control": "no-store" } }

interface PriceRequest {
  listingIds: string[]
  from: string
  to: string
  guests: number
  promocode?: string
}

/**
 * POST /api/stays/price
 * Confirms the real price of one or more units via Stays calculate-price.
 * Never falls back to a simulated price — a guest must never be shown or
 * charged a value that Stays itself did not confirm.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as PriceRequest

  if (!isStaysConfigured()) {
    return NextResponse.json(
      { live: false, prices: [], error: "stays-not-configured" },
      { status: 503, ...noStore },
    )
  }

  const live = await calculateStaysPrice({
    listingIds: body.listingIds,
    from: body.from,
    to: body.to,
    guests: body.guests,
    promocode: body.promocode,
  })

  if (!live) {
    return NextResponse.json({ live: false, prices: [], error: "stays-request-failed" }, { status: 502, ...noStore })
  }

  return NextResponse.json({ live: true, prices: live }, noStore)
}
