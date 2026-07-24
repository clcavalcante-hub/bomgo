import { COMPANY } from "@/lib/config/company"
import { OPERATING_SINCE } from "@/lib/content/authors"
import { SITE_URL } from "@/lib/site-url"

/**
 * Identidade da Bomgo para buscadores.
 *
 * O site não tinha nenhum dado estruturado. Sem isso o Google trata cada página
 * como texto solto e não sabe que existe uma empresa por trás, com CNPJ, área de
 * atuação e um site com busca própria — o que importa quando se compete com OTA
 * por consultas de marca e de destino.
 *
 * Só entram fatos verificáveis: razão social, CNPJ, ano de fundação e as
 * regiões onde a empresa realmente opera. Nada de avaliação, preço ou selo sem
 * origem — marcação inventada é motivo de penalidade manual, e o ganho de curto
 * prazo não paga o risco.
 */
export function OrganizationJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: COMPANY.tradeName,
        legalName: COMPANY.legalName,
        url: SITE_URL,
        foundingDate: String(OPERATING_SINCE),
        // taxID é o campo do schema.org para identificador fiscal — no Brasil, o CNPJ.
        taxID: COMPANY.cnpj,
        address: {
          "@type": "PostalAddress",
          addressRegion: COMPANY.state,
          addressCountry: COMPANY.country,
        },
        areaServed: [
          { "@type": "Place", name: "Porto das Dunas, Aquiraz, CE" },
          { "@type": "Place", name: "Fortaleza, CE" },
        ],
        knowsAbout: [
          "Aluguel por temporada",
          "Hospedagem em Porto das Dunas",
          "Beach Park",
          "Hospedagem na Beira-Mar de Fortaleza",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: COMPANY.tradeName,
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE_URL}/#organization` },
        // Habilita a caixa de busca do site no resultado do Google.
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/busca?destino={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
