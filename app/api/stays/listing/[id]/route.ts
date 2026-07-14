import { NextResponse } from "next/server"
import { getStaysListing, stripOrigin } from "@/lib/integrations/stays"
import { getPropertyBySlug } from "@/lib/data/properties"
import { isStaysConfigured } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

/**
 * GET /api/stays/listing/[id]
 * Full listing content from the Stays Content API when configured, otherwise
 * the curated property. `live` signals which source answered.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const live = await getStaysListing(id)
  if (live) {
    return NextResponse.json({ live: true, property: stripOrigin(live) })
  }

  // bomgo-principal está configurada e validada (mode: "live"): não retorna
  // conteúdo simulado — o id realmente não existe ou a chamada real falhou.
  if (isStaysConfigured()) {
    return NextResponse.json({ live: false, property: null }, { status: 404 })
  }

  const property = getPropertyBySlug(id)
  if (!property) {
    return NextResponse.json({ live: false, property: null }, { status: 404 })
  }
  return NextResponse.json({ live: false, property })
}
