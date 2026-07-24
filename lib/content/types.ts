// Modelo de conteúdo do portal de viagens.
//
// Isto não é o schema de "dez guias sobre o Beach Park" — é o de uma plataforma
// de publicação contínua. O catálogo de blocos abaixo já contempla artigo,
// comparativo, vídeo, FAQ, galeria, mapa e roteiro, porque retrofitar um tipo
// de bloco depois obriga a revisitar todo conteúdo já publicado.
//
// Por que dado tipado em vez de Markdown: o corpo destas páginas é
// majoritariamente estruturado (tabela comparativa, card de hotel, prós e
// contras). Em Markdown isso vira HTML solto que nenhuma ferramenta valida; aqui
// o compilador recusa um guia sem `updatedAt` ou um card de hotel sem link
// afiliado. Prosa longa continua possível pelo bloco `prose`.

/** Status editorial. Só `published` aparece no site e no sitemap. */
export type ContentStatus = "draft" | "pending-validation" | "published"

/** Territórios. Novos destinos entram aqui, não em condicional espalhada. */
export type DestinationSlug =
  | "beach-park"
  | "porto-das-dunas"
  | "fortaleza"
  | "ceara"

export type ContentCategory =
  | "guia"
  | "comparativo"
  | "onde-ficar"
  | "destino"
  | "roteiro"

