import { NextResponse } from "next/server"
import { getStaysListing, stripOrigin } from "@/lib/integrations/stays"
import { isStaysConfigured } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

const noStore = { headers: { "Cache-Control": "no-store" } }

/**
 * GET /api/stays/listing/[id]
 * Full listing content from the Stays Content API — real data only. `id` is
 * `Property.id` (Stays' own listing id), e.g. as stored per-favorite.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!isStaysConfigured()) {
    return NextResponse.json({ live: false, property: null, error: "stays-not-configured" }, { status: 503, ...noStore })
  }

  const live = await getStaysListing(id)
  if (!live) {
    return NextResponse.json({ live: false, property: null }, { status: 404, ...noStore })
  }
  return NextResponse.json({ live: true, property: stripOrigin(live) }, noStore)
}
