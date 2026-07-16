/**
 * Destination taxonomy — single source of truth mapping user input (typed
 * text, chip, or `?destino=` query param) to a structured `DestinationSelection`
 * with the real geographic fields Stays uses (município = city, bairro = region).
 *
 * A município and a bairro/região are never concatenated into one string —
 * every consumer (adapter, route, UI) reads `.city` / `.region` directly.
 */

import type { DestinationSelection, Property } from '@/lib/types'

interface DestinationTaxonomyEntry extends DestinationSelection {
  id: string
  aliases: string[]
}

export const DESTINATIONS: DestinationTaxonomyEntry[] = [
  {
    id: 'porto-das-dunas',
    type: 'neighborhood',
    label: 'Porto das Dunas, Aquiraz',
    city: 'Aquiraz',
    region: 'Porto das Dunas',
    state: 'Ceará',
    country: 'Brasil',
    aliases: ['porto das dunas', 'porto das dunas, aquiraz', 'porto das dunas aquiraz'],
  },
  {
    id: 'aquiraz',
    type: 'city',
    label: 'Aquiraz',
    city: 'Aquiraz',
    state: 'Ceará',
    country: 'Brasil',
    aliases: ['aquiraz'],
  },
  {
    id: 'fortaleza',
    type: 'city',
    label: 'Fortaleza',
    city: 'Fortaleza',
    state: 'Ceará',
    country: 'Brasil',
    aliases: ['fortaleza'],
  },
  {
    id: 'meireles',
    type: 'neighborhood',
    label: 'Meireles, Fortaleza',
    city: 'Fortaleza',
    region: 'Meireles',
    state: 'Ceará',
    country: 'Brasil',
    aliases: ['meireles', 'meireles, fortaleza', 'meireles fortaleza'],
  },
  {
    id: 'beira-mar',
    type: 'neighborhood',
    label: 'Beira-Mar, Fortaleza',
    city: 'Fortaleza',
    region: 'Beira-Mar',
    state: 'Ceará',
    country: 'Brasil',
    aliases: ['beira-mar', 'beira mar', 'beira-mar, fortaleza', 'beira mar fortaleza'],
  },
  {
    id: 'beach-park',
    type: 'neighborhood',
    label: 'Beach Park, Aquiraz',
    city: 'Aquiraz',
    region: 'Porto das Dunas',
    state: 'Ceará',
    country: 'Brasil',
    aliases: ['beach park', 'beach park aquiraz', 'beachpark'],
  },
  {
    id: 'jericoacoara',
    type: 'city',
    label: 'Jericoacoara, CE',
    city: 'Jijoca de Jericoacoara',
    state: 'Ceará',
    country: 'Brasil',
    aliases: ['jericoacoara', 'jeri', 'jijoca de jericoacoara'],
  },
  {
    id: 'maragogi',
    type: 'city',
    label: 'Maragogi, AL',
    city: 'Maragogi',
    state: 'Alagoas',
    country: 'Brasil',
    aliases: ['maragogi'],
  },
]

/**
 * Live autocomplete: matches the taxonomy against whatever the guest has
 * typed so far (prefix or substring, accent/case-insensitive) — mirrors the
 * "type and see matching neighborhoods appear" pattern from Booking/Airbnb
 * instead of a fixed set of suggestions unrelated to the input.
 */
export function searchDestinations(query: string, limit = 6): DestinationTaxonomyEntry[] {
  const norm = normalizeDestinationText(query)
  if (!norm) return []
  return DESTINATIONS.filter((d) => d.aliases.some((a) => normalizeDestinationText(a).includes(norm))).slice(
    0,
    limit,
  )
}

export function normalizeDestinationText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function toSelection(entry: DestinationTaxonomyEntry): DestinationSelection {
  const { id: _id, aliases: _aliases, ...selection } = entry
  return selection
}

/**
 * Resolves any destination input (a taxonomy id from the URL, an exact
 * label/alias, or unrecognized free text) into a structured
 * `DestinationSelection`. Two different taxonomy entries are never merged —
 * unrecognized text becomes its own unresolved selection (no city/region
 * guessed), it never silently reuses another entry's fields.
 */
export function resolveDestinationInput(input: string | null | undefined): DestinationSelection | null {
  if (!input) return null
  const trimmed = input.trim()
  const norm = normalizeDestinationText(trimmed)
  if (!norm) return null

  const byId = DESTINATIONS.find((d) => d.id === trimmed)
  if (byId) return toSelection(byId)

  const exact = DESTINATIONS.find((d) => d.aliases.some((a) => normalizeDestinationText(a) === norm))
  if (exact) return toSelection(exact)

  // Legacy/best-effort match for old bookmarked or shared links (e.g. a
  // previously concatenated "Fortaleza · Porto das Dunas" string) — resolves
  // to at most ONE known entry, never a merge of two.
  const partial = DESTINATIONS.find((d) => d.aliases.some((a) => norm.includes(normalizeDestinationText(a))))
  if (partial) return toSelection(partial)

  return { type: 'region', label: trimmed }
}

/**
 * District guard: when a destination resolves to a specific bairro/região,
 * removes any property whose real address data doesn't match it — even if
 * the upstream city-level filter was broader than expected. Uses only the
 * real `neighborhood`/`location` fields already returned by Stays.
 */
export function filterByDestinationRegion<T extends Pick<Property, 'neighborhood' | 'location'>>(
  properties: T[],
  destination: DestinationSelection | null | undefined,
): T[] {
  if (!destination?.region) return properties
  const wanted = normalizeDestinationText(destination.region)
  return properties.filter((p) => normalizeDestinationText(`${p.neighborhood} ${p.location}`).includes(wanted))
}
