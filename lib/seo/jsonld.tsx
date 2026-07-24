// -------------------------------------------------------------------------
// Dados estruturados (Schema.org / JSON-LD).
//
// É o que faz o Google ENTENDER que o Bomgo é hospedagem — e o que permite
// preço, nota e avaliações aparecerem nos resultados (rich results), além de
// deixar o catálogo legível para buscadores e meta-buscadores.
//
// `<JsonLd data={...} />` injeta um <script type="application/ld+json">.
// Os builders abaixo montam cada schema a partir dos dados REAIS já
// existentes — nunca inventam campo que não temos (regra de ouro do CTO).
// -------------------------------------------------------------------------

import type { Property } from "@/lib/types"
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo/seo"
import { SITE_URL } from "@/lib/site-url"

type Json = Record<string, unknown>

/** Renderiza um bloco JSON-LD. `undefined`/`null` some no JSON.stringify. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      // Conteúdo controlado por nós (sem input do usuário), seguro para injetar.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** A empresa. Aparece no Knowledge Graph e conecta marca ↔ site. */
export function organizationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: absoluteUrl("/icon-light-32x32.png"),
    image: DEFAULT_OG_IMAGE,
    areaServed: "BR",
    slogan: "Reserva inteligente com a Sofia",
  }
}

/**
 * O site + a caixa de busca (sitelinks searchbox). Diz ao Google como
 * buscar dentro do Bomgo direto pelos resultados.
 */
export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/busca?destino={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/** Trilha de navegação (breadcrumb) — aparece nos resultados do Google. */
export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

/**
 * Uma hospedagem. Emite `LodgingBusiness` com endereço, geo, comodidades,
 * faixa de preço, oferta e avaliação — o que habilita nota e preço no
 * resultado de busca. Só inclui o que temos de fato.
 */
export function lodgingSchema(property: Property, path: string): Json {
  const url = absoluteUrl(path)
  const hasRating = property.rating > 0 && property.reviewsCount > 0

  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${url}#lodging`,
    name: property.name,
    url,
    description: property.summary || property.description?.slice(0, 300) || undefined,
    image: property.images?.slice(0, 6).map((img) => absoluteUrl(img.src)),
    priceRange: property.nightlyPrice > 0 ? `A partir de R$ ${property.nightlyPrice}/noite` : undefined,
    currenciesAccepted: "BRL",
    numberOfRooms: property.bedrooms || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.fullAddress || undefined,
      addressLocality: property.location || property.neighborhood || undefined,
      addressCountry: "BR",
    },
    geo:
      property.latitude != null && property.longitude != null
        ? {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          }
        : undefined,
    amenityFeature: property.amenities?.slice(0, 20).map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a.label,
      value: true,
    })),
    aggregateRating: hasRating
      ? {
          "@type": "AggregateRating",
          ratingValue: property.rating.toFixed(1),
          reviewCount: property.reviewsCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    makesOffer:
      property.nightlyPrice > 0
        ? {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: property.nightlyPrice,
            availability: "https://schema.org/InStock",
            url,
            category: "Aluguel por temporada",
          }
        : undefined,
  }
}

/**
 * Página de destino: coleção de hospedagens de uma cidade/bairro. Ajuda o
 * Google a entender a página como um índice de temporada daquela localidade.
 */
export function itemListSchema(
  properties: Property[],
  basePath: (p: Property) => string,
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: properties.length,
    itemListElement: properties.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(basePath(p)),
      name: p.name,
    })),
  }
}

/** Perguntas frequentes — pode render um bloco expansível direto no Google. */
export function faqSchema(items: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}
