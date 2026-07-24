import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Fora do índice: APIs e páginas pessoais/transacionais que não têm
      // valor de busca e poluiriam o índice (conta, pagamento, login, etc.).
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
