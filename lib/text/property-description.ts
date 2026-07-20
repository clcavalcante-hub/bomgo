/**
 * Stays listing descriptions are typed freely by whoever registers the
 * property and often carry leftover markup/formatting artifacts from
 * whatever tool they were copy-pasted from — stray `##`/`@@` used as
 * ad-hoc headers/bullets, runs of "!!!!" for emphasis, and accidental
 * word-for-word repetition from copy-paste edits. This cleans up that
 * class of noise without ever rewriting, shortening, or inventing content
 * — every real word the host wrote stays exactly where it is.
 */

// Same accent-drop fixes as the title formatter, but lowercase (body text,
// not a title) — only whole-word matches, case-insensitive.
const WORD_FIXES: Record<string, string> = {
  terreo: 'térreo',
  descanço: 'descanso',
  toboagua: 'toboágua',
  familia: 'família',
  varias: 'várias',
  area: 'área',
  varanda: 'varanda',
}

export function sanitizeDescriptionText(raw: string): string {
  if (!raw) return raw
  let text = raw

  // Strip stray markup-as-emphasis characters used as pseudo-headers/bullets
  // (e.g. "##Localização##", "@@Destaques@@") — keep the words, drop the
  // symbols, insert a line break so the label still reads as a heading.
  text = text.replace(/[#@]{1,3}\s*([^#@\n]+?)\s*[#@]{1,3}/g, '\n$1\n')

  // Leftover stray symbols not caught by the pattern above.
  text = text.replace(/[#@]+/g, '')

  // Collapse repeated punctuation used for false emphasis: "incrível!!!!"
  // → "incrível!", "??" → "?". A single mark still reads as intentional.
  text = text.replace(/([!?])\1+/g, '$1')

  // Collapse an immediately-repeated word (copy/paste artifact), keeping
  // the first occurrence's casing — case-insensitive match.
  text = text.replace(/\b(\p{L}+)\b(?:\s+\1\b)+/giu, '$1')

  // Word-level typo fixes, whole-word only so nothing inside another word
  // is touched.
  for (const [wrong, right] of Object.entries(WORD_FIXES)) {
    text = text.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right)
  }

  // Collapse whitespace runs (but keep the paragraph breaks inserted above).
  text = text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')

  return text.trim()
}
