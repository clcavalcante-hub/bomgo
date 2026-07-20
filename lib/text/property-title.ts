/**
 * Stays' `internalName` field is typed freely by whoever registers the
 * listing — raw values like "LIndo Apto pe na areia" or "TERRAMARIS 302 BL
 * 3" show up verbatim on cards and the property page title. This cleans up
 * capitalization and a short list of known accent-drop typos, without an AI
 * call (titles render on list pages with many properties at once, so this
 * has to be instant) and without ever inventing or removing information —
 * only re-casing/re-accenting the exact words already there.
 */

// Tokens that must stay uppercase (real acronyms/abbreviations), matched
// case-insensitively and kept as-is instead of being Title-Cased.
const KEEP_UPPER = new Set(['tv', 'wifi', 'wi-fi', 'ar', 'ac', 'm2', 'm²', 'bl', 'al', 'ce', 'sp', 'rs', 'rj'])

// Small connector words that conventionally stay lowercase in Portuguese
// titles, unless they're the very first word.
const KEEP_LOWER = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'ao', 'aos', 'à', 'às', 'em', 'na', 'no', 'nas', 'nos', 'com', 'para', 'por'])

// Common accent-drop / typo corrections seen in real listing names —
// case-insensitive whole-word match, replaced with the corrected word only
// (never touches surrounding text).
const WORD_FIXES: Record<string, string> = {
  terreo: 'Térreo',
  térreo: 'Térreo',
  pe: 'Pé', // only meaningful standalone, e.g. "Pé na areia"
  descanço: 'Descanso',
  varanda: 'Varanda',
  toboagua: 'Toboágua',
  jacuzzi: 'Jacuzzi',
  duplex: 'Duplex',
  familia: 'Família',
  area: 'Área',
  varias: 'Várias',
}

function looksErratic(word: string): boolean {
  // Any uppercase letter after the first position reads as "typed wrong"
  // (LIndo, TerraMaris, TERRAMARIS) rather than intentional — a normal
  // Title-Cased word only ever capitalizes its first letter.
  const letters = word.replace(/[^a-zA-ZÀ-ÿ]/g, '')
  if (letters.length < 3) return false
  return /[A-ZÀ-Ÿ]/.test(letters.slice(1))
}

// Known Bomgo condo/complex names — preserve their real branding instead of
// flattening to plain Title Case (e.g. "TerraMaris", not "Terramaris").
const BRAND_NAMES: Record<string, string> = {
  terramaris: 'TerraMaris',
  portamaris: 'PortaMaris',
}

function titleCaseWord(word: string, isFirst: boolean): string {
  // Preserve leading/trailing punctuation (parentheses, commas) around the
  // core letters while re-casing just the letters.
  const match = word.match(/^(\W*)([\wÀ-ÿ]*)(\W*)$/)
  if (!match) return word
  const [, lead, core, trail] = match
  if (!core) return word

  const lower = core.toLowerCase()
  if (BRAND_NAMES[lower]) return lead + BRAND_NAMES[lower] + trail
  if (KEEP_UPPER.has(lower)) return lead + core.toUpperCase() + trail
  if (WORD_FIXES[lower]) return lead + WORD_FIXES[lower] + trail
  if (!isFirst && KEEP_LOWER.has(lower)) return lead + lower + trail
  if (/^\d/.test(core)) return word // numbers/codes untouched
  return lead + core.charAt(0).toUpperCase() + core.slice(1).toLowerCase() + trail
}

export function formatPropertyTitle(raw: string): string {
  if (!raw) return raw
  const collapsed = raw.trim().replace(/\s+/g, ' ')
  const words = collapsed.split(' ')

  const anyErratic = words.some(looksErratic)
  if (!anyErratic) return collapsed // looks intentionally cased already — leave it alone

  return words.map((w, i) => titleCaseWord(w, i === 0)).join(' ')
}
