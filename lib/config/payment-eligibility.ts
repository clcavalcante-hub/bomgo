/**
 * Payment routing by property, per Chris's decision (2026-07-20):
 *
 * - Properties in CIELO_ELIGIBLE_CODES → full checkout: Cielo card + every
 *   other payment method (Pix automático via Cielo, Google Pay).
 * - Every other property → Pix only, and NOT the automatic Cielo Pix (no
 *   public QR code generated). Instead, the guest pré-reserves the dates and
 *   the property contacts them directly with payment details. The
 *   reservation is left as `pre_reserved` (a real Stays hold, not yet paid)
 *   — no payment API is called for this path. Someone on the Bomgo side
 *   confirms the payment by hand and advances the reservation once it's
 *   verified.
 *
 * `Property.code` is Stays' short listing code (e.g. "LC03F") — same field
 * used for the reviews-per-listing matching in lib/data/reviews.ts.
 */
export const CIELO_ELIGIBLE_CODES = new Set([
  // TerraMaris — all 7 units
  "BK02I",
  "MV01I",
  "BJ02I",
  "BK03I",
  "VO01I",
  "CU01J",
  "ZY01I",
  // Landscape — 2 units
  "LC03F",
  "LC02F",
  // Terraços do Atlântico — 2 units
  "FT01J",
  "KO03I",
  // PortaMaris — 2 units
  "FR01J",
  "KV01I",
  // Mediterranée
  "KN02J",
  // Avulso
  "CO03J",
])

export function isCieloEligible(listingCode: string | null | undefined): boolean {
  return Boolean(listingCode && CIELO_ELIGIBLE_CODES.has(listingCode))
}

// Pix via Inter uses the exact same property list as Cielo (Chris's own
// properties — Beach Living/Verdefan, run by his cunhado, stay out).
export const isInterPixEligible = isCieloEligible
