import type { BadgeKey, SourceType } from '@/lib/types'

export const badgeConfig: Record<
  BadgeKey,
  { label: string; tone: 'brand' | 'gold' | 'cta' | 'neutral' | 'success' }
> = {
  'reserva-direta': { label: 'Reserva Direta Bomgo', tone: 'brand' },
  'parceiro-oficial': { label: 'Parceiro Oficial', tone: 'neutral' },
  'clube-bomgo': { label: 'Preço Clube Bomgo', tone: 'gold' },
  'mais-reservado': { label: 'Mais reservado', tone: 'cta' },
  'ultimos-quartos': { label: 'Últimas unidades', tone: 'cta' },
  'oferta-sofia': { label: 'Oferta inteligente Sofia', tone: 'brand' },
}

export const sourceConfig: Record<
  SourceType,
  { label: string; priority: number }
> = {
  bomgo: { label: 'Reserva Direta Bomgo', priority: 1 },
  partner: { label: 'Parceiro oficial', priority: 2 },
  booking: { label: 'Parceiro Booking', priority: 3 },
  expedia: { label: 'Parceiro Expedia', priority: 4 },
}

export const amenityIconKeys: Record<string, string> = {
  wifi: 'wifi',
  ac: 'snowflake',
  pool: 'waves',
  sea: 'sailboat',
  kitchen: 'utensils-crossed',
  parking: 'car',
  laundry: 'washing-machine',
  bbq: 'flame',
  jacuzzi: 'bath',
}
