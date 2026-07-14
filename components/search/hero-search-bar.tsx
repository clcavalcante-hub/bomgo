'use client'

import { CalendarDays, MapPin, Search, Users } from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { formatLocalDateLabel } from '@/lib/dates'
import { cn } from '@/lib/utils'

/**
 * Homepage hero search trigger.
 *
 * Replaces the old single "Google-style" pill with three clearly labeled
 * segments (Destino / Datas / Hóspedes), matching the legibility of
 * Booking.com and Expedia while keeping Bomgo's rounded, editorial look.
 * All segments open the same SearchModal — this is a presentational
 * change only, no new state or routing logic.
 */
export function HeroSearchBar({ className }: { className?: string }) {
  const { openSearch, criteria } = useApp()

  const guests = criteria.adults + criteria.children
  const ci = formatLocalDateLabel(criteria.checkIn)
  const co = formatLocalDateLabel(criteria.checkOut)
  const datesLabel = ci && co ? `${ci} – ${co}` : 'Quando?'
  const destinationLabel = criteria.destination?.label || 'Para onde você quer ir?'

  const segmentBase =
    'flex min-w-0 flex-1 flex-col items-start gap-0.5 px-5 py-3 text-left transition-colors hover:bg-secondary/60'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-background/95 shadow-xl shadow-primary/10 ring-1 ring-black/5 backdrop-blur',
        className,
      )}
    >
      {/* Desktop / tablet: single row, three segments + CTA */}
      <div className="hidden items-stretch divide-x divide-border sm:flex">
        <button type="button" onClick={openSearch} className={cn(segmentBase, 'rounded-l-2xl')}>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <MapPin className="size-3.5 text-primary" />
            Destino
          </span>
          <span className="truncate text-sm font-medium text-foreground md:text-base">
            {destinationLabel}
          </span>
        </button>

        <button type="button" onClick={openSearch} className={segmentBase}>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="size-3.5 text-primary" />
            Datas
          </span>
          <span className="truncate text-sm font-medium text-foreground md:text-base">
            {datesLabel}
          </span>
        </button>

        <button type="button" onClick={openSearch} className={segmentBase}>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <Users className="size-3.5 text-primary" />
            Hóspedes
          </span>
          <span className="truncate text-sm font-medium text-foreground md:text-base">
            {guests > 0 ? `${guests} ${guests === 1 ? 'hóspede' : 'hóspedes'}` : 'Quantos?'}
          </span>
        </button>

        <button
          type="button"
          onClick={openSearch}
          className="flex shrink-0 items-center gap-2 bg-cta px-7 text-sm font-semibold text-cta-foreground transition-transform hover:brightness-105 active:scale-[0.98]"
        >
          <Search className="size-4" />
          Buscar
        </button>
      </div>

      {/* Mobile: stacked, thumb-friendly */}
      <div className="flex flex-col divide-y divide-border sm:hidden">
        <button type="button" onClick={openSearch} className="flex items-center gap-3 px-4 py-3.5 text-left">
          <MapPin className="size-5 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">{destinationLabel}</span>
        </button>
        <div className="flex divide-x divide-border">
          <button type="button" onClick={openSearch} className="flex flex-1 items-center gap-2 px-4 py-3.5 text-left">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <span className="truncate text-sm text-foreground">{datesLabel}</span>
          </button>
          <button type="button" onClick={openSearch} className="flex flex-1 items-center gap-2 px-4 py-3.5 text-left">
            <Users className="size-4 shrink-0 text-primary" />
            <span className="truncate text-sm text-foreground">
              {guests > 0 ? `${guests} ${guests === 1 ? 'hóspede' : 'hóspedes'}` : 'Hóspedes'}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={openSearch}
          className="flex items-center justify-center gap-2 bg-cta px-4 py-3.5 text-sm font-semibold text-cta-foreground"
        >
          <Search className="size-4" />
          Buscar hospedagem
        </button>
      </div>
    </div>
  )
}
