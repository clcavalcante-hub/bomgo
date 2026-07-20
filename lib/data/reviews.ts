/**
 * Curated from the real guest-review export (Stays internal dashboard,
 * synced from Booking.com/Airbnb) on 2026-07-20. Only 5-star reviews with
 * a real written comment are included — never generated, never rephrased.
 * `listingCode` matches `Property.code` (Stays' short listing code, e.g.
 * "LC03F") so a property page can show its own reviews when it has any.
 *
 * Guest names are trimmed to first name + last initial (no full name/photo)
 * per privacy — same guests appear in Stays' own public review pages, but
 * we don't need to repeat the full name here.
 *
 * Update by re-exporting from the reviews panel and re-curating by hand —
 * this is not a live integration (Stays has no public reviews API; see
 * /areas/website-redesign.md for why).
 */

export interface CuratedReview {
  id: string
  listingCode: string
  guestName: string
  rating: number
  quote: string
  channel: 'Airbnb' | 'Booking.com'
  date: string // "mês de aaaa", already human-readable, never invented
}

export const curatedReviews: CuratedReview[] = [
  {
    id: 'rev-ua02h-isabella',
    listingCode: 'UA02H',
    guestName: 'Isabella A.',
    rating: 5,
    quote:
      'Apartamento excelente, espaçoso e confortável. Localização privilegiada. Pé na areia! Condomínio extremamente organizado e bem familiar.',
    channel: 'Airbnb',
    date: 'julho de 2026',
  },
  {
    id: 'rev-lc03f-gabriel',
    listingCode: 'LC03F',
    guestName: 'Gabriel L.',
    rating: 5,
    quote:
      'O check-in foi rápido e prático. O apartamento é limpo, organizado, funcional e conta com camas confortáveis. A vista da varanda é um espetáculo à parte.',
    channel: 'Booking.com',
    date: 'julho de 2026',
  },
  {
    id: 'rev-jn02f-thulio',
    listingCode: 'JN02F',
    guestName: 'Thulio G.',
    rating: 5,
    quote: 'Tudo excelente! Localização perfeita, prédio excelente para crianças.',
    channel: 'Airbnb',
    date: 'julho de 2026',
  },
  {
    id: 'rev-qh01g-adalberto',
    listingCode: 'QH01G',
    guestName: 'Adalberto A.',
    rating: 5,
    quote:
      'Local da hospedagem limpo e organizado, possui todos os utensílios para uma excelente estadia. Foi flexível no check out. Espaço confortável, recomendo.',
    channel: 'Airbnb',
    date: 'julho de 2026',
  },
  {
    id: 'rev-kn02j-mariana',
    listingCode: 'KN02J',
    guestName: 'Mariana L.',
    rating: 5,
    quote: 'Apartamento muito funcional e aconchegante.',
    channel: 'Airbnb',
    date: 'julho de 2026',
  },
  {
    id: 'rev-ch01j-helen',
    listingCode: 'CH01J',
    guestName: 'Helen M.',
    rating: 5,
    quote: 'Excelente localização; piscina muito boa; muito próximo à praia.',
    channel: 'Booking.com',
    date: 'julho de 2026',
  },
  {
    id: 'rev-jn02f-helen',
    listingCode: 'JN02F',
    guestName: 'Helen M.',
    rating: 5,
    quote: 'Excelente localização; piscina muito boa; muito próximo à praia.',
    channel: 'Booking.com',
    date: 'julho de 2026',
  },
  {
    id: 'rev-ua02h-bruno',
    listingCode: 'UA02H',
    guestName: 'Bruno R.',
    rating: 5,
    quote:
      'Ótima estadia, condomínio ótimo, moradores super receptivos, ambiente extremamente familiar e próximo em frente à praia.',
    channel: 'Airbnb',
    date: 'junho de 2026',
  },
]

// Fixed selection for the homepage band — real aggregate from the same
// export (28 rated reviews, average 4.375 → shown as 4,4). Recompute by
// hand on the next export rather than deriving it live from `curatedReviews`
// above, since that array is a curated subset, not the full data set.
export const reviewsSummary = {
  average: 4.4,
  count: 28,
  channels: ['Airbnb', 'Booking.com'] as const,
}
