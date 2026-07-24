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
}

export const CONDOS: CondoProfile[] = [
  { slug: "terramaris", name: "Terra Maris", region: "porto-das-dunas", own: true },
  { slug: "portamaris", name: "PortaMaris", region: "porto-das-dunas", own: true },
  { slug: "landscape", name: "Landscape", region: "fortaleza", own: true },
  {
    slug: "terracos-do-atlantico",
    name: "Terraços do Atlântico",
    region: "fortaleza",
    own: true,
  },
  { slug: "beach-living", name: "Beach Living", region: "porto-das-dunas", own: false },
  { slug: "gransol", name: "Gran Sol", region: "porto-das-dunas", own: false },
  { slug: "vg-fun", name: "VG Fun", region: "fortaleza", own: false },
]

export function condoBySlug(slug: string): CondoProfile | undefined {
  return CONDOS.find((c) => c.slug === slug)
}
