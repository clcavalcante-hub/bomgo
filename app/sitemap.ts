import type { MetadataRoute } from "next"
import { getFeaturedProperties } from "@/lib/data/live-properties"
import { SITE_URL } from "@/lib/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/busca`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/clube`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/favoritos`, changeFrequency: "monthly", priority: 0.3 },
  ]

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
    return [...staticPages, ...propertyPages]
  } catch {
    return staticPages
  }
}
