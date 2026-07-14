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
  {
    id: 'gramado',
    name: 'Gramado',
    region: 'Rio Grande do Sul',
    image: '/images/dest-gramado.png',
    propertiesLabel: 'Serra e clima europeu',
  },
  {
    id: 'orlando',
    name: 'Orlando',
    region: 'Estados Unidos',
    image: '/images/dest-orlando.png',
    propertiesLabel: 'Parques e resorts',
  },
]

export const offers: Offer[] = [
  {
    id: 'offer-beachpark',
    title: 'Temporada Beach Park',
    subtitle: 'Coberturas e apartamentos frente mar em Porto das Dunas',
    image: '/images/dest-beachpark.png',
    tag: 'Seleção Sofia',
  },
  {
    id: 'offer-beira-mar',
    title: 'Orla da Beira-Mar',
    subtitle: 'Sofisticação urbana com vista para o Atlântico',
    image: '/images/dest-fortaleza.png',
    tag: 'Reserva Direta Bomgo',
  },
  {
    id: 'offer-maragogi',
    title: 'Refúgio em Maragogi',
    subtitle: 'Piscinas naturais e sossego no Caribe brasileiro',
    image: '/images/dest-maragogi.png',
    tag: 'Parceiros oficiais',
  },
]
