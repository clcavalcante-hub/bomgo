import type { MetadataRoute } from "next"
import { getFeaturedProperties } from "@/lib/data/live-properties"
import { DESTINATIONS } from "@/lib/data/destination-taxonomy"
import { getDestinationContent } from "@/lib/data/destination-content"
import { SITE_URL } from "@/lib/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/busca`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/clube`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/cancelamento`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/termos-de-uso`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ]

  // Páginas de destino — alta prioridade de SEO (rankeiam as palavras-chave
  // de cidade/bairro). Uma por localidade com conteúdo editorial próprio.
  const destinationPages: MetadataRoute.Sitemap = DESTINATIONS.filter((d) =>
    getDestinationContent(d.id),
  ).map((d) => ({
    url: `${base}/hospedagem/${d.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }))

  try {
    // Real, indexable property pages — up to 100. Falls back to just the
    // static pages above if Stays is unreachable, so a live-data hiccup
    // never breaks the whole sitemap.
    const properties = await getFeaturedProperties(100)
    const propertyPages: MetadataRoute.Sitemap = properties.map((p) => ({
      url: `${base}/imovel/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }))
    return [...staticPages, ...destinationPages, ...propertyPages]
  } catch {
    return [...staticPages, ...destinationPages]
  }
}
