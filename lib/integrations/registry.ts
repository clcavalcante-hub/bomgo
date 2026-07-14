// Static, secret-free registry of every integration the Bomgo platform is
// architected for. It documents readiness and the env vars that activate each
// one. Safe to import anywhere (client or server) — contains no credentials.
//
// "live"    -> adapter implemented, activates automatically when env is set
// "ready"   -> contract + fallback in place, adapter stub awaiting credentials
// "planned" -> reserved in the type system / data model, not yet wired

export type IntegrationStatus = 'live' | 'ready' | 'planned'

export type IntegrationCategory = 'inventory' | 'payment' | 'ai'

export interface IntegrationEntry {
  key: string
  label: string
  category: IntegrationCategory
  status: IntegrationStatus
  envVars: string[]
  notes: string
}

export const integrationRegistry: IntegrationEntry[] = [
  {
    key: 'stays',
    label: 'Stays API',
    category: 'inventory',
    status: 'live',
    envVars: ['STAYS_API_URL', 'STAYS_CLIENT_ID', 'STAYS_CLIENT_SECRET'],
    notes: 'Inventário Reserva Direta Bomgo (somente leitura): disponibilidade, filtros, preços e conteúdo.',
  },
  {
    key: 'cielo',
    label: 'Cielo',
    category: 'payment',
    status: 'live',
    envVars: ['CIELO_MERCHANT_ID', 'CIELO_MERCHANT_KEY', 'CIELO_ENV'],
    notes: 'Pagamentos por cartão e Pix (sandbox por padrão).',
  },
  {
    key: 'sofia-ai',
    label: 'OpenAI (Sofia)',
    category: 'ai',
    status: 'live',
    envVars: ['AI_GATEWAY_API_KEY', 'SOFIA_MODEL'],
    notes: 'Concierge inteligente via Vercel AI Gateway.',
  },
  {
    key: 'apple-pay',
    label: 'Apple Pay',
    category: 'payment',
    status: 'ready',
    envVars: ['APPLE_PAY_MERCHANT_ID'],
    notes: 'Carteira digital via Cielo — botão condicional ao domínio verificado.',
  },
  {
    key: 'google-pay',
    label: 'Google Pay',
    category: 'payment',
    status: 'ready',
    envVars: ['GOOGLE_PAY_MERCHANT_ID'],
    notes: 'Carteira digital via Cielo — token processado no mesmo fluxo de cartão.',
  },
  {
    key: 'booking',
    label: 'Booking Connectivity',
    category: 'inventory',
    status: 'ready',
    envVars: ['BOOKING_API_KEY'],
    notes: 'Fonte "booking" já modelada em SourceType e no merge de resultados.',
  },
  {
    key: 'expedia',
    label: 'Expedia',
    category: 'inventory',
    status: 'ready',
    envVars: ['EXPEDIA_API_KEY'],
    notes: 'Fonte "expedia" já modelada em SourceType e no merge de resultados.',
  },
  {
    key: 'airbnb',
    label: 'Airbnb',
    category: 'inventory',
    status: 'planned',
    envVars: ['AIRBNB_API_KEY'],
    notes: 'Reservado para agregação futura de inventário.',
  },
  {
    key: 'decolar',
    label: 'Decolar',
    category: 'inventory',
    status: 'planned',
    envVars: ['DECOLAR_API_KEY'],
    notes: 'Reservado para agregação futura de inventário.',
  },
]
