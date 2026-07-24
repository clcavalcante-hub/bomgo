import type { ContentDoc, DestinationSlug } from "./types"
import { isPublished } from "./types"
import { beachParkGuide } from "@/content/guias/beach-park"
import { wellnessOuAcqua } from "@/content/comparativos/wellness-ou-acqua"
import { beachParkDestino } from "@/content/destinos/beach-park"

// Catálogo do portal.
//
// Um array explícito, não varredura de pasta. Publicar é um ato deliberado:
// acrescentar o import aqui. Isso evita o acidente clássico do blog gerado por
// pasta — um rascunho esquecido no diretório aparece no ar sem ninguém decidir.
//
// Quando o volume justificar (dezenas de guias), isto vira leitura de diretório
// com filtro por status. Hoje seria complexidade sem ganho.

const ALL_DOCS: ContentDoc[] = [beachParkDestino, beachParkGuide, wellnessOuAcqua]

/** Só o que está publicado. É o que o site e o sitemap enxergam. */
export function publishedDocs(): ContentDoc[] {
  return ALL_DOCS.filter(isPublished)
}

/** Inclui rascunho e pendente — para o preview de homologação. */
export function allDocs(): ContentDoc[] {
  return ALL_DOCS
}

/**
 * Busca por slug.
 *
 * `includeUnpublished` existe para a homologação mostrar o que ainda está em
 * validação. Em produção jamais é ligado: conteúdo pendente não vai ao ar.
 */
export function docBySlug(slug: string, includeUnpublished = false): ContentDoc | undefined {
  const pool = includeUnpublished ? ALL_DOCS : publishedDocs()
  return pool.find((d) => d.slug === slug)
}

export function docsByDestination(destination: DestinationSlug): ContentDoc[] {
  return publishedDocs().filter((d) => d.destination === destination)
}

/**
 * Relacionados do cluster.
 *
 * Usa os slugs declarados no documento e descarta os que não existem ou não
 * estão publicados — link interno para página inexistente é 404 servido de
 * bandeja ao Google.
 */
export function relatedDocs(doc: ContentDoc): ContentDoc[] {
  if (!doc.related?.length) return []
  return doc.related
    .map((slug) => docBySlug(slug))
    .filter((d): d is ContentDoc => Boolean(d))
}

/** Rotas publicadas, para o sitemap. */
export function contentSitemapEntries(): { path: string; updatedAt: string }[] {
  return publishedDocs().map((d) => ({ path: d.path, updatedAt: d.updatedAt }))
}
