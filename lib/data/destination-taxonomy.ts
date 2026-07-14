/**
 * Destination taxonomy — the single source of truth mapping a user-facing
 * destination string to the real geographic fields used by Stays
 * (municipality / bairro-district), so the search never conflates two
 * different places into one filter (e.g. "Fortaleza · Porto das Dunas").
 *
 * `city` must match Stays' `address.city` (município).
 * `district`, when present, must match Stays' `address.district` (bairro) —
 * used as an extra guard so a listing from another bairro can never leak
 * into a district-scoped search, even if the city-level filter is broader.
 */

export interface DestinationEntry {
  id: string
  /** Canonical label shown in the UI header, chips and URL. */
  label: string
  city: string
  district?: string
  aliases: string[]
}

export const DESTINATIONS: DestinationEntry[] = [
  {
    id: 'porto-das-dunas',
    label: 'Porto das Dunas, Aquiraz',
    city: 'Aquiraz',
    district: 'Porto das Dunas',
    aliases: ['porto das dunas', 'porto das dunas, aquiraz', 'porto das dunas aquiraz'],
  },
  {
    id: 'aquiraz',
    label: 'Aquiraz',
    city: 'Aquiraz',
    aliases: ['aquiraz'],
  },
  {
    id: 'fortaleza',
    label: 'Fortaleza',
    city: 'Fortaleza',
    aliases: ['fortaleza'],
  },
  {
    id: 'meireles',
    label: 'Meireles, Fortaleza',
    city: 'Fortaleza',
    district: 'Meireles',
    aliases: ['meireles', 'meireles, fortaleza', 'meireles fortaleza'],
  },
  {
    id: 'beira-mar',
    label: 'Beira-Mar, Fortaleza',
    city: 'Fortaleza',
    district: 'Beira-Mar',
    aliases: ['beira-mar', 'beira mar', 'beira-mar, fortaleza', 'beira mar fortaleza'],
  },
]

export function normalizeDestinationText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Resolves free text (typed input, chip, or `?destino=` query param) to a
 * known destination. Exact alias match first, then containment — but never
 * matches two different destinations from the taxonomy at once, so
 * "Fortaleza" and "Porto das Dunas" can never be treated as a single place.
 */
export function resolveDestination(freeText: string | undefined | null): DestinationEntry | null {
  if (!freeText) return null
  const norm = normalizeDestinationText(freeText)
  if (!norm) return null

  const exact = DESTINATIONS.find((d) => d.aliases.some((a) => normalizeDestinationText(a) === norm))
  if (exact) return exact

  return DESTINATIONS.find((d) => d.aliases.some((a) => norm.includes(normalizeDestinationText(a)))) ?? null
}
