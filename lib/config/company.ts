// Dados oficiais da empresa, num lugar só.
//
// Aparecem em página legal, rodapé, prova de confiança e no JSON-LD de
// Organization. Espalhar CNPJ por componente é como espalhar link de afiliado:
// no dia da correção, alguma cópia fica para trás — e aqui o erro é cadastral.

export const COMPANY = {
  legalName: "Bomgo Brasil Ltda",
  tradeName: "Bomgo Brasil",
  cnpj: "50.808.411/0001-86",
  /** Só dígitos, para JSON-LD e integrações. */
  cnpjDigits: "50808411000186",
  state: "CE",
  country: "BR",
} as const

/**
 * Condomínios onde a Bomgo opera.
 *
 * `own` distingue o que é administração própria (reserva direta, pós-venda
 * Bomgo) do que é imóvel de parceiro — nesses, a venda é permitida, mas o
 * atendimento da estadia é do responsável pelo imóvel. A distinção não é
 * cosmética: define quem responde ao hóspede depois do check-in, e o site
 * precisa refletir isso para não prometer suporte que não é nosso.
 */
export interface CondoProfile {
  slug: string
  name: string
  region: "porto-das-dunas" | "fortaleza"
  own: boolean
  /**
   * Programa de Parceiros Preferenciais da Booking.
   *
   * É um status DA PROPRIEDADE dentro da Booking, concedido por desempenho — e
   * revogável. Não é atributo da Bomgo e não se aplica ao portal como um todo:
   * exibir onde não está ativo contraria as regras do programa. Por isso fica
   * por propriedade, com a data em que foi conferido no painel, e o selo só
   * renderiza quando a conferência não está vencida.
   */
  preferredPartner?: { active: boolean; verifiedAt: string }
}

/** Informado pelo Christiano em 24/07/2026, a conferir no painel da Booking. */
const CONFERIDO_EM = "2026-07-24"

export const CONDOS: CondoProfile[] = [
  {
    slug: "terramaris",
    name: "Terra Maris",
    region: "porto-das-dunas",
    own: true,
    preferredPartner: { active: true, verifiedAt: CONFERIDO_EM },
  },
  {
    slug: "portamaris",
    name: "PortaMaris",
    region: "porto-das-dunas",
    own: true,
    preferredPartner: { active: true, verifiedAt: CONFERIDO_EM },
  },
  {
    slug: "landscape",
    name: "Landscape",
    region: "fortaleza",
    own: true,
    preferredPartner: { active: true, verifiedAt: CONFERIDO_EM },
  },
  {
    slug: "terracos-do-atlantico",
    name: "Terraços do Atlântico",
    region: "fortaleza",
    own: true,
    preferredPartner: { active: true, verifiedAt: CONFERIDO_EM },
  },
  {
    slug: "beach-living",
    name: "Beach Living",
    region: "porto-das-dunas",
    own: false,
    preferredPartner: { active: true, verifiedAt: CONFERIDO_EM },
  },
  {
    slug: "gransol",
    name: "Gran Sol",
    region: "porto-das-dunas",
    own: false,
    preferredPartner: { active: true, verifiedAt: CONFERIDO_EM },
  },
  {
    slug: "vg-fun",
    name: "VG Fun",
    region: "fortaleza",
    own: false,
    preferredPartner: { active: true, verifiedAt: CONFERIDO_EM },
  },
]

/**
 * Por quantos dias uma conferência de Preferred Partner vale.
 *
 * Passado esse prazo o selo some sozinho, e é isso que se quer: status
 * revogável exibido para sempre com base numa conferência de dois anos atrás é
 * como preço desatualizado — vira problema sem ninguém notar. Some em silêncio,
 * nunca vira afirmação falsa.
 */
export const PREFERRED_PARTNER_TTL_DAYS = 180

export function showsPreferredPartner(condo: CondoProfile, now: Date = new Date()): boolean {
  const pp = condo.preferredPartner
  if (!pp?.active) return false
  const checked = new Date(`${pp.verifiedAt}T12:00:00`)
  if (Number.isNaN(checked.getTime())) return false
  const days = (now.getTime() - checked.getTime()) / 86_400_000
  return days <= PREFERRED_PARTNER_TTL_DAYS
}

export function condoBySlug(slug: string): CondoProfile | undefined {
  return CONDOS.find((c) => c.slug === slug)
}
