import { CHRISTIANO } from "@/lib/content/authors"
import type { ContentDoc } from "@/lib/content/types"

// Guia do Beach Park.
//
// Três camadas, conforme a diretriz editorial: (1) informação objetiva, com
// fonte; (2) o que a operação da Bomgo observa na prática desde 2010; (3)
// recomendação por perfil — para quem cada opção funciona e para quem não
// funciona. É a terceira camada que a OTA não consegue produzir.
//
// Onde a informação varia por temporada, unidade, categoria ou data, o texto
// diz que varia e manda conferir no canal de reserva. Um guia que finge
// precisão sobre preço e horário envelhece em semanas.

export const beachParkGuide: ContentDoc = {
  slug: "beach-park",
  path: "/guias/beach-park",
  category: "guia",
  destination: "beach-park",
  title: "Guia do Beach Park: onde ficar, quantos dias e como escolher",
  heading: "Beach Park: guia completo para planejar sua viagem",
  subtitle:
    "Quantos dias ficar, qual resort combina com o seu perfil, quando a região lota e por que às vezes um apartamento é a escolha mais inteligente.",
  description:
    "Guia do Beach Park por quem administra hospedagem em Porto das Dunas desde 2010: quantos dias ficar, o perfil de cada resort, quando a região lota e resort ou apartamento.",
  author: CHRISTIANO,
  publishedAt: "2026-07-24",
  updatedAt: "2026-07-24",
  readingMinutes: 11,
  tags: ["beach park", "porto das dunas", "aquiraz", "onde ficar", "resort", "ceará"],
  status: "pending-validation",
  hasAffiliateLinks: true,
  related: ["porto-das-dunas", "wellness-ou-acqua"],
  blocks: [
    {
      type: "prose",
      paragraphs: [
        "O Beach Park fica em Porto das Dunas, no município de Aquiraz, a cerca de 25 km do Aeroporto Internacional de Fortaleza. É o maior parque aquático da América Latina, e no entorno dele formou-se um dos polos de hospedagem mais procurados do Ceará.",
        "A dúvida de quase todo mundo é a mesma: ficar num resort do complexo ou num apartamento na mesma praia? Não existe resposta única — existe a hospedagem que combina com o seu tipo de viagem. É isso que este guia resolve.",
      ],
    },

    {
      type: "prose",
      heading: "Quanto tempo do aeroporto até Porto das Dunas",
      paragraphs: [
        "O trajeto costuma levar de 30 a 40 minutos, numa distância de 24 a 25 quilômetros. O próprio Beach Park informa média próxima de 35 minutos no serviço de traslado.",
        "Mas eu não planejaria a viagem em cima de 35 minutos. Na prática o tempo depende do horário do voo, do trânsito na saída de Fortaleza e das condições da CE-025 — que já teve trecho interditado, obrigando rota alternativa. Em horário tranquilo dá 30 minutos; em pico, chuva forte ou feriado, pode passar de uma hora.",
        "Minha orientação: considere 40 minutos como referência e não marque compromisso apertado logo depois do desembarque. Na volta, saia com folga — principalmente em voo de manhã, fim de semana prolongado e alta temporada.",
        "Vale saber também que Porto das Dunas não fica no centro de Fortaleza. Pertence a Aquiraz, dentro da região metropolitana. Você chega rápido ao parque, mas conte deslocamento se pretende passear com frequência pela Beira-Mar ou pela Praia de Iracema.",
      ],
    },

    {
      type: "prose",
      heading: "Quantos dias realmente vale a pena ficar",
      paragraphs: [
        "Não existe número igual para todo mundo — depende do objetivo da viagem.",
        "Para conhecer só o parque, duas ou três noites resolvem: você chega, descansa, passa um dia inteiro no Aqua Park e ainda aproveita um pouco de praia. Funciona bem para casal ou adultos que querem conhecer uma vez.",
        "Com criança pequena, eu recomendo quatro a cinco noites. Quem viaja com criança não cumpre a programação de um casal: tem pausa para comer, dormir, trocar de roupa, cansaço e imprevisto. Viagem curta demais vira corrida. Com quatro ou cinco noites dá para fazer o parque sem pressa, descansar no dia seguinte, aproveitar piscina e praia, conhecer a Vila Azul do Mar e ainda repetir o parque, se o ingresso permitir.",
        "Com crianças maiores ou adolescentes, quatro noites é boa média — eles aguentam um dia inteiro de atração e rendem mais. Ainda assim, deixe um período livre para praia ou resort.",
        "Para férias completas, cinco a sete noites. É o período que combina parque, estrutura da hospedagem, praia, descanso, um passeio por Fortaleza e a gastronomia da região. Quem vem do Sul, Sudeste ou do exterior e fica só duas noites raramente compensa o custo do deslocamento.",
        "Grupos que alugam apartamento costumam render bem em quatro a sete noites. O apartamento faz mais sentido quando o grupo quer viver Porto das Dunas com liberdade, cozinhar algumas refeições e dividir custos.",
      ],
    },
    {
      type: "expert-note",
      body:
        "Resumo que eu daria a um amigo: três noites para uma visita rápida, quatro ou cinco para uma viagem confortável em família, seis ou sete para aproveitar o destino sem pressa.",
      by: "Christiano Cavalcante, Bomgo Brasil",
    },

    {
      type: "prose",
      heading: "Quando Porto das Dunas e o Beach Park ficam mais cheios",
      paragraphs: [
        "Os picos são previsíveis: férias de janeiro, férias de julho, Natal e Réveillon, Carnaval, Semana Santa, feriados prolongados e fins de semana de verão.",
        "Mas existe uma diferença que quase ninguém explica: parque cheio não é a mesma coisa que região cheia. O Aqua Park pode lotar num sábado ou feriado sem que Porto das Dunas pareça cheia. Já em janeiro, julho e Réveillon a ocupação se espalha — resorts, condomínios, restaurantes, praias e as vias de acesso.",
        "Alta temporada, na prática: da segunda quinzena de dezembro ao fim de janeiro, julho, Carnaval, Semana Santa e grandes feriados. Nesses períodos as diárias sobem, a disponibilidade cai, o trânsito aumenta e as filas crescem. Reservar cedo deixa de ser conselho e vira necessidade.",
        "Média temporada: fevereiro fora do Carnaval, junho, agosto e algumas semanas de novembro, dependendo de evento e calendário escolar.",
        "Baixa temporada: março, abril fora da Semana Santa, maio, parte de junho, agosto, setembro, outubro e início de novembro. Atenção — baixa temporada não significa parque vazio todo dia: fim de semana e feriado ainda enchem.",
        "E aqui está a confusão que quase todo guia comete: temporada turística e período de chuva não são a mesma coisa. A quadra chuvosa do Ceará vai de fevereiro a maio — é a definição da FUNCEME, o órgão estadual de meteorologia. Já a alta temporada é julho, dezembro e janeiro. Ou seja, o mês mais cheio do ano é justamente um mês seco, e os meses de chuva são os mais vazios.",
        "Quem prioriza preço e tranquilidade, e aceita risco de chuva à tarde, encontra março e abril bem mais baratos. Quem viaja em julho paga mais e divide o tobogã com muita gente: em julho de 2025 a Prefeitura de Fortaleza projetou mais de 460 mil turistas e ocupação hoteleira acima de 85%.",
      ],
    },

    {
      type: "prose",
      heading: "Ingressos e horários: confira antes de fechar a viagem",
      paragraphs: [
        "Este é o detalhe que mais estraga programação e quase ninguém avisa: o Aqua Park não abre todos os dias do ano. Pelo próprio Beach Park, na baixa estação ele fecha às quartas e quintas no primeiro semestre, e só às quartas no segundo. O horário padrão é das 11h às 17h, com bilheteria a partir das 10h30 — e o parque avisa que o calendário pode mudar sem aviso prévio.",
        "Já vi hóspede reservar poucas noites e escolher justamente a quarta-feira de baixa estação para o parque. Confira o calendário oficial da sua data antes de comprar passagem, não depois.",
        "Duas informações oficiais que ajudam no orçamento: crianças com menos de 1 metro de altura não pagam ingresso, e o estacionamento tem diária própria. Praia e Vila Azul do Mar não exigem ingresso; o Parque Arvorar tem entrada separada.",
        "Sobre valores: eles mudam com frequência, incluindo promoções para residentes do Ceará. Por isso não fixo preço aqui — consulte sempre a página oficial de ingressos para a sua data.",
      ],
    },
    {
      type: "expert-note",
      body:
        "Quem busca economia e tranquilidade deve viajar durante a semana, fora das férias escolares e dos feriados. Quem só pode viajar na alta precisa comprar ingresso, reservar hospedagem e planejar horários com antecedência — não é exagero, é o que evita frustração.",
      by: "Christiano Cavalcante, Bomgo Brasil",
    },

    {
      type: "prose",
      heading: "O perfil de cada resort do complexo",
      paragraphs: [
        "Não existe simplesmente o melhor resort. Existe o que encaixa no perfil daquela viagem. Abaixo, o que observo em quem hospedo — e o ponto de atenção honesto de cada um.",
        "Estrutura, categoria e serviços variam por unidade e por temporada: confirme sempre no canal de reserva antes de fechar.",
      ],
    },
    {
      type: "hotel-card",
      hotels: [
        {
          affiliateKey: "beach-park-acqua",
          name: "Acqua Beach Park Resort",
          summary:
            "Para quem quer ficar perto da ação, entre parque, piscina e praia, sem passar muito tempo parado. Conhecido pela localização à beira-mar e apartamentos espaçosos.",
          highlights: [
            "Indicado para famílias com crianças e quem valoriza estrutura aquática",
            "Acesso fácil à praia",
            "Atenção: pode ter atmosfera mais movimentada — quem busca silêncio deve olhar bem a categoria e a posição da unidade",
          ],
        },
        {
          affiliateKey: "beach-park-wellness",
          name: "Wellness Beach Park Resort",
          summary:
            "Apartamentos maiores e estrutura interna completa, com sensação de condomínio-resort. Escolha racional para quem quer conforto sem depender de sair para tudo.",
          highlights: [
            "Indicado para famílias maiores e quem precisa de mais espaço",
            "Piscinas, sauna, brinquedoteca, academia e área de bem-estar",
            "Bom para equilibrar parque e descanso, inclusive com criança pequena",
          ],
        },
        {
          affiliateKey: "beach-park-suites",
          name: "Suites Beach Park Resort",
          summary:
            "Proximidade e praticidade: sair do quarto e já estar perto das principais atrações e da Vila Azul do Mar. Costuma funcionar bem na primeira viagem ao Beach Park.",
          highlights: [
            "Indicado para quem não quer depender de transporte",
            "Perto do Aqua Park e da Vila Azul do Mar",
            "Atenção: menos indicado para quem procura atmosfera reservada",
          ],
        },
        {
          affiliateKey: "beach-park-oceani",
          name: "Oceani Beach Park Resort",
          summary:
            "Proposta mais acolhedora, para quem prioriza praia e tranquilidade sem abrir mão do acesso ao parque. Fica a cerca de 500 metros do Aqua Park, com traslado diário.",
          highlights: [
            "Indicado para casais e famílias menores",
            "Equilíbrio entre custo e estrutura",
            "Atenção: não dá a sensação de estar colado à entrada do parque",
          ],
        },
      ],
    },

    {
      type: "prose",
      heading: "Resort ou apartamento: a comparação honesta",
      paragraphs: [
        "Resort vende conveniência e serviço. Apartamento vende espaço, liberdade e economia para grupos. Essa é a diferença de fundo — o resto é consequência.",
        "O resort compensa para quem quer chegar e encontrar a operação pronta: café da manhã, arrumação, recepção, recreação. É conveniente na primeira viagem, para quem está sem carro, para hóspede idoso e para estadia curta. O custo tende a ser maior em família numerosa, e há menos privacidade e menos liberdade de rotina.",
        "O apartamento compensa para família grande, grupo de amigos, estadia mais longa e quem quer cozinhar. Num grupo de oito, dez ou doze pessoas, a relação entre espaço e custo costuma ser muito melhor que contratar vários quartos. Permite preparar comida para uma criança, guardar alimentos, lavar roupa, reunir todo mundo na sala e manter horários próprios. Em troca, o hóspede assume mais responsabilidade: nem sempre há café da manhã, recreação, arrumação diária ou recepção completa.",
        "Na prática: família pequena em viagem curta, o resort costuma compensar. Oito pessoas por seis noites, o apartamento quase sempre entrega mais.",
      ],
    },
    {
      type: "pros-and-cons",
      subject: "Ficar num resort do complexo",
      pros: [
        "Café da manhã, arrumação, recepção e recreação inclusos",
        "Operação pronta — menos logística durante a viagem",
        "Conveniente para quem está sem carro",
        "Boa porta de entrada na primeira viagem ao Beach Park",
      ],
      cons: [
        "Custo tende a subir bastante com família numerosa",
        "Menos privacidade e menos liberdade de rotina",
        "Sem cozinha própria para o dia a dia",
        "Contratar vários quartos raramente compensa para grupo grande",
      ],
    },

    {
      type: "prose",
      heading: "Dá para conhecer o parque hospedado fora?",
      paragraphs: [
        "Dá, perfeitamente. Você não precisa se hospedar num resort do complexo para entrar no Aqua Park — pode ficar em apartamento, hotel, pousada, em Porto das Dunas ou em Fortaleza, e comprar o ingresso normalmente.",
        "Quem fica fora precisa apenas organizar transporte de ida e volta, comprar o ingresso antecipado, e considerar estacionamento, alimentação e o cansaço depois de um dia inteiro de parque. Para quem está em Porto das Dunas a logística é simples: muitos condomínios ficam a poucos minutos do complexo. De Fortaleza também é viável, com deslocamento maior.",
        "Vale desfazer dois mal-entendidos que circulam bastante. O primeiro: dizem por aí que hóspede do complexo entra uma hora antes no parque. O que o Beach Park declara é mais específico — duas atrações abrem uma hora mais cedo, exclusivamente para hóspedes. É um benefício real, mas menor do que a versão que corre na internet.",
        "O segundo, mais importante para o seu bolso: não trate como regra que o ingresso está incluso na diária do resort. Isso depende da tarifa contratada, e o próprio Beach Park descreve os passaportes como item que o hóspede pode incluir na reserva. Pergunte por escrito antes de fechar — chegar na bilheteria achando que já estava pago é um problema caro.",
        "Ficar fora costuma valer para grupos grandes, quem quer apartamento, quem vai ao parque um dia só, quem pretende conhecer também Fortaleza e quem prefere ter cozinha e mais espaço. Ficar dentro ou muito perto compensa mais para família com criança pequena, quem vai ao parque mais de uma vez, quem está sem carro e viagens curtas.",
        "A resposta honesta: o que muda não é o acesso ao parque — é a conveniência da viagem.",
      ],
    },

    {
      type: "faq",
      heading: "Perguntas frequentes",
      items: [
        {
          question: "Preciso ficar num resort do Beach Park para entrar no parque?",
          answer:
            "Não. Qualquer visitante pode comprar ingresso e entrar, independentemente de onde esteja hospedado. Hospedar-se no complexo muda a conveniência da viagem, não o acesso ao parque.",
        },
        {
          question: "Quantos dias são suficientes?",
          answer:
            "Três noites para uma visita rápida; quatro ou cinco para uma viagem confortável em família com criança pequena; seis ou sete para aproveitar o destino sem pressa. Quem vem de muito longe raramente compensa com duas noites.",
        },
        {
          question: "Qual é a melhor época para ir?",
          answer:
            "Para tranquilidade e melhores tarifas, viajar durante a semana fora de férias escolares e feriados — março, maio, agosto, setembro e outubro costumam ser os períodos mais calmos. De março a junho há maior chance de chuva; de julho em diante predominam dias ensolarados.",
        },
        {
          question: "Vale mais a pena resort ou apartamento?",
          answer:
            "Depende do grupo. Família pequena em viagem curta costuma render mais no resort, pela conveniência. Grupo de oito a doze pessoas por vários dias costuma render muito mais num apartamento, por espaço e custo por pessoa.",
        },
        {
          question: "Porto das Dunas fica em Fortaleza?",
          answer:
            "Não. Fica em Aquiraz, na região metropolitana de Fortaleza, a cerca de 25 km do aeroporto. Você chega rápido ao Beach Park, mas conte deslocamento para passear pela Beira-Mar.",
        },
        {
          question: "O parque abre todos os dias?",
          answer:
            "Não. Segundo o próprio Beach Park, na baixa estação o Aqua Park fecha às quartas e quintas no primeiro semestre, e só às quartas no segundo. O horário padrão é 11h às 17h, e o calendário pode mudar sem aviso prévio — confira a sua data antes de comprar passagem.",
        },
        {
          question: "O ingresso do parque está incluso na diária do resort?",
          answer:
            "Não como regra. Depende da tarifa contratada: o Beach Park descreve os passaportes como item que o hóspede pode incluir na reserva. Confirme por escrito com a central de reservas antes de fechar.",
        },
      ],
    },

    {
      type: "cta",
      variant: "sofia",
      heading: "Ainda em dúvida entre resort e apartamento?",
      body:
        "A Sofia pergunta o que importa — quantas pessoas, idade das crianças, quantos dias, se precisa de cozinha, se quer café da manhã, se tem carro — e só então recomenda. Sem empurrar opção.",
      label: "Pedir ajuda à Sofia",
    },
  ],
  sources: [
    {
      label: "Beach Park — traslado e tempo de deslocamento",
      url: "https://ingresso.beachpark.com.br/transfers/p",
    },
    {
      label: "Beach Park — interdição na CE-025 e rota alternativa",
      url: "https://beachpark.com.br/blog/trecho-da-ce-025-interditado-veja-como-chegar-ao-beach-park-sem-complicacao/",
    },
    {
      label: "Beach Park — quando ir ao parque",
      url: "https://beachpark.com.br/blog/saiba-quando-ir-ao-beach-park-no-ceara/",
    },
    {
      label: "Beach Park — comparativo entre os resorts",
      url: "https://beachpark.com.br/blog/qual-o-melhor-resort-do-beach-park/",
    },
    { label: "Beach Park — Acqua", url: "https://beachpark.com.br/resorts/acqua-beach-park-resort/" },
    {
      label: "Beach Park — Wellness",
      url: "https://beachpark.com.br/resorts/wellness-beach-park-resort/",
    },
    {
      label: "Beach Park — Suites",
      url: "https://beachpark.com.br/resorts/suites-beach-park-resort/",
    },
    {
      label: "Beach Park — Oceani",
      url: "https://beachpark.com.br/resorts/oceani-beach-park-resort/",
    },
    {
      label: "Beach Park — dúvidas frequentes (horários, dias de fechamento, benefício de hóspede)",
      url: "https://beachpark.com.br/duvidas-frequentes/",
    },
    { label: "Beach Park — ingressos", url: "https://beachpark.com.br/ingressos/" },
    { label: "FUNCEME — quadra chuvosa do Ceará", url: "http://www.funceme.br/" },
    {
      label: "Prefeitura de Fortaleza — alta estação de julho",
      url: "https://www.fortaleza.ce.gov.br/noticias/com-projecao-para-receber-mais-de-460-mil-turistas-fortaleza-e-o-destino-mais-buscado-do-norte-e-do-nordeste-para-a-alta-estacao-de-julho",
    },
  ],
}
