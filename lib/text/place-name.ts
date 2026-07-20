/**
 * Location strings from Stays (district/city/region) are typed freely and
 * often over-capitalize connector words — "Porto Das Dunas" instead of
 * "Porto das Dunas". Unlike `formatPropertyTitle` (which only touches
 * clearly erratic casing like "TERRAMARIS"), this always lowercases
 * Portuguese connectors, since a place name is never itself "erratic"
 * looking — each word is individually well-capitalized, just the wrong one.
 */

const KEEP_LOWER = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'ao', 'aos', 'à', 'às', 'em', 'na', 'no', 'nas', 'nos'])
const KEEP_UPPER = new Set(['ce', 'sp', 'rj', 'rs', 'al', 'ba', 'pe', 'rn'])

export function formatPlaceName(raw: string): string {
  if (!raw) return raw
  const collapsed = raw.trim().replace(/\s+/g, ' ')
  if (!collapsed) return collapsed

  return collapsed
    .split(' ')
    .map((word, i) => {
      const match = word.match(/^(\W*)([\wÀ-ÿ]*)(\W*)$/)
      if (!match) return word
      const [, lead, core, trail] = match
      if (!core) return word
      const lower = core.toLowerCase()
      if (KEEP_UPPER.has(lower)) return lead + core.toUpperCase() + trail
      if (i > 0 && KEEP_LOWER.has(lower)) return lead + lower + trail
      // First letter capitalized, rest lowercase — never touches words that
      // already look intentional (e.g. acronyms), only forces the common case.
      return lead + core.charAt(0).toUpperCase() + core.slice(1).toLowerCase() + trail
    })
    .join(' ')
}
