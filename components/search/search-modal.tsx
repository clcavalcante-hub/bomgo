'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
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
import { resolveDestinationInput, searchDestinations } from '@/lib/data/destination-taxonomy'
import type { SearchCriteria } from '@/lib/types'
import { cn } from '@/lib/utils'

const suggestions = [
  'Porto das Dunas, Aquiraz',
  'Fortaleza',
  'Beach Park',
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
  const [destinationText, setDestinationText] = useState(criteria.destination?.label ?? '')
  // 'dates' → 'guests' once a full range is picked, mirroring a step-by-step
  // booking flow instead of showing everything at once. "← Voltar" returns.
  const [step, setStep] = useState<'dates' | 'guests'>('dates')

  useEffect(() => {
    if (isSearchOpen) {
      setDraft(criteria)
      setDestinationText(criteria.destination?.label ?? '')
      setStep('dates')
    }
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
    const resolved = resolveDestinationInput(destinationText.trim() || null)
    const finalCriteria = { ...draft, destination: resolved }
    setCriteria(finalCriteria)
    closeSearch()
    router.push(`/busca?${serializeCriteria(finalCriteria)}`)
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
          'md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[88vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md md:fade-in md:zoom-in-95',
        )}
      >
        <div className="flex items-center justify-between border-b border-border pl-7 pr-5 py-3 md:pl-9 md:pr-7">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
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

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4 md:px-7">
          {/* Destination */}
          <label className="mb-2 block text-sm font-medium text-foreground">
            Destino
          </label>
          <div className="flex items-center gap-3 rounded-md border border-border bg-primary/8 px-4 py-3">
            <MapPin className="size-5 shrink-0 text-primary" />
            <input
              value={destinationText}
              onChange={(e) => setDestinationText(e.target.value)}
              placeholder="Para onde você quer viajar?"
              className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            {destinationText && (
              <button
                type="button"
                aria-label="Limpar destino"
                onClick={() => {
                  setDestinationText('')
                  setDraft((d) => ({ ...d, destination: null }))
                }}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          {destinationText.trim() ? (
            <div className="mt-2 overflow-hidden rounded-md border border-border">
              {searchDestinations(destinationText).length > 0 ? (
                searchDestinations(destinationText).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDestinationText(d.label)
                      setDraft((draft) => ({ ...draft, destination: resolveDestinationInput(d.label) }))
                    }}
                    className="flex w-full items-center gap-2.5 border-b border-border bg-background px-4 py-3 text-left text-sm text-foreground last:border-b-0 hover:bg-secondary"
                  >
                    <MapPin className="size-4 shrink-0 text-primary" />
                    {d.label}
                  </button>
                ))
              ) : (
                <p className="bg-background px-4 py-3 text-sm text-muted-foreground">
                  Nenhum destino conhecido — a Sofia ainda vai tentar buscar por "{destinationText.trim()}".
                </p>
              )}
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s) => {
                const selected = destinationText.trim().toLowerCase() === s.toLowerCase()
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setDestinationText(s)
                      setDraft((d) => ({ ...d, destination: resolveDestinationInput(s) }))
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground font-medium'
                        : 'border-border bg-background text-foreground/80 hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 1: Dates */}
          {step === 'dates' && (
            <>
              <div className="mt-5 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarDays className="size-4 text-primary" /> Datas
                </label>
                <span className="text-xs text-muted-foreground">
                  {formatDateLabel(draft.checkIn)} → {formatDateLabel(draft.checkOut)}
                </span>
              </div>
              <div className="mt-2 rounded-md border border-border bg-cta/15 p-3">
                <CalendarRange
                  checkIn={draft.checkIn}
                  checkOut={draft.checkOut}
                  onChange={(ci, co) => {
                    setDraft((d) => ({ ...d, checkIn: ci, checkOut: co }))
                    // Both ends picked → advance automatically, step-by-step.
                    if (ci && co) setStep('guests')
                  }}
                />
              </div>
              {draft.checkIn && draft.checkOut && (
                <button
                  type="button"
                  onClick={() => setStep('guests')}
                  className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  Continuar para hóspedes →
                </button>
              )}
            </>
          )}

          {/* Step 2: Guests — replaces the dates section, with a way back */}
          {step === 'guests' && (
            <>
              <button
                type="button"
                onClick={() => setStep('dates')}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
              >
                <ArrowLeft className="size-4" />
                {formatDateLabel(draft.checkIn)} → {formatDateLabel(draft.checkOut)}
              </button>

              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between py-2.5">
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
                <div className="flex items-center justify-between py-2.5">
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
                  <div className="grid grid-cols-2 gap-3 rounded-md bg-secondary/50 p-4 sm:grid-cols-3">
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
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Você pode refinar por número de quartos depois, nos filtros dos resultados.
              </p>
            </>
          )}
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
