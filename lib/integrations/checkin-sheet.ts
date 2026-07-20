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
  parking: string
}

// Column *names* in the "Apartamentos" tab header row — matched by header
// text (case/accent-insensitive) instead of a fixed position, so adding a
// new column (like "Estacionamento") or reordering existing ones doesn't
// silently break this. Falls back to nothing (empty string) for any header
// that isn't found, same as before.
const HEADER_ALIASES: Record<keyof CheckinSheetInfo, string[]> = {
  condominio: ["condominio"],
  apartamento: ["apartamento"],
  bloco: ["bloco"],
  tipo: ["tipo"],
  checkInTime: ["check-in", "checkin"],
  checkOutTime: ["check-out", "checkout"],
  address: ["endereco"],
  access: ["acesso"],
  doorPassword: ["senha porta"],
  wifiNetwork: ["rede wi-fi", "rede wifi"],
  wifiPassword: ["senha wi-fi", "senha wifi"],
  parking: ["estacionamento", "vagas", "vagas de estacionamento"],
}
const IDLISTING_ALIASES = ["_idlisting", "idlisting"]

function normalizeHeader(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function buildColumnIndex(headerRow: string[]): { fields: Record<keyof CheckinSheetInfo, number>; idlisting: number } {
  const normalized = headerRow.map(normalizeHeader)
  function findIndex(aliases: string[]): number {
    for (const alias of aliases) {
      const i = normalized.indexOf(normalizeHeader(alias))
      if (i !== -1) return i
    }
    return -1
  }
  const fields = {} as Record<keyof CheckinSheetInfo, number>
  for (const key of Object.keys(HEADER_ALIASES) as (keyof CheckinSheetInfo)[]) {
    fields[key] = findIndex(HEADER_ALIASES[key])
  }
  return { fields, idlisting: findIndex(IDLISTING_ALIASES) }
}

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
  if (rows.length === 0) return byListingId
  const { fields, idlisting: idlistingCol } = buildColumnIndex(rows[0])
  if (idlistingCol === -1) return byListingId // header changed too much to trust — safer empty than wrong
  for (const row of rows.slice(1)) {
    const idlisting = (row[idlistingCol] ?? "").trim()
    if (!idlisting) continue
    const get = (key: keyof CheckinSheetInfo) => (fields[key] === -1 ? "" : (row[fields[key]] ?? ""))
    byListingId.set(idlisting, {
      condominio: get("condominio"),
      apartamento: get("apartamento"),
      bloco: get("bloco"),
      tipo: get("tipo"),
      checkInTime: get("checkInTime"),
      checkOutTime: get("checkOutTime"),
      address: get("address"),
      access: get("access"),
      doorPassword: get("doorPassword"),
      wifiNetwork: get("wifiNetwork"),
      wifiPassword: get("wifiPassword"),
      parking: get("parking"),
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

export interface CheckinGuestData {
  guestName: string
  cpf: string
  adults: number
  children: number
  companions: string
}

// Column order in the "Checkins" tab (A:J) — codigo_reserva, apartamento,
// bloco, telefone, nome, cpf, qtd_adultos, qtd_criancas, idades_criancas,
// acompanhantes. Populated once a guest completes the check-in form.
const GUEST_COL = {
  codigoReserva: 0,
  nome: 4,
  cpf: 5,
  qtdAdultos: 6,
  qtdCriancas: 7,
  acompanhantes: 9,
} as const

let guestCache: { byReservationCode: Map<string, CheckinGuestData>; fetchedAt: number } | null = null

async function fetchGuestSheet(): Promise<Map<string, CheckinGuestData>> {
  const { apiKey, spreadsheetId } = checkinSheetConfig
  const range = "Checkins!A:J"
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    throw new Error(`checkin guest sheet fetch failed: ${res.status}`)
  }
  const data = (await res.json()) as { values?: string[][] }
  const rows = data.values ?? []
  const byReservationCode = new Map<string, CheckinGuestData>()
  for (const row of rows.slice(1)) {
    const code = (row[GUEST_COL.codigoReserva] ?? "").trim()
    if (!code) continue
    byReservationCode.set(code, {
      guestName: row[GUEST_COL.nome] ?? "",
      cpf: row[GUEST_COL.cpf] ?? "",
      adults: Number(row[GUEST_COL.qtdAdultos] ?? 0) || 0,
      children: Number(row[GUEST_COL.qtdCriancas] ?? 0) || 0,
      companions: row[GUEST_COL.acompanhantes] ?? "",
    })
  }
  return byReservationCode
}

/** Best-effort lookup — null if the guest hasn't completed the check-in
 * form yet (or on any fetch failure), so the voucher just omits the names. */
export async function getGuestCheckinData(reservationCode: string): Promise<CheckinGuestData | null> {
  if (!isCheckinSheetConfigured() || !reservationCode) return null
  try {
    if (!guestCache || Date.now() - guestCache.fetchedAt > CACHE_TTL_MS) {
      guestCache = { byReservationCode: await fetchGuestSheet(), fetchedAt: Date.now() }
    }
    return guestCache.byReservationCode.get(reservationCode) ?? null
  } catch {
    return null
  }
}
