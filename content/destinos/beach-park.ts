import { CHRISTIANO, yearsOperating } from "@/lib/content/authors"
import type { ContentDoc } from "@/lib/content/types"

// Página pilar do cluster Beach Park.
//
// O papel dela não é esgotar o assunto — é orientar e distribuir. Quem chega
// aqui digitou "Beach Park" e ainda não sabe o que quer perguntar; as páginas de
// apoio (guia, comparativo) atendem intenções já formadas.
//
// Por isso o texto é de visão geral e cada bloco entrega o leitor a um destino
// mais específico. Repetir aqui o conteúdo do guia canibalizaria as duas: o
// Google escolheria uma e a outra viraria peso morto — que foi exatamente o
// risco que consolidou a árvore de rotas deste projeto.

export const beachParkDestino: ContentDoc = {
  slug: "destino-beach-park",
  path: "/destinos/beach-park",
  category: "destino",
  destination: "beach-park",
  title: "Beach Park e Porto das Dunas: onde ficar e como planejar",
  heading: "Beach Park: tudo para planejar a sua viagem",
  subtitle:
    "O maior parque aquático da América Latina fica em Porto das Dunas, Aquiraz. Aqui você entende a região, escolhe onde ficar e decide com quem já opera aqui.",
  description:
    "Guia da Bomgo sobre o Beach Park e Porto das Dunas: onde ficar, quanto tempo do aeroporto, quando a região lota e como escolher entre resort e apartamento.",
  cover: {
    src: "/images/guias/wellness-varanda-brinquedos.jpg",
    alt: "Vista de uma varanda no complexo do Beach Park, com os tobogãs do Aqua Park entre a vegetação.",
  },
  author: CHRISTIANO,
  publishedAt: "2026-07-24",
  updatedAt: "2026-07-24",
  readingMinutes: 5,
  tags: ["beach park", "porto das dunas", "aquiraz", "ceará", "destino"],
  status: "pending-validation",
  hasAffiliateLinks: true,
  related: ["beach-park", "wellness-ou-acqua"],
  blocks: [
    {
      type: "prose",
      paragraphs: [
        `O Beach Park fica em Porto das Dunas, no município de Aquiraz, a cerca de 25 km do Aeroporto Internacional de Fortaleza. A Bomgo administra hospedagem nessa região há ${yearsOperating()} anos — e é dessa convivência, não de pesquisa, que sai o que você lê aqui.`,
        "Esta página é o ponto de partida. A partir dela você vai direto para a dúvida que te trouxe: quantos dias ficar, qual resort combina com a sua família, ou se um apartamento resolve melhor.",
      ],
    },
    {
      type: "region-schema",
      heading: "Como a região se organiza",
      region: "porto-das-dunas",
    },
    {
      type: "prose",
      heading: "O essencial em cinco pontos",
      paragraphs: [
        "Onde fica: Porto das Dunas, em Aquiraz, na região metropolitana de Fortaleza — não no centro da capital. Você chega rápido ao parque, mas conte deslocamento para passear pela Beira-Mar.",
        "Quanto tempo: de 30 a 40 minutos do aeroporto em condições normais. Em pico, chuva ou feriado, pode passar de uma hora — não marque compromisso apertado logo após o desembarque.",
        "Quantos dias: três noites para uma visita rápida, quatro ou cinco para uma viagem confortável em família, seis ou sete para aproveitar sem pressa.",
        "Quando lota: segunda quinzena de dezembro a janeiro, julho, Carnaval, Semana Santa e feriados prolongados. Março, maio, setembro e outubro são os meses mais calmos.",
        "Onde ficar: resort do complexo se você quer conveniência e praticidade; apartamento na região se o grupo é grande, a estadia é longa ou vocês querem cozinhar.",
      ],
    },
    {
      type: "expert-note",
      body:
        "A pergunta que resolve quase toda dúvida de hospedagem aqui não é sobre o hotel — é sobre a viagem. Quantas pessoas, idade das crianças, quantos dias, e se vocês pretendem passar o dia inteiro no parque ou alternar com descanso. Com essas quatro respostas, a escolha praticamente se define sozinha.",
      by: `Christiano Cavalcante, Bomgo Brasil`,
    },
    {
      type: "prose",
      heading: "Aprofunde no que interessa a você",
      paragraphs: [
        "O guia completo trata de deslocamento, quantos dias ficar, sazonalidade, o perfil de cada resort e — o detalhe que mais estraga programação — os dias em que o parque não abre.",
        "O comparativo entra na decisão mais comum de quem já escolheu o destino: Wellness ou Acqua, para qual perfil cada um funciona e onde cada um decepciona.",
      ],
    },
    {
      type: "hotel-card",
      heading: "Resorts do complexo",
      hotels: [
        {
          affiliateKey: "beach-park-acqua",
          name: "Acqua Beach Park Resort",
          summary: "Beira-mar e colado ao parque, para quem quer estar no meio da ação.",
          highlights: ["Acesso direto ao Aqua Park", "De frente para o mar"],
        },
        {
          affiliateKey: "beach-park-wellness",
          name: "Wellness Beach Park Resort",
          summary: "Apartamentos maiores e estrutura completa, para equilibrar parque e descanso.",
          highlights: ["Transfer gratuito ao parque", "Bom para famílias maiores"],
        },
        {
          affiliateKey: "beach-park-suites",
          name: "Suites Beach Park Resort",
          summary: "Ao lado do parque e da Vila Azul do Mar, sem depender de transporte.",
          highlights: ["A pé até o Aqua Park", "Boa porta de entrada na primeira viagem"],
        },
        {
          affiliateKey: "beach-park-oceani",
          name: "Oceani Beach Park Resort",
          summary: "Mais tranquilo e de frente para a praia, a cerca de 500 metros do parque.",
          highlights: ["Traslado para o parque", "Bom para casais e famílias menores"],
        },
      ],
    },
    {
      type: "accommodation-card",
      heading: "Apartamentos da Bomgo em Porto das Dunas",
      listingCodes: [],
    },
    {
      type: "cta",
      variant: "sofia",
      heading: "Quer que alguém organize isso com você?",
      body:
        "Diga quantas pessoas, a idade das crianças e quantos dias. A Sofia compara as opções e diz o que faz mais sentido — inclusive quando a resposta não é um resort.",
      label: "Falar com a Sofia",
    },
  ],
  sources: [
    { label: "Beach Park — resorts", url: "https://beachpark.com.br/resorts/" },
    { label: "Beach Park — dúvidas frequentes", url: "https://beachpark.com.br/duvidas-frequentes/" },
  ],
}
