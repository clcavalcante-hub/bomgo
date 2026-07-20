'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarDays, MapPin, Minus, Plus, Search, Users, X } from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { CalendarRange } from '@/components/search/calendar-range'
import { serializeCriteria } from '@/lib/services/search-service'
import { formatLocalDateLabel } from '@/lib/dates'
import { resolveDestinationInput, searchDestinations } from '@/lib/data/destination-taxonomy'
import type { SearchCriteria } from '@/lib/types'
import { cn } from '@/lib/utils'

const suggestions = ['Porto das Dunas, Aquiraz', 'Fortaleza', 'Beach Park', 'Jericoacoara · CE']

function Stepper({
  value,
  min = 0,
  max = 30,
  onChange,
  label,
}: {
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`Diminuir ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-5 text-center text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}

type Panel = 'destino' | 'datas' | 'hospedes' | null

/**
 * Homepage hero search bar.
 *
 * Self-contained: each segment opens a small dropdown anchored right below
 * it (not the big full-screen SearchModal) — picking a date range auto-
 * advances the open dropdown to guests, mirroring a compact step-by-step
 * flow (destino → datas → hóspedes) instead of one long scrolling sheet.
 */
export function HeroSearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const { criteria, setCriteria } = useApp()
  const [draft, setDraft] = useState<SearchCriteria>(criteria)
  const [destinationText, setDestinationText] = useState(criteria.destination?.label ?? '')
  const [panel, setPanel] = useState<Panel>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!panel) return
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setPanel(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPanel(null)
    }
    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('keydown', onKey)
    }
  }, [panel])

  function updateChildren(count: number) {
    setDraft((d) => {
      const ages = [...d.childrenAges]
      while (ages.length < count) ages.push(6)
      ages.length = count
      return { ...d, children: count, childrenAges: ages }
    })
  }

  function submit() {
    const resolved = resolveDestinationInput(destinationText.trim() || null)
    const finalCriteria = { ...draft, destination: resolved }
    setCriteria(finalCriteria)
    setPanel(null)
    router.push(`/busca?${serializeCriteria(finalCriteria)}`)
  }

  const guests = draft.adults + draft.children
  const ci = formatLocalDateLabel(draft.checkIn)
  const co = formatLocalDateLabel(draft.checkOut)
  const datesLabel = ci && co ? `${ci} – ${co}` : 'Quando?'
  const destinationLabel = destinationText || 'Para onde você quer ir?'

  const segmentBase =
    'flex min-w-0 flex-1 flex-col items-start gap-0.5 px-5 py-3 text-left transition-colors hover:bg-secondary/60'

  const destinoDropdown = (
    <div className="max-h-80 overflow-y-auto p-3">
      <div className="flex items-center gap-2 rounded-md border border-border bg-cta/10 px-3 py-2.5">
        <MapPin className="size-4 shrink-0 text-primary" />
        <input
          autoFocus
          value={destinationText}
          onChange={(e) => setDestinationText(e.target.value)}
          placeholder="Para onde você quer viajar?"
          type="text"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          name="destino-busca"
          className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        {destinationText && (
          <button
            type="button"
            aria-label="Limpar"
            onClick={() => {
              setDestinationText('')
              setDraft((d) => ({ ...d, destination: null }))
            }}
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {(destinationText.trim()
          ? searchDestinations(destinationText)
          : suggestions.map((s) => ({ id: s, label: s }))
        ).map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setDestinationText(d.label)
              setDraft((draft) => ({ ...draft, destination: resolveDestinationInput(d.label) }))
              setPanel('datas')
            }}
            className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-foreground hover:bg-secondary"
          >
            <MapPin className="size-4 shrink-0 text-primary" />
            {d.label}
          </button>
        ))}
      </div>
    </div>
  )

  const datasDropdown = (
    <div className="p-3">
      <CalendarRange
        checkIn={draft.checkIn}
        checkOut={draft.checkOut}
        onChange={(newCi, newCo) => {
          setDraft((d) => ({ ...d, checkIn: newCi, checkOut: newCo }))
          if (newCi && newCo) setPanel('hospedes')
        }}
      />
    </div>
  )

  const hospedesDropdown = (
    <div className="p-4">
      <button
        type="button"
        onClick={() => setPanel('datas')}
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> {datesLabel}
      </button>
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Adultos</p>
          <p className="text-xs leading-relaxed text-muted-foreground">13 anos ou mais</p>
        </div>
        <Stepper label="adultos" min={1} value={draft.adults} onChange={(v) => setDraft((d) => ({ ...d, adults: v }))} />
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Crianças</p>
          <p className="text-xs leading-relaxed text-muted-foreground">0 a 12 anos</p>
        </div>
        <Stepper label="crianças" value={draft.children} onChange={updateChildren} />
      </div>
      <button
        type="button"
        onClick={submit}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-semibold text-cta-foreground"
      >
        <Search className="size-4" /> Buscar
      </button>
    </div>
  )

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative overflow-visible rounded-md bg-background/95 shadow-xl shadow-primary/10 ring-1 ring-black/5 backdrop-blur',
        className,
      )}
    >
      {/* Desktop / tablet: single row, three segments + CTA */}
      <div className="hidden items-stretch divide-x divide-border sm:flex">
        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setPanel(panel === 'destino' ? null : 'destino')}
            className={cn(segmentBase, 'w-full rounded-l-md')}
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              Destino
            </span>
            <span className="truncate text-sm font-medium text-foreground md:text-base">{destinationLabel}</span>
          </button>
          {panel === 'destino' && (
            <div className="absolute left-0 top-full z-20 mt-2 w-96 rounded-md border border-border bg-background shadow-2xl">
              {destinoDropdown}
            </div>
          )}
        </div>

        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setPanel(panel === 'datas' ? null : 'datas')}
            className={cn(segmentBase, 'w-full')}
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="size-3.5 text-primary" />
              Datas
            </span>
            <span className="truncate text-sm font-medium text-foreground md:text-base">{datesLabel}</span>
          </button>
          {panel === 'datas' && (
            <div className="absolute left-1/2 top-full z-20 mt-2 w-[340px] -translate-x-1/2 rounded-md border border-border bg-background shadow-2xl">
              {datasDropdown}
            </div>
          )}
        </div>

        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setPanel(panel === 'hospedes' ? null : 'hospedes')}
            className={cn(segmentBase, 'w-full')}
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Users className="size-3.5 text-primary" />
              Hóspedes
            </span>
            <span className="truncate text-sm font-medium text-foreground md:text-base">
              {guests > 0 ? `${guests} ${guests === 1 ? 'hóspede' : 'hóspedes'}` : 'Quantos?'}
            </span>
          </button>
          {panel === 'hospedes' && (
            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-md border border-border bg-background shadow-2xl">
              {hospedesDropdown}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          className="flex shrink-0 items-center gap-2 rounded-r-md bg-cta px-7 text-sm font-semibold text-cta-foreground transition-transform hover:brightness-105 active:scale-[0.98]"
        >
          <Search className="size-4" />
          Buscar
        </button>
      </div>

      {/* Mobile: stacked, thumb-friendly, same inline dropdowns */}
      <div className="flex flex-col divide-y divide-border sm:hidden">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPanel(panel === 'destino' ? null : 'destino')}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <MapPin className="size-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{destinationLabel}</span>
          </button>
          {panel === 'destino' && (
            <div className="absolute inset-x-0 top-full z-20 rounded-b-md border border-border bg-background shadow-2xl">
              {destinoDropdown}
            </div>
          )}
        </div>
        <div className="flex divide-x divide-border">
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setPanel(panel === 'datas' ? null : 'datas')}
              className="flex w-full items-center gap-2 px-4 py-3.5 text-left"
            >
              <CalendarDays className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm text-foreground">{datesLabel}</span>
            </button>
            {panel === 'datas' && (
              <div className="absolute inset-x-0 top-full z-20 rounded-b-md border border-border bg-background shadow-2xl">
                {datasDropdown}
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setPanel(panel === 'hospedes' ? null : 'hospedes')}
              className="flex w-full items-center gap-2 px-4 py-3.5 text-left"
            >
              <Users className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm text-foreground">
                {guests > 0 ? `${guests} ${guests === 1 ? 'hóspede' : 'hóspedes'}` : 'Hóspedes'}
              </span>
            </button>
            {panel === 'hospedes' && (
              <div className="absolute inset-x-0 top-full z-20 rounded-b-md border border-border bg-background shadow-2xl">
                {hospedesDropdown}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={submit}
          className="flex items-center justify-center gap-2 bg-cta px-4 py-3.5 text-sm font-semibold text-cta-foreground"
        >
          <Search className="size-4" />
          Buscar hospedagem
        </button>
      </div>
    </div>
  )
}
