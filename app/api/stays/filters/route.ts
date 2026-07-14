import { NextResponse } from "next/server"
import { getStaysSearchFilter, type StaysSearchFilter } from "@/lib/integrations/stays"
import { allProperties } from "@/lib/data/properties"

export const dynamic = "force-dynamic"

/**
 * GET /api/stays/filters
 * Real Stays search filter when configured; otherwise a curated fallback
 * derived from the mock catalog. `live` tells the caller which one it got.
 */
export async function GET() {
  const live = await getStaysSearchFilter()
  if (live) {
    return NextResponse.json({ live: true, filter: live })
  }

  const cities = Array.from(new Set(allProperties.map((p) => p.destination).filter(Boolean)))
  const regions = Array.from(new Set(allProperties.map((p) => p.neighborhood).filter(Boolean)))
  const amenities = Array.from(
    new Map(allProperties.flatMap((p) => p.amenities).map((a) => [a.key, a.label])).entries(),
  ).map(([id, label]) => ({ id, label }))

  const fallback: StaysSearchFilter = {
    cities,
    regions,
    states: [],
    amenities,
    properties: allProperties.map((p) => ({
      id: p.id,
      name: p.name,
      city: p.destination,
      region: p.neighborhood,
    })),
    minPrice: 0,
    maxPrice: 3000,
  }
  return NextResponse.json({ live: false, filter: fallback })
}
