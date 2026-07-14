/**
 * Calendar-date helpers for check-in / check-out.
 *
 * Stays dates ("2026-07-15") are calendar dates, not instants — they must
 * never go through UTC. `new Date("2026-07-15")` is parsed as UTC midnight,
 * which rolls back to the previous day in any timezone behind UTC (e.g.
 * America/Fortaleza, UTC-3). Every check-in/check-out read or write in the
 * app must use these helpers instead of `new Date(iso)` / `toISOString()`.
 */

/** Parses a "yyyy-MM-dd" string using LOCAL year/month/day — never UTC. */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Formats a Date as "yyyy-MM-dd" using LOCAL calendar components — never UTC/toISOString. */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Local midnight for a given Date (drops time-of-day, keeps calendar day). */
export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Short pt-BR label ("15 jul") for a "yyyy-MM-dd" string, parsed locally. */
export function formatLocalDateLabel(iso: string | null): string | null {
  if (!iso) return null
  return parseLocalDate(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
