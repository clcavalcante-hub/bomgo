/**
 * Curated from the real guest-review export (Stays internal dashboard,
 * synced from Booking.com/Airbnb/Expedia), re-exported 2026-07-20 covering
 * ~1 year of reviews (451 total). Only reviews with 4+ stars AND a real
 * written comment worth quoting are included — never generated, never
 * rephrased. One best review per listing (highest rating, then longest
 * genuine comment). A handful of very long quotes were trimmed to a full
 * sentence near ~280 characters for card layout — always cut at a real
 * sentence boundary, never mid-sentence, never reworded.
 *
 * One entry (TV02F) was deliberately swapped: the first candidate picked by
 * rating+length was actually a warning about a mixed-up booking (dirty vs.
 * clean unit) that happened to carry a 5-star rating — excluded by hand,
 * replaced with that listing's next-best genuinely positive review.
 *
 * `listingCode` matches `Property.code` (Stays' short listing code, e.g.
 * "LC03F") so a property page can show its own review when it has one.
 * Guest names are trimmed to first name + last initial (no full name/photo).
 *
 * Update by re-exporting from the reviews panel and re-curating by hand —
 * this is not a live integration (Stays has no public reviews API; see
 * /areas/website-redesign.md for why).
 */

export interface CuratedReview {
  id: string
  listingCode: string
  guestName: string
  rating: number
  quote: string
  channel: 'Airbnb' | 'Booking.com' | 'Expedia'
  date: string // "mês de aaaa", already human-readable, never invented
}

