"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, ChevronDown, ShieldCheck, Sparkles, Users } from "lucide-react"
import { CalendarRange } from "@/components/search/calendar-range"
import { useApp } from "@/components/providers/app-providers"
import { computePrice, formatBRL, nightsBetween } from "@/lib/pricing"
import { serializeCriteria } from "@/lib/services/search-service"
import { formatLocalDate, formatLocalDateLabel } from "@/lib/dates"
import type { PriceBreakdown, Property } from "@/lib/types"

// Standardized markup Bomgo applies per distribution channel (confirmed by
// the owner from their own Stays channel pricing config — not scraped, not
// guessed). Used only to ESTIMATE what each OTA would charge on top of the
// real direct total; never presented as a live competitor price.
const OTA_MARKUPS = [
  { name: "Airbnb", markup: 0.3 },
  { name: "Booking.com", markup: 0.18 },
  { name: "Decolar", markup: 0.3 },
]

export function BookingWidget({ property }: { property: Property }) {
  const router = useRouter()
  const { criteria, setCriteria } = useApp()
  const [checkIn, setCheckIn] = useState(criteria.checkIn)
  const [checkOut, setCheckOut] = useState(criteria.checkOut)
  const [showCalendar, setShowCalendar] = useState(false)
  const [guests, setGuests] = useState(
    Math.min((criteria.adults + criteria.children) || 2, property.maxGuests),
  )
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())

  // Real availability — fetched once the calendar actually opens, covering
  // the next 12 months, so booked dates show disabled instead of every
  // future date looking selectable regardless of real reservations.
  useEffect(() => {
    if (!showCalendar) return
    const from = formatLocalDate(new Date())
    const toDate = new Date()
    toDate.setMonth(toDate.getMonth() + 12)
    const to = formatLocalDate(toDate)

    let cancelled = false
    fetch(`/api/stays/calendar?listingId=${encodeURIComponent(property.id)}&from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data?.blockedDates)) {
          setBlockedDates(new Set<string>(data.blockedDates))
        }
      })
      .catch(() => {
        // Network hiccup — leave blockedDates empty rather than blocking the
        // whole widget; checkout still re-validates real availability.
      })
    return () => {
      cancelled = true
    }
  }, [showCalendar, property.id])

  const nights = nightsBetween(checkIn, checkOut)

  // Real per-date quote from Stays — the property's flat nightlyPrice/fees
  // are only a starting-price estimate shown before dates are picked; once
  // real dates exist, this replaces that estimate so the number here always
  // matches what checkout will actually charge.
  const [livePrice, setLivePrice] = useState<PriceBreakdown | null>(null)
  const [priceStatus, setPriceStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")

  useEffect(() => {
    if (!checkIn || !checkOut || nights === 0) {
      setLivePrice(null)
      setPriceStatus("idle")
      return
    }
    let cancelled = false
    setPriceStatus("loading")
    fetch("/api/stays/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingIds: [property.id], from: checkIn, to: checkOut, guests }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        const live = body?.live ? body.prices?.[0] : null
        if (live && typeof live.total === "number") {
          const fees: { label: string; value: number }[] = Array.isArray(live.fees) ? live.fees : []
          const feesTotal = fees.reduce((sum: number, f) => sum + f.value, 0)
          const subtotal = live.total - feesTotal
          setLivePrice({
            nights,
            nightlyPrice: nights > 0 ? Math.round(subtotal / nights) : subtotal,
            subtotal,
            cleaningFee: fees.find((f) => /limpeza/i.test(f.label))?.value ?? 0,
            energyFee: fees.find((f) => /energia|eletricidade/i.test(f.label))?.value ?? 0,
            serviceFee: 0,
            total: live.total,
          })
          setPriceStatus("ready")
        } else {
          setPriceStatus("error")
        }
      })
      .catch(() => {
        if (!cancelled) setPriceStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [checkIn, checkOut, nights, property.id, guests])

  // Fallback estimate (property's starting nightly rate) only while no real
  // quote exists yet — never shown as the final total once dates are set.
  const estimate = useMemo(() => computePrice(property, nights), [property, nights])
  const price = livePrice ?? estimate
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
        <p className="text-2xl font-bold text-foreground">
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
              blockedDates={blockedDates}
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
          {priceStatus === "loading" ? (
            <p className="py-1 text-center text-muted-foreground">Confirmando preço com a Stays…</p>
          ) : priceStatus === "error" ? (
            <p className="py-1 text-center text-destructive">
              Não consegui confirmar o preço agora. Tente novamente.
            </p>
          ) : (
            <>
              <Row label={`${formatBRL(price.nightlyPrice)} × ${price.nights} noites`} value={formatBRL(price.subtotal)} />
              {price.cleaningFee > 0 && <Row label="Taxa de limpeza" value={formatBRL(price.cleaningFee)} />}
              {price.energyFee > 0 && <Row label="Taxa de energia" value={formatBRL(price.energyFee)} />}
              <div className="my-2 h-px bg-border" />
              <Row label="Total" value={formatBRL(price.total)} bold />
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={reserve}
        disabled={nights === 0 || priceStatus === "loading" || priceStatus === "error"}
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

      {isBomgo && priceStatus === "ready" && price.total > 0 && (
        <div className="mt-4 overflow-hidden rounded-md border border-border">
          <div className="bg-cta/10 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Você economiza reservando direto!</p>
          </div>
          <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Reserva direta Bomgo</span>
            <span className="text-sm font-bold text-foreground">{formatBRL(price.total)}</span>
          </div>
          <div className="divide-y divide-border">
            {OTA_MARKUPS.map((ota) => (
              <div key={ota.name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{ota.name}</span>
                <span className="text-muted-foreground">
                  ~{formatBRL(Math.round(price.total * (1 + ota.markup)))}
                </span>
              </div>
            ))}
          </div>
          <p className="bg-secondary/40 px-4 py-2 text-center text-[11px] text-muted-foreground">
            *Estimativa com base na taxa média que cada canal costuma adicionar — não é um preço ao vivo do
            concorrente.
          </p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-bold text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-bold text-foreground" : "text-foreground"}>{value}</span>
    </div>
  )
}
