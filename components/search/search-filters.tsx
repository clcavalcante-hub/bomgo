"use client"

import { formatBRL } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export interface Filters {
  maxPrice: number
  sources: string[]
  bedrooms: number | null
  amenities: string[]
}

const SOURCE_OPTIONS = [
  { key: "bomgo", label: "Reserva Direta Bomgo" },
  { key: "partner", label: "Parceiros oficiais" },
]

const AMENITY_OPTIONS = [
  { key: "sea", label: "Frente mar" },
  { key: "pool", label: "Piscina" },
  { key: "jacuzzi", label: "Jacuzzi" },
  { key: "bbq", label: "Churrasqueira" },
]

const BEDROOM_OPTIONS = [1, 2, 3, 4]

export function SearchFilters({
  filters,
  onChange,
  maxAvailable,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  maxAvailable: number
}) {
  function toggleArray(key: keyof Pick<Filters, "sources" | "amenities">, value: string) {
    const list = filters[key]
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    onChange({ ...filters, [key]: next })
  }

  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Preço por noite</h3>
        <input
          type="range"
          min={300}
          max={maxAvailable}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="mt-4 w-full accent-primary"
          aria-label="Preço máximo por noite"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Até</span>
          <span className="font-medium text-foreground">{formatBRL(filters.maxPrice)}</span>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <h3 className="text-sm font-semibold text-foreground">Origem da reserva</h3>
        <div className="mt-3 space-y-2">
          {SOURCE_OPTIONS.map((opt) => (
            <Check
              key={opt.key}
              label={opt.label}
              checked={filters.sources.includes(opt.key)}
              onClick={() => toggleArray("sources", opt.key)}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <h3 className="text-sm font-semibold text-foreground">Quartos</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...filters, bedrooms: filters.bedrooms === n ? null : n })}
              className={cn(
                "flex size-10 items-center justify-center rounded-full border text-sm font-medium transition",
                filters.bedrooms === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              {n}
              {n === 4 ? "+" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <h3 className="text-sm font-semibold text-foreground">Comodidades</h3>
        <div className="mt-3 space-y-2">
          {AMENITY_OPTIONS.map((opt) => (
            <Check
              key={opt.key}
              label={opt.label}
              checked={filters.amenities.includes(opt.key)}
              onClick={() => toggleArray("amenities", opt.key)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Check({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="flex w-full items-center gap-3 text-left"
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-md border transition",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2.5 6.5 5 9l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </button>
  )
}
