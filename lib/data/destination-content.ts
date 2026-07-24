// -------------------------------------------------------------------------
// Conteúdo editorial das páginas de destino (/hospedagem/[destino]).
//
// Texto único e real por localidade — é o que separa uma página que rankeia
// de uma "doorway page" fina que o Google penaliza. Cada destino tem H1,
// intro rica em palavra-chave, imagem e FAQ. Mapeado por id da taxonomia.
// -------------------------------------------------------------------------

export interface DestinationContent {
  /** H1 e título da página. */
  heading: string
  /** Subtítulo/lead exibido abaixo do H1. */
  intro: string
  /** Parágrafo de contexto (2-4 frases) — conteúdo próprio, não repetido. */
  body: string
  /** Imagem de capa (em /public/images). */
  image: string
  /** Perguntas frequentes — vira rich result de FAQ no Google. */
  faq: { question: string; answer: string }[]
}

const FALLBACK_IMAGE = "/images/hero-resort.png"

export const DESTINATION_CONTENT: Record<string, DestinationContent> = {
  "porto-das-dunas": {
    heading: "Aluguel por temporada em Porto das Dunas, Aquiraz",
    intro:
      "Apartamentos e casas de temporada em Porto das Dunas — a praia do Beach Park — com reserva direta e melhores preços.",
    body: "Porto das Dunas, em Aquiraz (CE), é o destino de praia mais procurado da Grande Fortaleza, a poucos passos do Beach Park. Na Bomgo você reserva direto com a Sofia, sem taxas escondidas, em apartamentos frente-mar e coberturas com piscina — ideal para famílias e feriados.",
    image: "/images/dest-beachpark.png",
    faq: [
      {
        question: "Onde fica Porto das Dunas?",
        answer:
          "Porto das Dunas fica no município de Aquiraz, Ceará, a cerca de 30 minutos de Fortaleza e ao lado do complexo Beach Park.",
      },
      {
        question: "Vale a pena alugar apartamento por temporada em Porto das Dunas?",
        answer:
          "Sim. Para famílias e grupos, o aluguel por temporada costuma sair mais barato que hotel, com cozinha, mais espaço e proximidade do Beach Park e das praias.",
      },
      {
        question: "Como reservar com a Bomgo?",
        answer:
          "Você reserva direto pelo site com a Sofia, nossa concierge de IA, pagando por Pix (aprovação imediata) ou cartão em até 6x.",
      },
    ],
  },
  "beach-park": {
    heading: "Hospedagem perto do Beach Park, Aquiraz",
    intro:
      "Casas e apartamentos por temporada a poucos minutos do Beach Park, com reserva direta pela Bomgo.",
    body: "Ficar perto do Beach Park é economizar tempo e transporte no maior parque aquático da América Latina. A Bomgo reúne hospedagens em Porto das Dunas e Aquiraz a caminhada ou minutos de carro do parque, com reserva direta e preço transparente.",
    image: "/images/dest-beachpark.png",
    faq: [
      {
        question: "Qual a melhor região para ficar perto do Beach Park?",
        answer:
          "Porto das Dunas é a praia onde o Beach Park está localizado — a região mais próxima e prática para quem vai ao parque.",
      },
      {
        question: "Dá para ir a pé ao Beach Park?",
        answer:
          "Vários imóveis em Porto das Dunas ficam a distância de caminhada do parque. Confira a localização de cada hospedagem na página do imóvel.",
      },
    ],
  },
  aquiraz: {
    heading: "Aluguel por temporada em Aquiraz, Ceará",
    intro:
      "Apartamentos e casas de temporada em Aquiraz, do Porto das Dunas ao litoral, com reserva direta.",
    body: "Aquiraz é a primeira vila do Ceará e concentra praias como Porto das Dunas, Prainha e Presídio, além do Beach Park. Na Bomgo você encontra hospedagem para todos os perfis, com reserva direta pela Sofia e pagamento por Pix ou cartão.",
    image: "/images/dest-beachpark.png",
    faq: [
      {
        question: "O que fazer em Aquiraz?",
        answer:
          "Beach Park, praias de Porto das Dunas e Prainha, artesanato de renda de bilro e passeios de buggy pelas dunas.",
      },
    ],
  },
  fortaleza: {
    heading: "Aluguel por temporada em Fortaleza, Ceará",
    intro:
      "Apartamentos por temporada em Fortaleza — Beira-Mar, Meireles e orla — com reserva direta e melhores preços.",
    body: "Fortaleza une praia urbana, vida noturna e gastronomia na orla da Beira-Mar. A Bomgo oferece apartamentos por temporada nos melhores bairros da capital cearense, com reserva direta pela Sofia, sem burocracia e com preço transparente.",
    image: "/images/dest-fortaleza.png",
    faq: [
      {
        question: "Qual o melhor bairro para se hospedar em Fortaleza?",
        answer:
          "Meireles e Beira-Mar são os mais procurados: seguros, na orla, perto de restaurantes, feirinha de artesanato e do calçadão.",
      },
      {
        question: "Aluguel por temporada em Fortaleza é seguro?",
        answer:
          "Na Bomgo a reserva é direta e confirmada, com pagamento por Pix ou cartão e suporte da concierge Sofia do início ao fim.",
      },
    ],
  },
  meireles: {
    heading: "Aluguel por temporada no Meireles, Fortaleza",
    intro:
      "Apartamentos por temporada no Meireles, o bairro nobre da orla de Fortaleza, com reserva direta.",
    body: "O Meireles é o coração da Beira-Mar de Fortaleza: calçadão, feirinha de artesanato, restaurantes e os melhores hotéis. Alugar um apartamento por temporada no Meireles com a Bomgo é ficar na orla pagando direto, sem taxas de intermediário.",
    image: "/images/dest-fortaleza.png",
    faq: [
      {
        question: "Por que se hospedar no Meireles?",
        answer:
          "É o trecho mais valorizado da orla, com segurança, calçadão, gastronomia e a feirinha da Beira-Mar à noite.",
      },
    ],
  },
  "beira-mar": {
    heading: "Aluguel por temporada na Beira-Mar de Fortaleza",
    intro:
      "Apartamentos frente-mar e próximos à Avenida Beira-Mar, com reserva direta pela Bomgo.",
    body: "A Avenida Beira-Mar é o cartão-postal de Fortaleza, com calçadão, feirinha noturna e vista para o Atlântico. A Bomgo reúne apartamentos por temporada na Beira-Mar e no Meireles, com reserva direta e preço sem surpresas.",
    image: "/images/dest-fortaleza.png",
    faq: [
      {
        question: "A feirinha da Beira-Mar funciona todo dia?",
        answer:
          "Sim, a feira de artesanato da Beira-Mar acontece todas as noites ao longo do calçadão.",
      },
    ],
  },
  cumbuco: {
    heading: "Aluguel por temporada em Cumbuco, Caucaia",
    intro:
      "Casas e apartamentos por temporada na praia do Cumbuco, com reserva direta pela Bomgo.",
    body: "Cumbuco, em Caucaia (CE), é famosa pelas dunas, lagoas, kitesurf e passeios de buggy — a menos de uma hora de Fortaleza. A Bomgo oferece hospedagem por temporada em Cumbuco com reserva direta pela Sofia e pagamento por Pix ou cartão.",
    image: FALLBACK_IMAGE,
    faq: [
      {
        question: "O que fazer em Cumbuco?",
        answer:
          "Passeio de buggy pelas dunas, kitesurf, lagoa do Cauípe e o famoso 'skibunda' nas dunas.",
      },
      {
        question: "Cumbuco fica longe de Fortaleza?",
        answer:
          "Não. Cumbuco fica em Caucaia, a cerca de 40 a 60 minutos de carro do centro de Fortaleza.",
      },
    ],
  },
  jericoacoara: {
    heading: "Aluguel por temporada em Jericoacoara, Ceará",
    intro:
      "Pousadas e casas por temporada em Jericoacoara, uma das praias mais bonitas do mundo, com reserva direta.",
    body: "Jericoacoara é vila de charme entre dunas e lagoas, com o pôr do sol da Duna e a Pedra Furada. A Bomgo oferece hospedagem por temporada em Jeri com reserva direta pela Sofia — do econômico ao pé na areia.",
    image: "/images/dest-jeri.png",
    faq: [
      {
        question: "Como chegar em Jericoacoara?",
        answer:
          "De Fortaleza são cerca de 300 km; o trecho final é feito em veículo 4x4 pelas dunas até a vila.",
      },
      {
        question: "Qual a melhor época para ir a Jericoacoara?",
        answer:
          "De julho a fevereiro há mais vento (bom para kite e windsurf) e sol; as lagoas ficam cheias entre fevereiro e julho.",
      },
    ],
  },
  maragogi: {
    heading: "Aluguel por temporada em Maragogi, Alagoas",
    intro:
      "Casas e apartamentos por temporada em Maragogi, no Caribe brasileiro, com reserva direta pela Bomgo.",
    body: "Maragogi, em Alagoas, é conhecida pelas piscinas naturais (galés) de águas cristalinas. A Bomgo oferece hospedagem por temporada em Maragogi com reserva direta pela Sofia e pagamento facilitado.",
    image: "/images/dest-maragogi.png",
    faq: [
      {
        question: "O que são as galés de Maragogi?",
        answer:
          "São piscinas naturais formadas por recifes a alguns quilômetros da costa, visitadas em passeios de catamarã na maré baixa.",
      },
    ],
  },
}

export function getDestinationContent(id: string): DestinationContent | null {
  return DESTINATION_CONTENT[id] ?? null
}
