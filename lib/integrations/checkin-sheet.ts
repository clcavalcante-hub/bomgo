import "server-only"

import { checkinSheetConfig, isCheckinSheetConfigured } from "@/lib/integrations/config"

export interface CheckinSheetInfo {
  condominio: string
  apartamento: string
  bloco: string
  tipo: string
  checkInTime: string
  checkOutTime: string
  address: string
  access: string
  doorPassword: string
  wifiNetwork: string
  wifiPassword: string
}

// Column order in the "Apartamentos" tab (A:N) — see /areas/infrastructure.md.
// Condomínio, Apartamento, Bloco, Código, Tipo, Check-in, Check-out,
// Endereço, Acesso, Senha Porta, Rede Wi-Fi, Senha Wi-Fi, _idlisting, property...
const COL = {
  condominio: 0,
  apartamento: 1,
  bloco: 2,
  tipo: 4,
  checkIn: 5,
  checkOut: 6,
  endereco: 7,
  acesso: 8,
  senhaPorta: 9,
  redeWifi: 10,
  senhaWifi: 11,
  idlisting: 12,
} as const

let cache: { byListingId: Map<string, CheckinSheetInfo>; fetchedAt: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 min — access info rarely changes intraday

async function fetchSheet(): Promise<Map<string, CheckinSheetInfo>> {
  const { apiKey, spreadsheetId, range } = checkinSheetConfig
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    throw new Error(`checkin sheet fetch failed: ${res.status}`)
  }
  const data = (await res.json()) as { values?: string[][] }
  const rows = data.values ?? []
  const byListingId = new Map<string, CheckinSheetInfo>()
  // Row 0 is the header.
  for (const row of rows.slice(1)) {
    const idlisting = (row[COL.idlisting] ?? "").trim()
    if (!idlisting) continue
    byListingId.set(idlisting, {
      condominio: row[COL.condominio] ?? "",
      apartamento: row[COL.apartamento] ?? "",
      bloco: row[COL.bloco] ?? "",
      tipo: row[COL.tipo] ?? "",
      checkInTime: row[COL.checkIn] ?? "",
      checkOutTime: row[COL.checkOut] ?? "",
      address: row[COL.endereco] ?? "",
      access: row[COL.acesso] ?? "",
      doorPassword: row[COL.senhaPorta] ?? "",
      wifiNetwork: row[COL.redeWifi] ?? "",
      wifiPassword: row[COL.senhaWifi] ?? "",
    })
  }
  return byListingId
}

/** Best-effort lookup — returns null on any failure so the reservation card
 * always falls back to the Stays house-rules text instead of breaking. */
export async function getCheckinInfo(externalListingId: string): Promise<CheckinSheetInfo | null> {
  if (!isCheckinSheetConfigured()) return null
  try {
    if (!cache || Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
      cache = { byListingId: await fetchSheet(), fetchedAt: Date.now() }
    }
    return cache.byListingId.get(externalListingId) ?? null
  } catch {
    return null
  }
}
