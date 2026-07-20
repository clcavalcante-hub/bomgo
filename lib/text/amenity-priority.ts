/**
 * Curated priority order for the amenities that matter most to guests —
 * whenever a property has one of these (in whatever exact wording Stays
 * used), it should surface before the rest wherever amenities are listed
 * (property page, reservation card in /conta, etc). Order here is the
 * display order; unmatched amenities keep their original relative order
 * appended after.
 *
 * Matching is keyword-based against `key` (slugify of the Stays label) and
 * the raw label — same approach as `amenity-icon.tsx`, since Stays has no
 * fixed vocabulary and the exact wording varies per listing.
 */
const PRIORITY_RULES: { keywords: string[] }[] = [
  { keywords: ["wifi", "wi-fi", "internet"] },
  { keywords: ["ar-condicionado", "ar condicionado"] },
  { keywords: ["cozinha"] }, // "Cozinha equipada" / "Cozinha completa"
  { keywords: ["roupa-de-cama", "roupa de cama", "cama-e-banho", "toalha"] },
  { keywords: ["agua-quente", "água quente", "chuveiro"] },
  { keywords: ["estacionamento", "vaga", "garagem"] },
  { keywords: ["lavanderia", "maquina-de-lavar", "lavadora"] },
  { keywords: ["vista-mar", "vista para o mar", "frente-mar"] },
  { keywords: ["elevador"] },
  { keywords: ["academia", "ginasio", "ginásio"] },
  { keywords: ["churrasqueira", "bbq"] },
  { keywords: ["pet"] },
  { keywords: ["porteiro", "portaria", "seguranca", "segurança", "24-horas", "24h"] },
  { keywords: ["check-in-autonomo", "check-in autônomo", "self-checkin", "autoatendimento"] },
  { keywords: ["acessibilidade", "acessivel", "acessível", "cadeirante"] },
]

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function priorityRank(amenityKey: string, label: string): number {
  const haystack = normalize(`${amenityKey} ${label}`)
  const index = PRIORITY_RULES.findIndex((rule) => rule.keywords.some((kw) => haystack.includes(normalize(kw))))
  return index === -1 ? PRIORITY_RULES.length : index
}

export function sortAmenitiesByPriority<T extends { key: string; label: string }>(amenities: T[]): T[] {
  return amenities
    .map((amenity, originalIndex) => ({ amenity, originalIndex }))
    .sort((a, b) => {
      const rankDiff = priorityRank(a.amenity.key, a.amenity.label) - priorityRank(b.amenity.key, b.amenity.label)
      if (rankDiff !== 0) return rankDiff
      return a.originalIndex - b.originalIndex // stable order within the same rank
    })
    .map(({ amenity }) => amenity)
}
