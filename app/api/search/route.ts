import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import type { Property, SearchCriteria } from "@/lib/types"
import { properties } from "@/lib/data/properties"
import { searchStays, stripOrigin } from "@/lib/integrations/stays"
import { isStaysConfigured } from "@/lib/integrations/config"

export const dynamic = "force-dynamic"

export interface SearchResponse {
  criteria: SearchCriteria
  bomgo: Property[]
  partners: Property[]
  total: number
  live: boolean // true when Bomgo inventory came from the real Stays API
  requestId: string
}

export interface SearchErrorResponse {
  error: "stays-request-failed"
  message: string
  requestId: string
}

function matchesGuests(p: Property, criteria: SearchCriteria): boolean {
  const totalGuests = criteria.adults + criteria.children
  return totalGuests === 0 ? true : p.maxGuests >= totalGuests
}

const noStore = { headers: { "Cache-Control": "no-store" } }

export async function POST(request: Request) {
  const requestId = randomUUID()
  const criteria = (await request.json()) as SearchCriteria
  const tag = `[search:${requestId}]`

  console.log(
    `${tag} destino=`,
    criteria.destination,
    `checkin=${criteria.checkIn} checkout=${criteria.checkOut} guests=${criteria.adults + criteria.children}`,
  )

  // 1. Reserva Direta Bomgo — consolidated across all active Stays accounts.
  //    `origin` is stripped so the client can never tell which account a
  //    listing came from; the server keeps routing internally by connection.
  const liveBomgo = await searchStays(criteria, requestId)
  const staysConfigured = isStaysConfigured()

  // bomgo-principal está configurada e validada em produção (mode: "live").
  // Uma falha real (liveBomgo === null) NUNCA vira lista vazia disfarçada —
  // isso escondia outages atrás de "0 resultados". Retorna erro técnico.
  if (staysConfigured && liveBomgo === null) {
    console.error(`${tag} FALHA REAL na busca Stays — não mascarando com array vazio`)
    const body: SearchErrorResponse = {
      error: "stays-request-failed",
      message: "Não foi possível consultar a disponibilidade real agora. Tente novamente em instantes.",
      requestId,
    }
    return NextResponse.json(body, { status: 502, ...noStore })
  }

  const rawBomgo = staysConfigured ? (liveBomgo ?? []) : liveBomgo && liveBomgo.length > 0 ? liveBomgo : properties
  console.log(`${tag} recebidos (bomgo, pré-filtro de hóspedes): ${rawBomgo.length}`)

  const afterGuests = rawBomgo.filter((p) => matchesGuests(p, criteria))
  console.log(`${tag} após filtro de hóspedes: ${afterGuests.length}`)

  const bomgo = afterGuests.sort((a, b) => b.rating - a.rating).map(stripOrigin)

  // 2. Parceiros (Booking/Expedia via deep links) — sem integração real
  //    implementada ainda. Nada de catálogo fictício: fica vazio até existir
  //    uma fonte de dados real de parceiro.
  const partners: Property[] = []

  const response: SearchResponse = {
    criteria,
    bomgo,
    partners,
    total: bomgo.length + partners.length,
    live: staysConfigured ? liveBomgo !== null : Boolean(liveBomgo && liveBomgo.length > 0),
    requestId,
  }
  console.log(`${tag} enviado ao frontend: bomgo=${bomgo.length} partners=${partners.length} live=${response.live}`)

  return NextResponse.json(response, noStore)
}
