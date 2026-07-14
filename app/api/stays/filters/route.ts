import { NextResponse } from "next/server"
import { getStaysSearchFilter } from "@/lib/integrations/stays"
import { isStaysConfigured } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

const noStore = { headers: { "Cache-Control": "no-store" } }

/**
 * GET /api/stays/filters
 * Real Stays search filter only — never a curated substitute. `live` is
 * always `true` on success; any other state is an explicit error.
 */
export async function GET() {
  if (!isStaysConfigured()) {
    return NextResponse.json({ live: false, filter: null, error: "stays-not-configured" }, { status: 503, ...noStore })
  }

  const live = await getStaysSearchFilter()
  if (!live) {
    return NextResponse.json({ live: false, filter: null, error: "stays-request-failed" }, { status: 502, ...noStore })
  }

  return NextResponse.json({ live: true, filter: live }, noStore)
}
