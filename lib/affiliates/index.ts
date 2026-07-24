// Camada central dos links de parceiro (Booking.com via CJ Affiliate).
//
// Regra da casa: nenhuma URL de afiliado é escrita dentro de um componente ou de
// um guia. O conteúdo referencia uma CHAVE; o destino real mora aqui. Trocar um
// link, corrigir um slug ou aposentar um hotel é editar uma linha deste arquivo,
// não caçar ocorrências em vinte artigos.
//
// Duas coisas que a investigação da API deixou claras e que moldam este desenho:
//
// 1. A Booking NÃO expõe catálogo, preço nem disponibilidade pela CJ — só o link
//    rastreado. Por isso não existe campo de preço aqui: preço é assunto da
//    Booking, e é para lá que o CTA manda. Fingir preço no nosso lado seria dado
//    inventado, além de envelhecer mal.
// 2. O rastreio só sobrevive se o clique passar pelo redirecionador /ir/[slug],
//    que remonta o deep link da CJ com o PID da conta. Link direto para a
//    booking.com escrito à mão perde a comissão silenciosamente.

/** Onde o link aterrissa na Booking. */
export type AffiliateTargetKind = "hotel" | "city"

export interface AffiliateTarget {
  /** Chave usada no conteúdo. Estável — não renomear depois de publicada. */
  key: string
  /** Nome como aparece ao viajante. */
  name: string
  kind: AffiliateTargetKind
  /**
   * Slug da Booking. Para `hotel`, o da página do imóvel
   * (booking.com/hotel/br/<slug>); para `city`, o da cidade
   * (booking.com/city/br/<slug>).
   */
  bookingSlug: string
  /** Território ao qual pertence — usado para listar por destino. */
  destination: string
  /** Programa Preferencial: só `true` com status ATIVO conferido no painel. */
  preferredPartner?: boolean
  /** Data da última conferência de que o slug ainda resolve. */
  verifiedAt: string
  active: boolean
}

/**
 * Registro de destinos afiliados.
 *
 * Os slugs de hotel abaixo foram verificados um a um: cada um foi seguido pelo
 * redirecionador e aterrissou na página correta do imóvel na Booking. Ao
 * acrescentar um novo, faça o mesmo antes de marcar `active: true` — a Booking
 * responde 200 mesmo para slug inexistente, então status HTTP não prova nada.
 */
export const AFFILIATE_TARGETS: AffiliateTarget[] = [
  // ── Terra Maris e vizinhança (Porto das Dunas / Aquiraz) ──
  {
    key: "terramaris-duplex-luxo",
    name: "Terra Maris — Duplex Luxo Frente-Mar",
    kind: "hotel",
    bookingSlug: "terramaris-duplex-luxo-frente-mar",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "terramaris-terreo-vista-mar",
    name: "Terra Maris — Térreo Vista-Mar, Pé na Areia",
    kind: "hotel",
    bookingSlug: "terramaris-vista-mar-terreo-pe-na-areia",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "terramaris-pe-na-areia",
    name: "Terra Maris — Apartamento Pé na Areia",
    kind: "hotel",
    bookingSlug: "terramaris-apartamento-pe-na-areia",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "terramaris-vista-mar",
    name: "Terra Maris — Vista para o Mar",
    kind: "hotel",
    bookingSlug: "terramaris-vista-para-o-mar",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "terramaris-beira-mar",
    name: "Terra Maris — Beira-Mar, Pé na Areia",
    kind: "hotel",
    bookingSlug: "terramaris-apartamento-beira-mar-pe-na-areia",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "terramaris-apartamento",
    name: "Terra Maris — Apartamento",
    kind: "hotel",
    bookingSlug: "terramaris",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "paraiso-beach",
    name: "Paraíso Beach — Porto das Dunas",
    kind: "hotel",
    bookingSlug: "paraiso-beach-aquiraz",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "apartamento-porto-das-dunas",
    name: "Apartamento Porto das Dunas",
    kind: "hotel",
    bookingSlug: "apartamento-porto-das-dunas-aquiraz19",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },

  // ── Resorts do Beach Park ──
  {
    key: "beach-park-wellness",
    name: "Wellness Beach Park Resort",
    kind: "hotel",
    bookingSlug: "beach-park-wellness-resort",
    destination: "beach-park",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "beach-park-oceani",
    name: "Oceani Beach Park Resort",
    kind: "hotel",
    bookingSlug: "oceani-resort-porto-das-dunas",
    destination: "beach-park",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "beach-park-acqua",
    name: "Acqua Beach Park Resort",
    kind: "hotel",
    bookingSlug: "beach-park-acqua-resort",
    destination: "beach-park",
    verifiedAt: "2026-07-24",
    active: true,
  },

  // ── Buscas por região ──
  {
    key: "cidade-aquiraz",
    name: "Todas as opções em Aquiraz / Porto das Dunas",
    kind: "city",
    bookingSlug: "aquiraz",
    destination: "porto-das-dunas",
    verifiedAt: "2026-07-24",
    active: true,
  },
  {
    key: "cidade-fortaleza",
    name: "Todas as opções em Fortaleza",
    kind: "city",
    bookingSlug: "fortaleza",
    destination: "fortaleza",
    verifiedAt: "2026-07-24",
    active: true,
  },
]

const BY_KEY = new Map(AFFILIATE_TARGETS.map((t) => [t.key, t]))

export function affiliateTarget(key: string): AffiliateTarget | undefined {
  return BY_KEY.get(key)
}

export function affiliateTargetsFor(destination: string): AffiliateTarget[] {
  return AFFILIATE_TARGETS.filter((t) => t.active && t.destination === destination)
}

/** Datas e hóspedes que o viajante já escolheu, repassados ao parceiro. */
export interface AffiliateStayParams {
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
}

/**
 * URL para o viajante clicar. Sempre relativa e sempre via /ir/ — é o
 * redirecionador que remonta o deep link rastreado da CJ. Devolve `null` para
 * chave desconhecida ou inativa, e quem chama decide (esconder o card em vez de
 * publicar um link quebrado).
 */
export function affiliateHref(key: string, stay: AffiliateStayParams = {}): string | null {
  const target = affiliateTarget(key)
  if (!target || !target.active) return null

  const params = new URLSearchParams()
  params.set("t", target.kind === "city" ? "c" : "h")
  if (target.kind === "hotel") {
    if (stay.checkIn) params.set("ci", stay.checkIn)
    if (stay.checkOut) params.set("co", stay.checkOut)
    if (stay.adults) params.set("a", String(stay.adults))
    if (stay.children) params.set("ch", String(stay.children))
  }
  return `/ir/${target.bookingSlug}?${params.toString()}`
}

/**
 * Atributos obrigatórios de todo link de parceiro.
 *
 * `sponsored` declara a relação comercial (exigência do Google e das regras do
 * programa); `noopener` fecha o buraco de segurança do `target="_blank"`.
 */
export const AFFILIATE_LINK_ATTRS = {
  rel: "sponsored nofollow noopener",
  target: "_blank",
} as const

/** Texto único do aviso de comissão. Um lugar só para revisar. */
export const AFFILIATE_DISCLOSURE =
  "A Bomgo Brasil participa do Programa de Parceiros Afiliados da Booking.com. " +
  "Podemos receber uma comissão pelas reservas qualificadas realizadas através dos " +
  "nossos links, sem custo adicional para o viajante."

/** Como a parceria é nomeada no site. Nunca sugerir vínculo societário. */
export const BOOKING_PARTNER_LABEL = "Parceiro Booking.com"
