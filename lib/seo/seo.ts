// -------------------------------------------------------------------------
// SEO — fonte única de verdade para título, descrição, palavras-chave e
// imagem social do Bomgo. Centraliza tudo que buscadores leem, para que
// título/descrição/canônica nunca fiquem espalhados e inconsistentes.
// -------------------------------------------------------------------------

import { SITE_URL } from "@/lib/site-url"

export const SITE_NAME = "Bomgo"

// Título institucional (home e fallback). O `template` no layout transforma
// os títulos das páginas internas em "<algo> | Bomgo".
export const SITE_TITLE =
  "Bomgo — Aluguel por temporada no Ceará: casas e apartamentos com reserva direta"

export const SITE_DESCRIPTION =
  "Alugue casas e apartamentos por temporada em Fortaleza, Porto das Dunas, Beach Park, Aquiraz, Cumbuco e Jericoacoara. Reserva direta com a Sofia, a concierge de IA da Bomgo — melhores preços, Pix e cartão, sem burocracia."

// Imagem social padrão (Open Graph / Twitter). Absoluta, para o preview
// aparecer corretamente ao compartilhar no WhatsApp, Instagram e redes.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-resort.png`

// Palavras-chave estratégicas — destinos + intenção de busca real.
export const SITE_KEYWORDS = [
  "aluguel por temporada",
  "casa de férias",
  "apartamento por temporada",
  "hospedagem",
  "reserva direta",
  "Fortaleza",
  "Porto das Dunas",
  "Beach Park",
  "Aquiraz",
  "Cumbuco",
  "Jericoacoara",
  "Meireles",
  "Beira-Mar Fortaleza",
  "hotel Fortaleza",
  "casa de temporada Ceará",
  "Bomgo",
  "Sofia concierge",
]

/** Resolve um caminho relativo em URL absoluta com o domínio atual do site. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
