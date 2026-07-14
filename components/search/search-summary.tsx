"use client"

import { CalendarDays, MapPin, SlidersHorizontal, Users } from "lucide-react"
import { useApp } from "@/components/providers/app-providers"
import { formatLocalDateLabel } from "@/lib/dates"
import type { SearchCriteria } from "@/lib/types"

export function SearchSummary({ criteria }: { criteria: SearchCriteria }) {
  const { openSearch } = useApp()
  const guests = criteria.adults + criteria.children
  const ci = formatLocalDateLabel(criteria.checkIn)
  const co = formatLocalDateLabel(criteria.checkOut)

  return (
    <button
      type="button"
      onClick={openSearch}
      className="flex w-full items-center gap-2 rounded-full border border-border bg-card px-2 py-2 text-left shadow-sm transition hover:shadow-md"
    >
      <span className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <MapPin className="size-4 shrink-0 text-primary" />
        <span className="truncate text-sm font-medium text-foreground">
          {criteria.destination?.label || "Qualquer destino"}
        </span>
      </span>
      <span className="hidden items-center gap-2 border-l border-border px-3 text-sm text-muted-foreground sm:flex">
        <CalendarDays className="size-4 text-primary" />
        {ci && co ? `${ci} – ${co}` : "Escolher datas"}
      </span>
      <span className="hidden items-center gap-2 border-l border-border px-3 text-sm text-muted-foreground md:flex">
        <Users className="size-4 text-primary" />
        {guests} {guests === 1 ? "hóspede" : "hóspedes"}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <SlidersHorizontal className="size-4" />
      </span>
    </button>
  )
}
