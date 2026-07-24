// -------------------------------------------------------------------------
// SEO — fonte única de verdade para título, descrição, palavras-chave e
// imagem social do Bomgo. Centraliza tudo que buscadores leem, para que
// título/descrição/canônica nunca fiquem espalhados e inconsistentes.
// -------------------------------------------------------------------------

import { SITE_URL } from "@/lib/site-url"

export const SITE_NAME = "Bomgo Brasil"

// Título institucional (home e fallback). O `template` no layout transforma
// os títulos das páginas internas em "<algo> | Bomgo Brasil".
export const SITE_TITLE =
  "Aluguel por Temporada em Fortaleza e Porto das Dunas | Bomgo Brasil"

export const SITE_DESCRIPTION =
  "Apartamentos e casas por temporada em Fortaleza, Porto das Dunas (perto do Beach Park), Aquiraz, Cumbuco e Jericoacoara. Reserva direta com quem cuida do imóvel, sem taxa de plataforma."

// Imagem social padrão (Open Graph / Twitter). Absoluta, para o preview
// aparecer corretamente ao compartilhar no WhatsApp, Instagram e redes.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-resort.png`

// Palavras-chave estratégicas — destinos + intenção de busca real.
export const SITE_KEYWORDS = [
  "aluguel por temporada",
  "aluguel por temporada Fortaleza",
  "apartamento Porto das Dunas",
  "temporada Aquiraz",
  "apartamento perto do Beach Park",
  "apartamento beira-mar Fortaleza",
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
  "hotel Fortaleza",
  "casa de temporada Ceará",
  "Terra Maris",
  "PortaMaris",
  "Bomgo Brasil",
]

/** Resolve um caminho relativo em URL absoluta com o domínio atual do site. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
