"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, ChevronDown, ShieldCheck, Sparkles, Users } from "lucide-react"
import { CalendarRange } from "@/components/search/calendar-range"
import { useApp } from "@/components/providers/app-providers"
import { computePrice, formatBRL, nightsBetween } from "@/lib/pricing"
import { serializeCriteria } from "@/lib/services/search-service"
import { formatLocalDateLabel } from "@/lib/dates"
import type { Property } from "@/lib/types"

export function BookingWidget({ property }: { property: Property }) {
  const router = useRouter()
  const { criteria, setCriteria } = useApp()
  const [checkIn, setCheckIn] = useState(criteria.checkIn)
  const [checkOut, setCheckOut] = useState(criteria.checkOut)
  const [showCalendar, setShowCalendar] = useState(false)
  const [guests, setGuests] = useState(
    Math.min((criteria.adults + criteria.children) || 2, property.maxGuests),
  )

  const nights = nightsBetween(checkIn, checkOut)
  const price = useMemo(() => computePrice(property, nights), [property, nights])
  const isBomgo = property.source === "bomgo"

  function reserve() {
    if (nights === 0) return
    // Preserve the guest composition (children/ages) from the original search
    // instead of discarding it. Only re-derive it if the guest count picked
    // here actually differs from the original search total.
    const originalTotal = criteria.adults + criteria.children
    let adults = criteria.adults
    let children = criteria.children
    let childrenAges = criteria.childrenAges
    if (guests !== originalTotal) {
      children = Math.min(children, Math.max(0, guests - 1))
      adults = guests - children
      childrenAges = childrenAges.slice(0, children)
    }
    const next = { ...criteria, checkIn, checkOut, adults, children, childrenAges }
    setCriteria(next)
    router.push(`/checkout/${property.slug}?${serializeCriteria(next)}`)
  }

  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-lg shadow-primary/5">
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-foreground">
          {formatBRL(property.nightlyPrice)}
          <span className="text-sm font-normal text-muted-foreground"> /noite</span>
        </p>
        {property.rating > 0 && property.reviewsCount > 0 && (
          <span className="inline-flex items-center gap-1 text-sm text-foreground">
            <Sparkles className="size-4 text-gold" />
            {property.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-border">
        <button
          type="button"
          onClick={() => setShowCalendar((s) => !s)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <span className="text-sm text-foreground">
              {checkIn && checkOut
                ? `${formatLocalDateLabel(checkIn)} – ${formatLocalDateLabel(checkOut)}`
                : "Selecione as datas"}
            </span>
          </span>
          <ChevronDown className={`size-4 text-muted-foreground transition-transform ${showCalendar ? "rotate-180" : ""}`} />
        </button>
        {showCalendar && (
          <div className="border-t border-border p-4">
            <CalendarRange
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(ci, co) => {
                setCheckIn(ci)
                setCheckOut(co)
                if (ci && co) setShowCalendar(false)
              }}
            />
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-foreground">
            <Users className="size-4 text-primary" /> Hóspedes
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            aria-label="Número de hóspedes"
          >
            {Array.from({ length: property.maxGuests }).map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} {i === 0 ? "hóspede" : "hóspedes"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {nights > 0 && (
        <div className="mt-4 space-y-2 text-sm">
          <Row label={`${formatBRL(property.nightlyPrice)} × ${price.nights} noites`} value={formatBRL(price.subtotal)} />
          {price.cleaningFee > 0 && <Row label="Taxa de limpeza" value={formatBRL(price.cleaningFee)} />}
          {price.energyFee > 0 && <Row label="Taxa de energia" value={formatBRL(price.energyFee)} />}
          <Row label="Taxa de serviço Bomgo" value={formatBRL(price.serviceFee)} />
          <div className="my-2 h-px bg-border" />
          <Row label="Total" value={formatBRL(price.total)} bold />
        </div>
      )}

      <button
        type="button"
        onClick={reserve}
        disabled={nights === 0}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-base font-semibold text-cta-foreground shadow-lg shadow-cta/25 transition-transform enabled:hover:scale-[1.01] disabled:opacity-50"
      >
        {isBomgo ? "Reservar agora" : "Continuar reserva"}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-success" />
        {nights === 0 ? "Selecione as datas para ver o total" : "Você ainda não será cobrado"}
      </p>

      {isBomgo && (
        <p className="mt-3 rounded-md bg-secondary/60 px-4 py-3 text-center text-xs text-muted-foreground">
          Reserva Direta Bomgo · confirmação imediata e pagamento em Pix ou cartão em até 12x
        </p>
      )}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-semibold text-foreground" : "text-foreground"}>{value}</span>
    </div>
  )
}
