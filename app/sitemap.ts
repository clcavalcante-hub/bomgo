import type { MetadataRoute } from "next"
import { getFeaturedProperties } from "@/lib/data/live-properties"
import { contentSitemapEntries } from "@/lib/content/registry"
import { SITE_URL } from "@/lib/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/busca`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/clube`, changeFrequency: "weekly", priority: 0.6 },
    // Páginas de confiança entram porque sustentam a autoridade do portal —
    // quem avalia se pode confiar numa recomendação procura justamente por elas.
    // `/favoritos` saiu: é área do usuário, sem nada a ranquear.
    { url: `${base}/divulgacao-de-afiliados`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/termos-de-uso`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
  ]

  // Conteúdo editorial — só o que está PUBLICADO. Guia em validação não entra
  // aqui nem no site: submeter rascunho ao Google é pedir para ser avaliado
  // pelo pior material que temos.
  const contentPages: MetadataRoute.Sitemap = contentSitemapEntries().map((c) => ({
    url: `${base}${c.path}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly",
    priority: 0.85,
  }))

  try {
    // Real, indexable property pages — up to 100. Falls back to just the
    // static pages above if Stays is unreachable, so a live-data hiccup
    // never breaks the whole sitemap.
    const properties = await getFeaturedProperties(100)
    const propertyPages: MetadataRoute.Sitemap = properties.map((p) => ({
      url: `${base}/imovel/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }))
    return [...staticPages, ...contentPages, ...propertyPages]
  } catch {
    return [...staticPages, ...contentPages]
  }
}
