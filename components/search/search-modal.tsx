'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BedDouble,
  CalendarDays,
  MapPin,
  Minus,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { CalendarRange } from '@/components/search/calendar-range'
import { serializeCriteria } from '@/lib/services/search-service'
import { formatLocalDateLabel } from '@/lib/dates'
import type { SearchCriteria } from '@/lib/types'
import { cn } from '@/lib/utils'

const suggestions = [
  'Porto das Dunas, Aquiraz',
  'Fortaleza',
  'Meireles, Fortaleza',
  'Beira-Mar, Fortaleza',
  'Beach Park',
  'Maragogi · AL',
  'Jericoacoara · CE',
]

function formatDateLabel(iso: string | null): string {
  return formatLocalDateLabel(iso) ?? '—'
}

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
        className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-6 text-center text-base font-semibold tabular-nums text-foreground">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

export function SearchModal() {
  const router = useRouter()
  const { isSearchOpen, closeSearch, criteria, setCriteria } = useApp()
  const [draft, setDraft] = useState<SearchCriteria>(criteria)

  useEffect(() => {
    if (isSearchOpen) setDraft(criteria)
  }, [isSearchOpen, criteria])

  useEffect(() => {
    if (!isSearchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isSearchOpen, closeSearch])

  if (!isSearchOpen) return null

  function updateChildren(count: number) {
    setDraft((d) => {
      const ages = [...d.childrenAges]
      while (ages.length < count) ages.push(6)
      ages.length = count
      return { ...d, children: count, childrenAges: ages }
    })
  }

  function submit() {
    setCriteria(draft)
    closeSearch()
    router.push(`/busca?${serializeCriteria(draft)}`)
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Buscar hospedagens">
      <div
        className="absolute inset-0 bg-primary/45 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl',
          'animate-in slide-in-from-bottom duration-300',
          'md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[88vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:fade-in md:zoom-in-95',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-7">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Encontre sua hospedagem
            </h2>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-cta" />
              A Sofia vai encontrar a melhor opção para você
            </p>
          </div>
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Fechar"
            className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-5 md:px-7">
          {/* Destination */}
          <label className="mb-2 block text-sm font-medium text-foreground">
            Destino
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/50 px-4 py-3">
            <MapPin className="size-5 shrink-0 text-primary" />
            <input
              value={draft.destination}
              onChange={(e) =>
                setDraft((d) => ({ ...d, destination: e.target.value }))
              }
              placeholder="Para onde você quer viajar?"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, destination: s }))}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Dates */}
          <div className="mt-6 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays className="size-4 text-primary" /> Datas
            </label>
            <span className="text-xs text-muted-foreground">
              {formatDateLabel(draft.checkIn)} → {formatDateLabel(draft.checkOut)}
            </span>
          </div>
          <div className="mt-3 rounded-2xl border border-border p-4">
            <CalendarRange
              checkIn={draft.checkIn}
              checkOut={draft.checkOut}
              onChange={(ci, co) =>
                setDraft((d) => ({ ...d, checkIn: ci, checkOut: co }))
              }
            />
          </div>

          {/* Guests */}
          <div className="mt-6 space-y-1">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Adultos</p>
                  <p className="text-xs text-muted-foreground">13 anos ou mais</p>
                </div>
              </div>
              <Stepper
                label="adultos"
                min={1}
                value={draft.adults}
                onChange={(v) => setDraft((d) => ({ ...d, adults: v }))}
              />
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Crianças</p>
                  <p className="text-xs text-muted-foreground">0 a 12 anos</p>
                </div>
              </div>
              <Stepper
                label="crianças"
                value={draft.children}
                onChange={updateChildren}
              />
            </div>

            {draft.children > 0 && (
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-secondary/50 p-4 sm:grid-cols-3">
                {draft.childrenAges.map((age, i) => (
                  <label key={i} className="text-xs text-foreground">
                    <span className="mb-1 block text-muted-foreground">
                      Criança {i + 1}
                    </span>
                    <select
                      value={age}
                      onChange={(e) =>
                        setDraft((d) => {
                          const ages = [...d.childrenAges]
                          ages[i] = Number(e.target.value)
                          return { ...d, childrenAges: ages }
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none focus:border-primary"
                    >
                      {Array.from({ length: 13 }).map((_, n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'ano' : 'anos'}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}

            <div className="h-px bg-border" />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <BedDouble className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Quartos</p>
                  <p className="text-xs text-muted-foreground">Unidades desejadas</p>
                </div>
              </div>
              <Stepper
                label="quartos"
                min={1}
                value={draft.rooms}
                onChange={(v) => setDraft((d) => ({ ...d, rooms: v }))}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-4 md:px-7">
          <button
            type="button"
            onClick={submit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-base font-semibold text-cta-foreground shadow-lg shadow-cta/25 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <Search className="size-5" />
            Encontrar hospedagens
          </button>
        </div>
      </div>
    </div>
  )
}
