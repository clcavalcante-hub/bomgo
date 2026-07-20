import type { Destination, Offer } from '@/lib/types'

export const destinations: Destination[] = [
  {
    id: 'fortaleza',
    name: 'Fortaleza',
    region: 'Ceará',
    image: '/images/dest-fortaleza.png',
    propertiesLabel: 'Praias urbanas e orla vibrante',
  },
  {
    id: 'beach-park',
    name: 'Beach Park',
    region: 'Porto das Dunas',
    image: '/images/dest-beachpark.png',
    propertiesLabel: 'Diversão à beira-mar',
  },
  {
    id: 'maragogi',
    name: 'Maragogi',
    region: 'Alagoas',
    image: '/images/dest-maragogi.png',
    propertiesLabel: 'Piscinas naturais cristalinas',
  },
  {
    id: 'jericoacoara',
    name: 'Jericoacoara',
    region: 'Ceará',
    image: '/images/dest-jeri.png',
    propertiesLabel: 'Dunas, lagoas e pôr do sol',
  },
]

export const offers: Offer[] = [
  {
    id: 'offer-beachpark',
    title: 'Resorts do Beach Park em promoção',
    subtitle: 'Estrutura completa de parque aquático a poucos passos',
    image: '/images/dest-beachpark.png',
    tag: 'Oferta parceira',
    // TODO: colar o link rastreado da CJ (resort/wellness do Beach Park)
    externalUrl: '',
  },
  {
    id: 'offer-beira-mar',
    title: 'Hotel Luzeiros Fortaleza',
    subtitle: 'Em frente à Beira-Mar, a poucos passos da Feirinha',
    image: '/images/dest-fortaleza.png',
    tag: 'Oferta parceira',
    // TODO: colar o link rastreado da CJ (Luzeiros Fortaleza)
    externalUrl: '',
  },
  {
    id: 'offer-maragogi',
    title: 'Salinas Maragogi Resort',
    subtitle: 'Piscinas naturais e sossego no Caribe brasileiro',
    image: '/images/dest-maragogi.png',
    tag: 'Oferta parceira',
    // TODO: colar o link rastreado da CJ (Salinas Maragogi)
    externalUrl: '',
  },
]
