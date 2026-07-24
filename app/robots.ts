import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Além das rotas internas, ficam de fora as transacionais (nada a ranquear,
      // e indexá-las expõe fluxo de reserva no resultado de busca) e /ir/, que é
      // só o redirecionador de link de parceiro — não é conteúdo do site.
      disallow: [
        "/api/",
        "/conta/",
        "/checkout/",
        "/pagar/",
        "/ir/",
        "/minha-reserva",
        "/entrar-reserva",
        "/alteracao",
        "/favoritos",
        "/guia-preview",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
