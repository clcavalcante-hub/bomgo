// Eventos de conversão do portal.
//
// O site não tinha GA4, GTM nem dataLayer — só o Analytics da Vercel, que conta
// visita mas não conta conversão. Esta camada existe para que "clicou no link do
// parceiro" e "pediu ajuda à Sofia" sejam fatos medidos, não impressões.
//
// Duas regras que valem mais que qualquer painel bonito:
//
// 1. Nome de evento é contrato. Uma vez no ar, renomear quebra o histórico e todo
//    relatório que dependia dele. Por isso ficam aqui, num só lugar, em
//    snake_case (convenção do GA4), e não como string solta no componente.
// 2. Nada de dado pessoal. Nome, e-mail, telefone, CPF e código de reserva NÃO
//    entram em evento — além de violar a política do GA e a LGPD, envenena o
//    relatório com cardinalidade inútil. Medimos comportamento, não pessoas.

export const ANALYTICS_EVENTS = {
  searchStarted: "search_started",
  searchCompleted: "search_completed",
  destinationViewed: "destination_viewed",
  guideViewed: "guide_viewed",
  guideRead50: "guide_read_50",
  guideRead90: "guide_read_90",
  comparisonOpened: "comparison_opened",
  accommodationClicked: "accommodation_clicked",
  affiliateClick: "affiliate_click",
  bookingCtaClicked: "booking_cta_clicked",
  sofiaStarted: "sofia_started",
  sofiaCtaClicked: "sofia_cta_clicked",
  whatsappClicked: "whatsapp_clicked",
  leadSubmitted: "lead_submitted",
  offersSubscribed: "offers_subscribed",
} as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

/**
 * Parâmetros aceitos. Deliberadamente estreito: tudo aqui é categoria, não
 * identidade. Se um dia bater a vontade de mandar o e-mail do lead, a resposta
 * é não — mande o `destination` e cruze no seu banco.
 */
export interface AnalyticsPayload {
  /** Território: "beach-park", "porto-das-dunas". */
  destination?: string
  /** Chave do parceiro (lib/affiliates), nunca a URL montada. */
  affiliate_key?: string
  /** Onde o clique nasceu: "hero", "hotel-card", "guide-cta". */
  placement?: string
  /** Rota de origem, sem query string (query pode carregar dado pessoal). */
  source_path?: string
  /** Slug do conteúdo. */
  content_slug?: string
  content_category?: string
  /** Reserva direta Bomgo ou plataforma parceira — a distinção comercial. */
  offer_type?: "direta" | "parceiro"
  value?: number
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Registra um evento. Silencioso quando não há GTM/GA carregado (bloqueador de
 * anúncio, ambiente de desenvolvimento) — medição nunca pode derrubar a página
 * nem travar uma navegação que o viajante pediu.
 */
export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...payload })
  } catch {
    // Medição é acessória: se falhar, a jornada do usuário segue.
  }
}

/**
 * Clique em parceiro. Chamado ANTES da navegação; por isso o `dataLayer.push`
 * é síncrono e não espera resposta — se a aba abrir antes do envio, perdemos o
 * evento, mas nunca a reserva.
 */
export function trackAffiliateClick(params: {
  affiliateKey: string
  placement: string
  destination?: string
  sourcePath?: string
}): void {
  track(ANALYTICS_EVENTS.affiliateClick, {
    affiliate_key: params.affiliateKey,
    placement: params.placement,
    destination: params.destination,
    source_path: params.sourcePath,
    offer_type: "parceiro",
  })
}

/** UTMs padronizadas — evita "instagram", "Instagram" e "ig" virarem três canais. */
export const UTM_SOURCES = {
  instagram: "instagram",
  facebook: "facebook",
  google: "google",
  whatsapp: "whatsapp",
  email: "email",
  organic: "organic",
} as const

export const UTM_MEDIUMS = {
  reels: "reels",
  stories: "stories",
  post: "post",
  bio: "bio",
  cpc: "cpc",
  broadcast: "broadcast",
  newsletter: "newsletter",
} as const

/** Monta uma URL de campanha. Use sempre isto ao divulgar um link. */
export function campaignUrl(
  path: string,
  utm: { source: string; medium: string; campaign: string; content?: string },
): string {
  const params = new URLSearchParams({
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: utm.campaign,
  })
  if (utm.content) params.set("utm_content", utm.content)
  return `${path}${path.includes("?") ? "&" : "?"}${params.toString()}`
}
