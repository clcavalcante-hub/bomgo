// Domain types for the Bomgo platform.
// These contracts are shared between the mocked services and the UI so that
// the real integrations (Stays, Cielo, Booking, Expedia) can replace the
// mocks later without changing the component layer.

export type SourceType =
  | 'bomgo' // Reserva Direta Bomgo (own inventory via Stays)
  | 'partner' // Parceiro oficial local
  | 'booking' // Booking via deep links / CJ Affiliate
  | 'expedia' // Expedia via deep links / API futura

export type BadgeKey =
  | 'reserva-direta'
  | 'parceiro-oficial'
  | 'clube-bomgo'
  | 'mais-reservado'
  | 'ultimos-quartos'
  | 'cancelamento-flexivel'
  | 'oferta-sofia'

export interface Amenity {
  key: string
  label: string
}

export interface PropertyImage {
  src: string
  alt: string
}

export interface Review {
  id: string
  author: string
  location: string
  rating: number
  date: string
  comment: string
}

export interface Property {
  id: string
  slug: string
  name: string
  source: SourceType
  destination: string
  location: string
  neighborhood: string
  type: string
  summary: string
  description: string
  images: PropertyImage[]
  rating: number
  reviewsCount: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  areaSqm: number
  nightlyPrice: number // BRL, per night (simulated)
  cleaningFee: number // BRL (simulated)
  energyFee: number // BRL (simulated)
  badges: BadgeKey[]
  amenities: Amenity[]
  rules: string[]
  featured: boolean
  reviews: Review[]
  highlight?: string // e.g. "Cobertura com jacuzzi"
}

export interface Destination {
  id: string
  name: string
  region: string
  image: string
  propertiesLabel: string
}

export interface Offer {
  id: string
  title: string
  subtitle: string
  image: string
  tag: string
}

export interface SearchCriteria {
  destination: string
  checkIn: string | null // ISO date
  checkOut: string | null // ISO date
  adults: number
  children: number
  childrenAges: number[]
  rooms: number
}

export interface PriceBreakdown {
  nights: number
  nightlyPrice: number
  subtotal: number
  cleaningFee: number
  energyFee: number
  serviceFee: number
  total: number
}

export interface InstallmentOption {
  installments: number
  amount: number // per installment
  total: number
  hasInterest: boolean
}

export type PaymentMethod = 'pix' | 'card'

export type PaymentStatus =
  | 'idle'
  | 'processing'
  | 'approved'
  | 'declined'
  | 'pix-pending'

export interface Guest {
  firstName: string
  lastName: string
  email: string
  phone: string
  document: string // CPF
}

export interface Reservation {
  code: string
  property: Property
  criteria: SearchCriteria
  price: PriceBreakdown
  guest: Guest
  method: PaymentMethod
  installments: number
  status: PaymentStatus
  createdAt: string
}
