import { NextResponse } from "next/server"
import { getStaysCalendar } from "@/lib/integrations/stays"
import { isStaysConfigured } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get("listingId")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (!listingId || !from || !to) {
    return NextResponse.json({ error: "missing-params" }, { status: 400 })
  }

  if (!isStaysConfigured()) {
    return NextResponse.json({ blockedDates: [] })
  }

  const blockedDates = await getStaysCalendar(listingId, from, to)
  if (!blockedDates) {
    // Real failure (network/auth) — tell the widget so it can show every
    // date selectable rather than silently pretending everything's free.
    return NextResponse.json({ error: "stays-request-failed", blockedDates: [] }, { status: 502 })
  }

  return NextResponse.json({ blockedDates })
}
