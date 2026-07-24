import { CHRISTIANO } from "@/lib/content/authors"
import type { ContentDoc } from "@/lib/content/types"

// Guia do Beach Park — primeiro conteúdo do portal.
//
// Está em `pending-validation` de propósito: a estrutura editorial está pronta,
// mas o que se afirma sobre resort de terceiro precisa vir do Christiano ou de
// fonte oficial. Onde falta dado, o texto traz [PENDENTE: ...] em vez de uma
// frase plausível — plausível é exatamente o que engana o leitor e envelhece mal.
//
// O que já é factual aqui vem de operação própria na região desde 2010, não de
// pesquisa: é esse o ativo que a OTA não copia.

export const beachParkGuide: ContentDoc = {
  slug: "beach-park",
  path: "/guias/beach-park",
  category: "guia",
  destination: "beach-park",
  title: "Guia completo do Beach Park: onde ficar, como chegar e dicas",
  heading: "Beach Park: guia completo para planejar sua viagem",
  subtitle:
    "Onde ficar, como chegar, quantos dias reservar e como escolher a hospedagem certa para o seu perfil de viagem.",
  description:
    "Guia do Beach Park escrito por quem administra hospedagem em Porto das Dunas desde 2010: onde ficar, como chegar, quantos dias ficar e como escolher entre resort e apartamento.",
  author: CHRISTIANO,
  publishedAt: "2026-07-24",
  updatedAt: "2026-07-24",
  readingMinutes: 9,
  tags: ["beach park", "porto das dunas", "aquiraz", "onde ficar", "ceará"],
  status: "pending-validation",
  hasAffiliateLinks: true,
  related: ["porto-das-dunas", "wellness-ou-acqua"],
  blocks: [
    {
      type: "prose",
      paragraphs: [
        "O Beach Park fica em Porto das Dunas, no município de Aquiraz, a cerca de 30 km do centro de Fortaleza. É o maior parque aquático da América Latina e, no entorno dele, formou-se um dos polos de hospedagem mais procurados do Ceará.",
        "A dúvida de quase todo mundo que planeja essa viagem é a mesma: ficar dentro do complexo, num dos resorts, ou num apartamento na mesma praia? Este guia responde isso a partir de quem administra hospedagem na região desde 2010.",
      ],
    },
    {
      type: "expert-note",
      body:
        "A escolha entre resort e apartamento quase nunca é sobre preço — é sobre o tipo de viagem. Família com criança pequena e poucos dias costuma render mais dentro do complexo. Grupo maior, estadia mais longa ou quem quer cozinhar tende a se dar melhor num apartamento pé na areia, com o parque a poucos minutos.",
      by: "Christiano Cavalcante, Bomgo Brasil",
    },
    {
      type: "prose",
      heading: "Onde fica e como chegar",
      paragraphs: [
        "[PENDENTE: tempo médio e opções de trajeto do Aeroporto de Fortaleza até Porto das Dunas, e do centro de Fortaleza — confirmar com o Christiano, que faz esse trajeto com hóspedes.]",
      ],
    },
    {
      type: "prose",
      heading: "Quantos dias ficar",
      paragraphs: [
        "[PENDENTE: recomendação de número de diárias por perfil de viagem, com base no que a operação observa.]",
      ],
    },
    {
      type: "prose",
      heading: "Melhor época para viajar",
      paragraphs: [
        "[PENDENTE: alta, média e baixa temporada conforme a operação da Bomgo; quando a região lota.]",
      ],
    },
    {
      type: "hotel-card",
      heading: "Resorts do complexo Beach Park",
      hotels: [
        {
          affiliateKey: "beach-park-wellness",
          name: "Wellness Beach Park Resort",
          summary: "[PENDENTE: descrição do perfil do resort e para quem ele funciona melhor.]",
          highlights: [],
        },
        {
          affiliateKey: "beach-park-oceani",
          name: "Oceani Beach Park Resort",
          summary: "[PENDENTE: descrição do perfil do resort.]",
          highlights: [],
        },
        {
          affiliateKey: "beach-park-acqua",
          name: "Acqua Beach Park Resort",
          summary: "[PENDENTE: descrição do perfil do resort.]",
          highlights: [],
        },
      ],
    },
    {
      type: "accommodation-card",
      heading: "Apartamentos em Porto das Dunas",
      listingCodes: [],
    },
    {
      type: "pros-and-cons",
      heading: "Resort ou apartamento?",
      subject: "Ficar dentro do complexo",
      pros: ["[PENDENTE: vantagens observadas na prática.]"],
      cons: ["[PENDENTE: pontos de atenção observados na prática.]"],
    },
    {
      type: "faq",
      heading: "Perguntas frequentes",
      items: [
        {
          question: "Preciso ficar num resort do Beach Park para ir ao parque?",
          answer:
            "[PENDENTE: resposta objetiva sobre acesso ao parque para quem se hospeda fora do complexo.]",
        },
        {
          question: "Vale a pena ir com criança pequena?",
          answer: "[PENDENTE: orientação por faixa etária, com base na experiência de hospedar.]",
        },
      ],
    },
    {
      type: "cta",
      variant: "sofia",
      heading: "Ainda em dúvida sobre onde ficar?",
      body: "A Sofia compara localização, estrutura e perfil de viagem com você, sem compromisso.",
      label: "Pedir ajuda à Sofia",
    },
  ],
  sources: [],
}
