/**
 * Stays sometimes returns a fractional bathroom count (e.g. 3.5 for a half
 * bath). JS's default number-to-string uses a period, which reads as
 * English formatting in Portuguese copy ("3.5 banheiros"). This renders it
 * the Brazilian way ("3,5 banheiros") and handles singular/plural.
 */
export function formatBathrooms(n: number): string {
  const value = Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')
  const label = n === 1 ? 'banheiro' : 'banheiros'
  return `${value} ${label}`
}