export const curatedReviews: CuratedReview[] = [
  {
    id: 'rev-xf02h-carlos',
    listingCode: 'XF02H',
    guestName: 'Carlos A.',
    rating: 5,
    quote:
      'A área de piscinas, comercio interno no condomínio e restaurante ajudaram a diminuir a necessidade de sair do local para resolver temas de alimentação. O apartamento é confortável e contem todos os utensílios necessários para uma boa estadia.',
    channel: 'Booking.com',
    date: 'julho de 2025',
  },
  {
    id: 'rev-oi01h-rodrigo',
    listingCode: 'OI01H',
    guestName: 'Rodrigo L.',
    rating: 5,
    quote:
      'Acomodação excelente no geral! O condomínio é incrível, com uma piscina maravilhosa de frente para o mar. Quartos confortáveis, roupa de cama limpa.',
    channel: 'Airbnb',
    date: 'setembro de 2025',
  },
  {
    id: 'rev-ua02h-natalia',
    listingCode: 'UA02H',
    guestName: 'Natalia M.',
    rating: 5,
    quote:
      'Do check-in facilitado a um local bem aconchegante, muito perto do Beach Park, local tranquilo, bem monitorado, deixamos o carro na rua e foi tranquilo (porque estávamos em 2 carros).',
    channel: 'Airbnb',
    date: 'outubro de 2025',
  },
  {
    id: 'rev-mv01i-felipe',
    listingCode: 'MV01I',
    guestName: 'Felipe S.',
    rating: 5,
    quote:
      'Tudo certo. Ótimo apto térreo. Bem frente à piscina. Dos acompanhar as crianças de longe na piscina. Tudo limpo e organizado. Parabéns e obrigado',
    channel: 'Booking.com',
    date: 'agosto de 2025',
  },
  {
    id: 'rev-qh01g-armando',
    listingCode: 'QH01G',
    guestName: 'Armando N.',
    rating: 5,
    quote:
      'A nossa estadia foi simplesmente maravilhosa! A localização é excelente, de frente para uma praia linda e a poucos minutos do Beach Park. Os apartamentos são confortáveis, bem limpos e organizados.',
    channel: 'Booking.com',
    date: 'agosto de 2025',
  },
  {
    id: 'rev-jn02f-leandro',
    listingCode: 'JN02F',
    guestName: 'Leandro A.',
    rating: 5,
    quote:
      'Quero agradecer pela hospedagem incrível! A acomodação superou minhas expectativas. tudo estava muito limpo, organizado e exatamente como nas fotos. O ambiente é aconchegante, bem cuidado e transmite uma sensação maravilhosa de conforto.',
    channel: 'Airbnb',
    date: 'novembro de 2025',
  },
  {
    id: 'rev-kn02j-mariana',
    listingCode: 'KN02J',
    guestName: 'Mariana L.',
    rating: 5,
    quote: 'Apartamento muito funcional e aconchegante.',
    channel: 'Airbnb',
    date: 'julho de 2026',
  },
  {
    id: 'rev-ch01j-murilo',
    listingCode: 'CH01J',
    guestName: 'Murilo S.',
    rating: 5,
    quote:
      'Limpeza do apartamento estava excelente. Cozinha com diversos utensílios e de boa qualidade. Ares condicionados funcionando bem. Restaurante excelente com bom custo benefício.',
    channel: 'Expedia',
    date: 'novembro de 2025',
  },
  {
    id: 'rev-lc03f-gabriel',
    listingCode: 'LC03F',
    guestName: 'Gabriel P.',
    rating: 5,
    quote:
      'Tudo ocorreu muito bem durante a estadia. O check-in foi rápido e prático. O apartamento é limpo, organizado, funcional e conta com camas confortáveis. A vista da varanda é um espetáculo à parte e torna a experiência ainda mais agradável.',
    channel: 'Booking.com',
    date: 'julho de 2026',
  },
  {
    id: 'rev-tv02f-cesar',
    listingCode: 'TV02F',
    guestName: 'César V.',
    rating: 5,
    quote:
      'Apartamento em um condomínio muito bom localizado à beira mar de Fortaleza. Acesso seguro por identificação facial. Staff amigável. Piscina muito boa. Lavanderia, mercadinho e cafeteria internos. Porta com fechadura eletrônica.',
    channel: 'Airbnb',
    date: 'julho de 2025',
  },
  {
    id: 'rev-cu01j-renata',
    listingCode: 'CU01J',
    guestName: 'Renata O.',
    rating: 5,
    quote: 'Acomodação excelente estávamos em família 10 adultos e 2 crianças espaço amplo e confortável.',
    channel: 'Booking.com',
    date: 'junho de 2026',
  },
  {
    id: 'rev-ko03i-alexandre',
    listingCode: 'KO03I',
    guestName: 'Alexandre A.',
    rating: 5,
    quote:
      'Minha estadia de 02 dias no feriado foi maravilhosa. O apartamento na Praia de Iracema é excelente, com uma cama super confortável e acomodações impecáveis.',
    channel: 'Booking.com',
    date: 'abril de 2026',
  },
  {
    id: 'rev-br01i-armando',
    listingCode: 'BR01I',
    guestName: 'Armando N.',
    rating: 5,
    quote:
      'A nossa estadia foi simplesmente maravilhosa! A localização é excelente, de frente para uma praia linda e a poucos minutos do Beach Park. Os apartamentos são confortáveis, bem limpos e organizados.',
    channel: 'Booking.com',
    date: 'agosto de 2025',
  },
  {
    id: 'rev-pw01f-tiago',
    listingCode: 'PW01F',
    guestName: 'Tiago Z.',
    rating: 5,
    quote: 'Apartamento todo lindo, limpo e funcional! Super indico',
    channel: 'Booking.com',
    date: 'junho de 2026',
  },
  {
    id: 'rev-bj02i-camila',
    listingCode: 'BJ02I',
    guestName: 'Camila M.',
    rating: 5,
    quote:
      'Localização perfeita. Adoramos. Apto tudo ok. Bem organizado, limpo e confortável. O anfitrião Chris foi bem atencioso. Recomendamos',
    channel: 'Booking.com',
    date: 'julho de 2025',
  },
  {
    id: 'rev-fl01j-maria',
    listingCode: 'FL01J',
    guestName: 'Maria A.',
    rating: 5,
    quote: 'Tudo maravilhoso amei',
    channel: 'Expedia',
    date: 'maio de 2026',
  },
  {
    id: 'rev-mw10g-bezerra',
    listingCode: 'MW10G',
    guestName: 'Bezerra C.',
    rating: 5,
    quote: 'Próximo de tudo, bem localizado e muito confortável.',
    channel: 'Booking.com',
    date: 'maio de 2026',
  },
  {
    id: 'rev-jn04f-rochele',
    listingCode: 'JN04F',
    guestName: 'Rochele R.',
    rating: 5,
    quote: 'Foi ótimo! Eu e minha família adoramos',
    channel: 'Expedia',
    date: 'abril de 2026',
  },
  {
    id: 'rev-fr01j-dudu',
    listingCode: 'FR01J',
    guestName: 'Dudu N.',
    rating: 5,
    quote:
      'Apartamento impecável, muito bom gosto. O local tem uma decoração sofisticada. Três quartos com banheiros e ar condicionados. Com todos os utensílios domésticos, não deixa nada a desejar. Tudo isso, na beira da praia, com uma vista maravilhosa. Recomendo!',
    channel: 'Airbnb',
    date: 'abril de 2026',
  },
  {
    id: 'rev-bk03i-cibele',
    listingCode: 'BK03I',
    guestName: 'Cibele R.',
    rating: 5,
    quote: 'Apartamento limpo e organizado! Nossa família foi muito bem recebida. Com certeza voltaremos mais vezes!',
    channel: 'Booking.com',
    date: 'agosto de 2025',
  },
  {
    id: 'rev-co03j-fernando',
    listingCode: 'CO03J',
    guestName: 'Fernando T.',
    rating: 4,
    quote:
      'Ficamos satisfeitos com a localização, hospedagem e limpeza. O apto é novo, reformado, e tinha o formato de cobertura. Possui móveis novos, roupas de cama e banho e utensílios para cozinha: louças e eletrodomésticos.',
    channel: 'Booking.com',
    date: 'março de 2026',
  },
  {
    id: 'rev-mw09g-robson',
    listingCode: 'MW09G',
    guestName: 'Robson P.',
    rating: 5,
    quote: 'Localização, apartamento muito bom, limpeza, custo benefício.',
    channel: 'Booking.com',
    date: 'janeiro de 2026',
  },
  {
    id: 'rev-mw05g-ryan',
    listingCode: 'MW05G',
    guestName: 'Ryan A.',
    rating: 5,
    quote:
      "Nice place and we got to enjoy the nearby beach, pool and gym. Right outside is a good stand and acaí stand where we went quite a few times. There are also always taxi's waiting at the neighbouring hotel, which we used only the first and last day because we had a rental car.",
    channel: 'Airbnb',
    date: 'setembro de 2025',
  },
  {
    id: 'rev-zy01i-bruna',
    listingCode: 'ZY01I',
    guestName: 'Bruna P.',
    rating: 5,
    quote:
      'Primeiramente o Terramaris é muito bem localizado. A praia bem em frente. Bem pertinho do beach park. Ficamos na cobertura no bloco 1. Foi entregue limpo e organizado. De resto equipe muito boa e atendimento excelente.',
    channel: 'Booking.com',
    date: 'fevereiro de 2026',
  },
  {
    id: 'rev-bk02i-thiago',
    listingCode: 'BK02I',
    guestName: 'Thiago A.',
    rating: 5,
    quote:
      'O local é super agradável. Bem frente à praia e com uma ótima piscina principalmente para as crianças. Ficamos no apto térreo, ótimo para sair logo para área de lazer pela varanda. O apto estava bem limpo e organizado.',
    channel: 'Booking.com',
    date: 'janeiro de 2026',
  },
  {
    id: 'rev-vo01i-cindy',
    listingCode: 'VO01I',
    guestName: 'Cindy F.',
    rating: 5,
    quote: 'Os quartos e o espaço da varanda.',
    channel: 'Booking.com',
    date: 'fevereiro de 2026',
  },
  {
    id: 'rev-kv01i-italo',
    listingCode: 'KV01I',
    guestName: 'Italo N.',
    rating: 5,
    quote:
      'Gostamos muito do apartamento! Ótima localização, vista magnífica para a praia e quartos excelentes. Amamos os dois dias que passamos em confraternização no local, foi maravilhoso. Com certeza voltaremos mais vezes!',
    channel: 'Booking.com',
    date: 'dezembro de 2025',
  },
  {
    id: 'rev-jn06f-isao',
    listingCode: 'JN06F',
    guestName: 'Isao F.',
    rating: 5,
    quote: 'Apartamento super confortável, limpeza impecável, atendimento do anfitrião.',
    channel: 'Booking.com',
    date: 'janeiro de 2026',
  },
  {
    id: 'rev-jn09f-armando',
    listingCode: 'JN09F',
    guestName: 'Armando N.',
    rating: 5,
    quote:
      'A nossa estadia foi simplesmente maravilhosa! A localização é excelente, de frente para uma praia linda e a poucos minutos do Beach Park. Os apartamentos são confortáveis, bem limpos e organizados.',
    channel: 'Booking.com',
    date: 'agosto de 2025',
  },
  {
    id: 'rev-jn08f-castro',
    listingCode: 'JN08F',
    guestName: 'Castro J.',
    rating: 5,
    quote:
      'Localização, muito organizado, limpeza perfeita. Cozinha super equipada. Fora que os outros condôminos são pessoas educadas. Não escutamos gritos. Amei o apartamento, com certeza voltaremos.',
    channel: 'Booking.com',
    date: 'agosto de 2025',
  },
  {
    id: 'rev-lc02f-joscelene',
    listingCode: 'LC02F',
    guestName: 'Joscelene D.',
    rating: 5,
    quote:
      'Lugar maravilhoso, localização excelente, funcionários gentis e prestativos, anfitrião sempre à disposição. Voltarei mais vezes, com certeza.',
    channel: 'Booking.com',
    date: 'novembro de 2025',
  },
  {
    id: 'rev-op01i-ana',
    listingCode: 'OP01I',
    guestName: 'Ana F.',
    rating: 5,
    quote:
      'A estadia foi excelente! O espaço é ainda mais bonito e agradável do que exibido nas poucas fotos disponíveis. Gustavo foi muito atencioso e disponível.',
    channel: 'Airbnb',
    date: 'outubro de 2025',
  },
  {
    id: 'rev-ay01h-daniele',
    listingCode: 'AY01H',
    guestName: 'Daniele R.',
    rating: 5,
    quote: 'Super aconchegante e confortável.',
    channel: 'Booking.com',
    date: 'dezembro de 2025',
  },
  {
    id: 'rev-xe03g-armando',
    listingCode: 'XE03G',
    guestName: 'Armando N.',
    rating: 5,
    quote:
      'A nossa estadia foi simplesmente maravilhosa! A localização é excelente, de frente para uma praia linda e a poucos minutos do Beach Park. Os apartamentos são confortáveis, bem limpos e organizados.',
    channel: 'Booking.com',
    date: 'agosto de 2025',
  },
  {
    id: 'rev-an01h-ester',
    listingCode: 'AN01H',
    guestName: 'Ester M.',
    rating: 5,
    quote:
      'Amei o atendimento do Péricles. TV, cozinha, tem tudo para você preparar algo para comer. Condomínio super tranquilo e pessoas educadas.',
    channel: 'Booking.com',
    date: 'dezembro de 2025',
  },
  {
    id: 'rev-mi01i-rafael',
    listingCode: 'MI01I',
    guestName: 'Rafael C.',
    rating: 4,
    quote: 'Não havia café da manhã, a acomodação foi boa.',
    channel: 'Booking.com',
    date: 'novembro de 2025',
  },
  {
    id: 'rev-ck01i-vanina',
    listingCode: 'CK01I',
    guestName: 'Vanina M.',
    rating: 5,
    quote:
      'La respuesta y solución ante inconvenientes de pagos. Las instalaciones y cuidado del establecimiento, entretenimiento para menores, salida directa al mar, vas caminando al beach park.',
    channel: 'Booking.com',
    date: 'agosto de 2025',
  },
  {
    id: 'rev-pw02f-luis',
    listingCode: 'PW02F',
    guestName: 'Luis B.',
    rating: 5,
    quote: 'Foi muito bom, o apartamento superou nossas expectativas, o condomínio mais ainda, com toda certeza, voltaremos.',
    channel: 'Airbnb',
    date: 'julho de 2025',
  },
  {
    id: 'rev-vp01i-giovanni',
    listingCode: 'VP01I',
    guestName: 'Giovanni P.',
    rating: 5,
    quote: 'Foi ótima a estadia. Até a próxima.',
    channel: 'Airbnb',
    date: 'julho de 2025',
  },
]

// Real numbers from the same 1-year export (451 rated reviews across every
// listing). `topPerformersAverage` is NOT the overall average — it's the
// real weighted average of the 10 best-performing listings (each with at
// least 3 reviews, so one lucky 5-star doesn't skew a tiny sample), which
// is what the homepage band displays. Labeled clearly as "hospedagens mais
// bem avaliadas" rather than presented as the site-wide average, so it
// stays accurate even though it's a favorable slice, not the full mean
// (the honest full-corpus average is 4,3 — kept here for reference/if this
// copy ever needs to switch back to the unfiltered number).
export const reviewsSummary = {
  overallAverage: 4.3,
  topPerformersAverage: 4.7,
  topPerformersReviewCount: 138,
  count: 451,
  channels: ['Airbnb', 'Booking.com', 'Expedia'] as const,
}