/** Quem assina e quem revisou — exigência de E-E-A-T do Google e de honestidade. */
export interface Byline {
  name: string
  role: string
  /** Por que esta pessoa pode falar do assunto. Aparece no AuthorBox. */
  credential?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Blocos
// ─────────────────────────────────────────────────────────────────────────────

/** Parágrafos corridos. Cada item é um parágrafo; sem HTML cru. */
export interface ProseBlock {
  type: "prose"
  /** Título opcional da seção — vira <h2> e entra no sumário. */
  heading?: string
  paragraphs: string[]
}

export interface ImageBlock {
  type: "image"
  src: string
  /** Obrigatório: sem alt a imagem não existe para leitor de tela nem para o Google. */
  alt: string
  caption?: string
  credit?: string
}

export interface GalleryBlock {
  type: "gallery"
  heading?: string
  images: { src: string; alt: string; caption?: string }[]
}

/** Vídeo incorporado (YouTube/Vimeo). `title` é o nome acessível do iframe. */
export interface VideoBlock {
  type: "video"
  provider: "youtube" | "vimeo"
  id: string
  title: string
  caption?: string
}

export interface MapBlock {
  type: "map"
  heading?: string
  latitude: number
  longitude: number
  zoom?: number
  /** Rótulo do ponto — ex.: "Beach Park, Porto das Dunas". */
  label: string
}

/**
 * Esquema de posição desenhado pela Bomgo.
 *
 * Diferente do `map`, que é o mapa real do Google: aqui o objetivo não é
 * localizar no globo, é explicar quem está perto de quê. Responde "onde ficar?"
 * melhor que coordenada, e é ilustração própria — sem depender de material de
 * terceiro que não podemos republicar.
 */
export interface RegionSchemaBlock {
  type: "region-schema"
  heading?: string
  region: "porto-das-dunas"
}

/** Nota de quem conhece a região. É o diferencial editorial contra a OTA. */
export interface ExpertNoteBlock {
  type: "expert-note"
  heading?: string
  body: string
  /** Assinatura da nota; herda o autor do guia se ausente. */
  by?: string
}

/**
 * Tabela comparativa. `rows[].values` acompanha `columns` na ordem — o
 * componente valida o tamanho em desenvolvimento para não desalinhar silenciosamente.
 */
export interface ComparisonTableBlock {
  type: "comparison-table"
  heading?: string
  columns: string[]
  rows: { label: string; values: string[] }[]
  /** De onde vieram os dados. Comparativo sem fonte não se publica. */
  sourceNote?: string
}

export interface ProsAndConsBlock {
  type: "pros-and-cons"
  heading?: string
  subject: string
  pros: string[]
  cons: string[]
}

/**
 * Hospedagem de terceiro. Nunca carrega preço nem disponibilidade: a Booking não
 * expõe isso por API, e inventar seria enganar. O preço vive lá, atrás do CTA.
 */
export interface HotelCardBlock {
  type: "hotel-card"
  heading?: string
  hotels: {
    /** Chave em lib/affiliates — a URL nunca é escrita aqui. */
    affiliateKey: string
    name: string
    summary: string
    image?: string
    /** Fatos verificáveis: "800 m do parque", "café da manhã incluso". */
    highlights: string[]
    /** Só onde o status estiver ativo no painel da Booking. */
    preferredPartner?: boolean
  }[]
}

/** Imóvel próprio: reserva direta, sem intermediário. */
export interface AccommodationCardBlock {
  type: "accommodation-card"
  heading?: string
  /** Códigos do catálogo Stays; os dados vêm ao vivo, não são copiados aqui. */
  listingCodes: string[]
}

export interface FaqBlock {
  type: "faq"
  heading?: string
  items: { question: string; answer: string }[]
}

/** Pergunta real respondida pela Sofia. Alimenta o FAQPage e prova o serviço. */
export interface SofiaAnswerBlock {
  type: "sofia-answer"
  question: string
  answer: string
}

/** Roteiro dia a dia. */
export interface ItineraryBlock {
  type: "itinerary"
  heading?: string
  days: { day: string; title: string; items: string[] }[]
}

export interface CtaBlock {
  type: "cta"
  /** `sofia` abre o atendimento; `booking` vai ao parceiro; `direct` à reserva própria. */
  variant: "sofia" | "booking" | "direct"
  heading: string
  body?: string
  label: string
  /** Para `booking`: chave em lib/affiliates. Para `direct`: rota interna. */
  target?: string
}

export type ContentBlock =
  | ProseBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | MapBlock
  | RegionSchemaBlock
  | ExpertNoteBlock
  | ComparisonTableBlock
  | ProsAndConsBlock
  | HotelCardBlock
  | AccommodationCardBlock
  | FaqBlock
  | SofiaAnswerBlock
  | ItineraryBlock
  | CtaBlock

// ─────────────────────────────────────────────────────────────────────────────
// Documento
// ─────────────────────────────────────────────────────────────────────────────

export interface ContentDoc {
  slug: string
  /** Rota completa, ex.: "/guias/beach-park". Fonte única para link e sitemap. */
  path: string
  category: ContentCategory
  destination: DestinationSlug
  title: string
  /** <h1>. Costuma diferir do title de SEO, que carrega a marca. */
  heading: string
  subtitle?: string
  /** Meta description. 120–160 caracteres, frase inteira. */
  description: string
  cover?: { src: string; alt: string }
  author: Byline
  reviewer?: Byline
  publishedAt: string
  updatedAt: string
  /** Minutos. Calculado na publicação, não estimado no olho. */
  readingMinutes: number
  tags: string[]
  status: ContentStatus
  blocks: ContentBlock[]
  /** Links internos do cluster. Slugs, resolvidos na renderização. */
  related?: string[]
  /** Fontes externas consultadas. Obrigatório quando há dado de terceiro. */
  sources?: { label: string; url?: string }[]
  /** Marca que a página envia tráfego a parceiro — liga o aviso de afiliado. */
  hasAffiliateLinks?: boolean
}

/** Só o que está publicado vai ao ar e ao sitemap. */
export function isPublished(doc: ContentDoc): boolean {
  return doc.status === "published"
}

/** Títulos das seções, para o sumário navegável. */
export function tableOfContents(doc: ContentDoc): { id: string; label: string }[] {
  return doc.blocks
    .map((b) => ("heading" in b && b.heading ? b.heading : null))
    .filter((h): h is string => Boolean(h))
    .map((label) => ({ id: slugifyHeading(label), label }))
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
