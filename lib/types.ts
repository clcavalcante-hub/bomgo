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

// Commission rule applied to a connection or an individual listing.
export interface CommissionRule {
  type: 'percentage' | 'fixed' | 'none'
  value: number // percent (0-100) when "percentage"; BRL when "fixed"
  label?: string
}

/**
 * Internal-only provenance for a property. It is NEVER rendered by the UI and
 * is stripped from the client-facing search payload — the customer must not be
 * able to tell which Stays account a listing came from. It exists so that the
 * server can always route reservations, prices, blocks and edits back to the
 * correct Stays connection.
 */
export interface PropertyOrigin {
  internalPropertyId: string // Bomgo-side stable id (namespaced per connection)
  externalListingId: string // the listing id in the source Stays account
  staysConnectionId: string // which connection owns this listing
  partnerId: string | null // partner that owns the account (null for primary)
  sourceAccount: string // human-readable connection name (internal ops only)
  commissionRule: CommissionRule // effective commission for this listing
  directBookingEnabled: boolean // can Bomgo book it directly
  active: boolean // listing currently sellable
}

export interface Property {
  id: string
  slug: string
  name: string
  source: SourceType
  destination: string
  location: string
  neighborhood: string
  latitude?: number | null
  longitude?: number | null
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
  origin?: PropertyOrigin // internal only; stripped before reaching the client
}

export interface Destination {
  id: string
  name: string
  region: string
  image: string
  propertiesLabel: string
}

export type DestinationSelectionType = 'city' | 'region' | 'neighborhood' | 'property'

/**
 * Structured destination filter. Replaces free-text destination strings so a
 * município (city) and a bairro/região (region) are never conflated or
 * concatenated into a single opaque string.
 */
export interface DestinationSelection {
  type: DestinationSelectionType
  label: string
  city?: string
  region?: string
  state?: string
  country?: string
}

export interface Offer {
  id: string
  title: string
  subtitle: string
  image: string
  tag: string
  /** CJ Affiliate tracked deep link. When present, the card opens this
   * external URL (same tab) instead of the internal /busca search. */
  externalUrl?: string
}

export interface SearchCriteria {
  destination: DestinationSelection | null
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

export interface SofiaMessage {
  id: string
  role: "sofia" | "user"
  content: string
}

// -------------------------------------------------------------------------
// Reservation domain (server-side). These types describe an internal Bomgo
// reservation that is always routed back to the exact Stays connection that
// owns the listing. They are independent from the legacy `Reservation`
// (checkout/UI) shape above so the UI contracts stay untouched.
// -------------------------------------------------------------------------

export type ReservationStatus =
  | "draft" // created internally, before the Stays hold
  | "awaiting_payment" // payment intent open (Cielo, future step)
  | "pre_reserved" // Stays hold created (type "reserved"); inventory held
  | "confirmed" // paid + Stays reservation set to "booked"
  | "cancelled" // cancelled on Bomgo + Stays
  | "expired" // hold expired without payment
  | "completed" // stay finished
  | "synchronization_error" // Stays write failed / local vs remote drift

export interface ReservationGuestDetails {
  adults: number
  children: number
}

export interface ReservationCustomer {
  firstName: string
  lastName: string
  email: string
  phone?: string
  document?: string // CPF/CNPJ
}

export interface ReservationAmount {
  currency: string // BRL
  nightlyPrice: number
  nights: number
  subtotal: number
  fees: number
  total: number
  // Where the authoritative total came from. Never trusts the browser.
  source: "stays" | "simulated"
}

// Internal provenance reference kept on every reservation so prices, blocks,
// modifications and cancellations always go back to the correct account.
export interface ReservationOriginRef {
  internalPropertyId: string
  externalListingId: string
  staysConnectionId: string
  partnerId: string | null
  sourceAccount: string
}

export interface InternalReservation {
  reservationId: string // internal Bomgo id (namespaced by connection)
  idempotencyKey: string | null
  status: ReservationStatus
  origin: ReservationOriginRef
  staysReservationId: string | null // `_id` returned by Stays
  reservationCode: string | null // human code (Stays `id` or internal fallback)
  staysClientId: string | null // `_idclient` in the owning account
  customer: ReservationCustomer
  checkInDate: string // YYYY-MM-DD
  checkOutDate: string // YYYY-MM-DD
  guests: number
  guestsDetails: ReservationGuestDetails
  amount: ReservationAmount
  simulated: boolean // true when no real Stays write happened (fallback)
  holdExpiresAt: string | null // ISO — pre-reservation validity deadline
  createdAt: string
  updatedAt: string
  requestId: string // correlates logs + audit for the creating request
}

// Public/ops view returned by the reservation routes.
export interface ReservationView {
  reservationId: string
  staysReservationId: string | null
  reservationCode: string | null
  connectionId: string
  status: ReservationStatus
  amount: ReservationAmount
  holdExpiresAt: string | null
  simulated: boolean
}

export interface ReservationAuditEntry {
  id: string
  reservationId: string
  requestId: string
  action: string
  fromStatus: ReservationStatus | null
  toStatus: ReservationStatus | null
  at: string
  meta?: Record<string, unknown>
}

// Auth / customer account. The shape mirrors what a real provider
// (Better Auth, Supabase Auth) would return, so the mock can be swapped
// without touching the UI.
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isClubMember: boolean
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
}
