import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import type { Property, SearchCriteria } from "@/lib/types"
import { searchStays, stripOrigin } from "@/lib/integrations/stays"
import { isStaysConfigured } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

export interface SearchResponse {
  criteria: SearchCriteria
  bomgo: Property[]
  partners: Property[]
  total: number
  live: true // search never succeeds with anything but real Stays data
  requestId: string
}

export interface SearchErrorResponse {
  error: "stays-not-configured" | "stays-request-failed"
  message: string
  requestId: string
}

function matchesGuests(p: Property, criteria: SearchCriteria): boolean {
  const totalGuests = criteria.adults + criteria.children
  return totalGuests === 0 ? true : p.maxGuests >= totalGuests
}

const noStore = { headers: { "Cache-Control": "no-store" } }

// Busca real exclusivamente: nunca substitui uma falha ou uma integração não
// configurada por um catálogo simulado. Qualquer estado que não seja "Stays
// respondeu com sucesso" vira um erro explícito para o cliente.
export async function POST(request: Request) {
  const requestId = randomUUID()
  const criteria = (await request.json()) as SearchCriteria
  const tag = `[search:${requestId}]`

  console.log(
    `${tag} destino=`,
    criteria.destination,
    `checkin=${criteria.checkIn} checkout=${criteria.checkOut} guests=${criteria.adults + criteria.children}`,
  )

  if (!isStaysConfigured()) {
    console.error(`${tag} Stays não configurada — sem fallback para catálogo simulado`)
    const body: SearchErrorResponse = {
      error: "stays-not-configured",
      message: "A busca de disponibilidade está temporariamente indisponível. Tente novamente em instantes.",
      requestId,
    }
    return NextResponse.json(body, { status: 503, ...noStore })
  }

  // Reserva Direta Bomgo — consolidated across all active Stays accounts.
  // `origin` is stripped so the client can never tell which account a
  // listing came from; the server keeps routing internally by connection.
  const liveBomgo = await searchStays(criteria, requestId)

  if (liveBomgo === null) {
    console.error(`${tag} FALHA REAL na busca Stays — não mascarando com array vazio`)
    const body: SearchErrorResponse = {
      error: "stays-request-failed",
      message: "Não foi possível consultar a disponibilidade real agora. Tente novamente em instantes.",
      requestId,
    }
    return NextResponse.json(body, { status: 502, ...noStore })
  }

  console.log(`${tag} recebidos (bomgo, pré-filtro de hóspedes): ${liveBomgo.length}`)
  const afterGuests = liveBomgo.filter((p) => matchesGuests(p, criteria))
  console.log(`${tag} após filtro de hóspedes: ${afterGuests.length}`)

  const bomgo = afterGuests.sort((a, b) => b.rating - a.rating).map(stripOrigin)

  // Parceiros (Booking/Expedia via deep links) — sem integração real
  // implementada ainda. Nada de catálogo fictício: fica vazio até existir
  // uma fonte de dados real de parceiro.
  const partners: Property[] = []

  const response: SearchResponse = {
    criteria,
    bomgo,
    partners,
    total: bomgo.length + partners.length,
    live: true,
    requestId,
  }
  console.log(`${tag} enviado ao frontend: bomgo=${bomgo.length} partners=${partners.length}`)

  return NextResponse.json(response, noStore)
}
