import { NextResponse } from "next/server"
import { calculateStaysPrice } from "@/lib/integrations/stays"
import { getPropertyBySlug } from "@/lib/data/properties"
import { computePrice, nightsBetween } from "@/lib/pricing"
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
 * Falls back to the local price simulation when Stays is not configured.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as PriceRequest

  const live = await calculateStaysPrice({
    listingIds: body.listingIds,
    from: body.from,
    to: body.to,
    guests: body.guests,
    promocode: body.promocode,
  })

  if (live) {
    return NextResponse.json({ live: true, prices: live }, noStore)
  }

  // bomgo-principal está configurada e validada (mode: "live"): nunca simula
  // preço a partir do catálogo curado — falha real deve aparecer como falha.
  if (isStaysConfigured()) {
    return NextResponse.json({ live: false, prices: [], error: "stays-request-failed" }, { status: 502, ...noStore })
  }

  // Fallback: simulate from curated catalog (apenas quando Stays NÃO está configurada).
  const nights = nightsBetween(body.from, body.to)
  const prices = body.listingIds.map((id) => {
    const property = getPropertyBySlug(id)
    if (!property) {
      return { listingId: id, from: body.from, to: body.to, guests: body.guests, total: 0, currency: "BRL", feesIncluded: true, fees: [] }
    }
    const p = computePrice(property, nights)
    return {
      listingId: id,
      from: body.from,
      to: body.to,
      guests: body.guests,
      total: p.total,
      currency: "BRL",
      feesIncluded: true,
      fees: [
        { label: "Taxa de limpeza", value: p.cleaningFee },
        { label: "Taxa de serviço", value: p.serviceFee },
      ],
    }
  })
  return NextResponse.json({ live: false, prices }, noStore)
}
