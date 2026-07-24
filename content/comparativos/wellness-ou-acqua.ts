import { CHRISTIANO } from "@/lib/content/authors"
import type { ContentDoc } from "@/lib/content/types"

// Comparativo Wellness × Acqua.
//
// Página de intenção alta: quem chega aqui já escolheu o destino e está decidindo
// entre duas opções — é o momento mais perto da reserva de todo o cluster.
//
// A comparação é honesta nos dois sentidos. Um comparativo que só elogia os dois
// não ajuda ninguém a decidir, e um que elege vencedor único mente, porque a
// resposta depende do perfil da viagem. Cada resort aqui tem o que resolve e o
// que não resolve.

export const wellnessOuAcqua: ContentDoc = {
  slug: "wellness-ou-acqua",
  path: "/comparativos/wellness-ou-acqua",
  category: "comparativo",
  destination: "beach-park",
  title: "Wellness ou Acqua: qual resort do Beach Park escolher",
  heading: "Wellness ou Acqua: qual combina com a sua viagem?",
  subtitle:
    "Os dois são bons. Eles resolvem coisas diferentes — e a escolha errada custa conforto ou dinheiro.",
  description:
    "Comparativo entre Wellness e Acqua Beach Park Resort por quem hospeda em Porto das Dunas desde 2010: para qual perfil cada um funciona e onde cada um decepciona.",
  author: CHRISTIANO,
  publishedAt: "2026-07-24",
  updatedAt: "2026-07-24",
  readingMinutes: 6,
  tags: ["beach park", "wellness", "acqua", "resort", "comparativo"],
  status: "pending-validation",
  hasAffiliateLinks: true,
  related: ["beach-park"],
  blocks: [
    {
      type: "prose",
      paragraphs: [
        "Essa é a dúvida que mais aparece de quem já decidiu ir ao Beach Park e agora escolhe onde dormir. A resposta curta: não existe o melhor entre os dois — existe o que combina com o tipo da sua viagem.",
        "Os dois ficam no complexo e resolvem bem o essencial. A diferença aparece na rotina do dia a dia: quanto você quer estar no meio da ação e quanto espaço a sua família precisa.",
      ],
    },
    {
      type: "expert-note",
      body:
        "A pergunta que eu faço antes de recomendar não é sobre o resort — é sobre a viagem. Quantas pessoas, idade das crianças, quantos dias e se vocês pretendem passar o dia inteiro no parque ou alternar com descanso. Com isso, a escolha se resolve quase sozinha.",
      by: "Christiano Cavalcante, Bomgo Brasil",
    },
    {
      type: "comparison-table",
      heading: "Lado a lado",
      columns: ["Acqua", "Wellness"],
      rows: [
        {
          label: "Posição",
          values: ["Beira-mar, colado ao parque", "Em frente à Vila Azul do Mar, atravessando a via"],
        },
        {
          label: "Ida ao parque",
          values: ["A pé, acesso direto", "Transfer gratuito"],
        },
        {
          label: "Ritmo",
          values: ["Mais movimentado", "Mais reservado"],
        },
        {
          label: "Espaço do apartamento",
          values: ["Espaçoso", "Costuma ser maior — bom para família grande"],
        },
        {
          label: "Combina com",
          values: [
            "Quem quer ficar entre parque, piscina e praia sem parar",
            "Quem quer equilibrar parque e descanso, com estrutura para ficar",
          ],
        },
        {
          label: "Pode decepcionar",
          values: [
            "Quem procura silêncio — depende da categoria e da posição da unidade",
            "Quem quer sair do quarto e já estar dentro do parque",
          ],
        },
      ],
      sourceNote:
        "Posição e acessos conforme o Beach Park; a leitura de ritmo e perfil vem da operação da Bomgo na região. Estrutura e categoria variam por unidade — confirme no canal de reserva.",
    },
    {
      type: "prose",
      heading: "Escolha o Acqua se…",
      paragraphs: [
        "Você quer estar no meio da ação. A família acorda, vai ao parque, volta para a piscina, desce para a praia e repete. Estar colado ao parque economiza o tempo e a paciência que se perde em deslocamento com criança cansada.",
        "Funciona especialmente bem em viagem curta, quando cada hora conta, e para quem valoriza estar de frente para o mar.",
      ],
    },
    {
      type: "prose",
      heading: "Escolha o Wellness se…",
      paragraphs: [
        "Você quer o parque, mas também quer ter onde ficar. Famílias maiores, estadias mais longas e quem viaja com criança pequena costumam render mais aqui: apartamento maior, estrutura interna completa e um dia de descanso que não vira tédio.",
        "É a escolha mais racional para quem não quer depender de sair do resort para tudo — e o transfer resolve a ida ao parque sem drama.",
      ],
    },
    {
      type: "hotel-card",
      heading: "Ver preços e disponibilidade",
      hotels: [
        {
          affiliateKey: "beach-park-acqua",
          name: "Acqua Beach Park Resort",
          summary:
            "Beira-mar e colado ao parque. Para quem quer passar os dias entre parque, piscina e praia sem ficar parado.",
          highlights: ["Acesso direto ao Aqua Park", "De frente para o mar"],
        },
        {
          affiliateKey: "beach-park-wellness",
          name: "Wellness Beach Park Resort",
          summary:
            "Apartamentos maiores e estrutura completa, em frente à Vila Azul do Mar. Para equilibrar parque e descanso.",
          highlights: ["Transfer gratuito ao parque", "Bom para famílias maiores"],
        },
      ],
    },
    {
      type: "prose",
      heading: "E se nenhum dos dois for a resposta?",
      paragraphs: [
        "Acontece com mais frequência do que se imagina. Grupo de oito, dez ou doze pessoas, estadia de seis ou sete noites, vontade de cozinhar algumas refeições: nesse cenário, um apartamento na região quase sempre entrega mais espaço por menos, e a poucos minutos do parque.",
        "Resort vende conveniência e serviço. Apartamento vende espaço, liberdade e custo por pessoa. Não é questão de qual é melhor — é de qual resolve a sua viagem.",
      ],
    },
    {
      type: "faq",
      heading: "Perguntas frequentes",
      items: [
        {
          question: "Qual dos dois é mais barato?",
          answer:
            "Depende da data, da categoria do apartamento e do tamanho do grupo — e muda ao longo do ano. Consulte os dois para as suas datas antes de decidir; a diferença costuma variar mais por temporada do que entre os resorts.",
        },
        {
          question: "O ingresso do parque está incluso?",
          answer:
            "Não como regra. Depende da tarifa contratada — o Beach Park descreve os passaportes como item que o hóspede pode incluir na reserva. Confirme por escrito antes de fechar.",
        },
        {
          question: "Hóspede tem alguma vantagem no parque?",
          answer:
            "Sim, uma vantagem pontual: o Beach Park informa que duas atrações abrem uma hora mais cedo, exclusivamente para hóspedes. É menos do que a versão que circula por aí, de que o parque inteiro abriria antes.",
        },
      ],
    },
    {
      type: "cta",
      variant: "sofia",
      heading: "Quer que alguém decida isso com você?",
      body:
        "Me diga quantas pessoas, a idade das crianças e quantos dias. A Sofia compara os dois com o seu caso — e avisa se um apartamento fizer mais sentido.",
      label: "Pedir ajuda à Sofia",
    },
  ],
  sources: [
    { label: "Beach Park — Acqua", url: "https://beachpark.com.br/resorts/acqua-beach-park-resort/" },
    {
      label: "Beach Park — Wellness",
      url: "https://beachpark.com.br/resorts/wellness-beach-park-resort/",
    },
    {
      label: "Beach Park — dúvidas frequentes",
      url: "https://beachpark.com.br/duvidas-frequentes/",
    },
  ],
}
