import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/conta/", "/checkout/"],
    },
    sitemap: "https://bomgo.vercel.app/sitemap.xml",
  }
}
