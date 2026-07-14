"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SlidersHorizontal, Sparkles, X } from "lucide-react"
import { PropertyCard } from "@/components/property/property-card"
import { SearchSummary } from "@/components/search/search-summary"
import { SearchFilters, type Filters } from "@/components/search/search-filters"
import { useApp } from "@/components/providers/app-providers"
import { parseCriteria, searchProperties, type SearchResponse } from "@/lib/services/search-service"
import type { Property } from "@/lib/types"

const DEFAULT_FILTERS: Filters = {
  maxPrice: null,
  sources: [],
  bedrooms: null,
  amenities: [],
}

function applyFilters(list: Property[], f: Filters): Property[] {
  return list.filter((p) => {
    if (f.maxPrice != null && p.nightlyPrice > f.maxPrice) return false
    if (f.sources.length) {
      const bucket = p.source === "bomgo" ? "bomgo" : "partner"
      if (!f.sources.includes(bucket)) return false
    }
    if (f.bedrooms) {
      if (f.bedrooms === 4 ? p.bedrooms < 4 : p.bedrooms !== f.bedrooms) return false
    }
    if (f.amenities.length) {
      const keys = p.amenities.map((a) => a.key)
      if (!f.amenities.every((a) => keys.includes(a))) return false
    }
    return true
  })
}

/** Derives real, present-in-results filter facets — never a hardcoded list
 * that can drift from whatever the live Stays data actually contains. */
function deriveFacets(data: SearchResponse | null) {
  const all = data ? [...data.bomgo, ...data.partners] : []
  const prices = all.map((p) => p.nightlyPrice).filter((n) => n > 0)
  const priceBounds = prices.length
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : { min: 0, max: 0 }

  const amenityMap = new Map<string, string>()
  all.forEach((p) => p.amenities.forEach((a) => amenityMap.set(a.key, a.label)))
  const amenityOptions = Array.from(amenityMap, ([key, label]) => ({ key, label })).sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR"),
  )

  const sourceOptions = Array.from(new Set(all.map((p) => (p.source === "bomgo" ? "bomgo" : "partner"))))

  return { priceBounds, amenityOptions, sourceOptions }
}

export function SearchResults() {
  const params = useSearchParams()
  const { setCriteria } = useApp()
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [retryToken, setRetryToken] = useState(0)

  const criteria = useMemo(() => parseCriteria(params), [params])

  useEffect(() => {
    setCriteria(criteria)
    let active = true
    setLoading(true)
    setError(null)
    searchProperties(criteria)
      .then((res) => {
        if (!active) return
        setData(res)
      })
      .catch((err: unknown) => {
        if (!active) return
        setData(null)
        setError(err instanceof Error ? err.message : "Falha ao buscar acomodações")
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, retryToken])

  const filteredBomgo = useMemo(() => (data ? applyFilters(data.bomgo, filters) : []), [data, filters])
  const filteredPartners = useMemo(() => (data ? applyFilters(data.partners, filters) : []), [data, filters])
  const total = filteredBomgo.length + filteredPartners.length
  const facets = useMemo(() => deriveFacets(data), [data])

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-6 md:pt-28">
      <div className="sticky top-16 z-30 -mx-4 bg-background/90 px-4 py-3 backdrop-blur md:top-20 md:mx-0 md:px-0">
        <SearchSummary criteria={criteria} />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground md:text-3xl">
            {criteria.destination?.label || "Todas as hospedagens"}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {loading
                ? "A Sofia está buscando as melhores opções…"
                : error
                  ? "Não foi possível concluir a busca"
                  : `${total} hospedagens encontradas`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground lg:hidden"
        >
          <SlidersHorizontal className="size-4" /> Filtros
        </button>
      </div>

      <div className="mt-6 flex gap-8">
        {/* Desktop filters */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-40 rounded-3xl border border-border bg-card p-6">
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              priceBounds={facets.priceBounds}
              sourceOptions={facets.sourceOptions}
              amenityOptions={facets.amenityOptions}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] rounded-3xl bg-muted" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
                  <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-dashed border-destructive/40 bg-card p-10 text-center">
              <p className="font-serif text-xl text-foreground">Não foi possível buscar agora</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={() => setRetryToken((n) => n + 1)}
                className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Tentar de novo
              </button>
            </div>
          ) : total === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <p className="font-serif text-xl text-foreground">Nenhuma hospedagem com esses filtros</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tente ampliar o preço ou remover algumas comodidades.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredBomgo.length > 0 && (
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="size-4 text-cta" />
                    <h2 className="font-serif text-lg font-medium text-foreground">Reserva Direta Bomgo</h2>
                    <span className="text-sm text-muted-foreground">· melhor preço e reserva imediata</span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {filteredBomgo.map((p, i) => (
                      <PropertyCard key={p.id} property={p} priority={i === 0} />
                    ))}
                  </div>
                </section>
              )}

              {filteredPartners.length > 0 && (
                <section>
                  <h2 className="mb-4 font-serif text-lg font-medium text-foreground">Parceiros oficiais</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {filteredPartners.map((p) => (
                      <PropertyCard key={p.id} property={p} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-xl font-medium text-foreground">Filtros</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Fechar filtros"
                className="flex size-9 items-center justify-center rounded-full text-foreground hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>
            <SearchFilters
              filters={filters}
              onChange={setFilters}
              priceBounds={facets.priceBounds}
              sourceOptions={facets.sourceOptions}
              amenityOptions={facets.amenityOptions}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-full bg-cta px-6 py-3.5 text-base font-semibold text-cta-foreground"
            >
              Ver {total} hospedagens
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
