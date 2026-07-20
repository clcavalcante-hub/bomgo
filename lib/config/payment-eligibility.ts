/**
 * Payment routing by property, per Chris's decision (2026-07-20):
 *
 * - Properties in CIELO_ELIGIBLE_CODES → full checkout: Cielo card + every
 *   other payment method (Pix automático via Cielo, Google Pay).
 * - Every other property → Pix only, and NOT the automatic Cielo Pix (no
 *   public QR code generated). Instead, static Pix details Chris provides
 *   are shown to the guest to pay manually, and the reservation is left as
 *   `pre_reserved` (a real Stays hold, not yet paid) — no payment API is
 *   called for this path. Someone on the Bomgo side confirms the transfer
 *   by hand and advances the reservation once payment is verified.
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

// TODO: Chris ainda vai passar os dados reais do Pix manual (chave, nome do
// titular, banco). Até lá isso fica vazio e a tela de Pix manual mostra um
// aviso "em configuração" em vez de dados falsos.
export const manualPixDetails = {
  key: "",
  keyType: "", // ex: "CPF", "e-mail", "telefone", "aleatória"
  holderName: "",
  bankName: "",
}

export function isManualPixConfigured(): boolean {
  return Boolean(manualPixDetails.key && manualPixDetails.holderName)
}
