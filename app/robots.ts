import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Fora do índice: APIs e páginas pessoais/transacionais (nada a ranquear,
      // e indexá-las exporia o fluxo de reserva no resultado de busca) e /ir/,
      // que é só o redirecionador de link de parceiro — não é conteúdo do site.
      disallow: [
        "/api/",
        "/conta/",
        "/checkout/",
        "/pagar/",
        "/login",
        "/cadastro",
        "/entrar-reserva",
        "/minha-reserva",
        "/alteracao",
        "/favoritos",
        "/guia-preview",
        "/ir/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
