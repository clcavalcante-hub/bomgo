"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  CalendarDays,
  ChevronLeft,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react"
import { GuestForm, type GuestFormValue } from "@/components/checkout/guest-form"
import { PaymentSection } from "@/components/checkout/payment-section"
import { ConfirmationView } from "@/components/checkout/confirmation-view"
import { parseCriteria } from "@/lib/services/search-service"
import { formatBRL, nightsBetween } from "@/lib/pricing"
import {
  confirmPix,
  generateVoucherCode,
  processPayment,
  type PaymentResult,
} from "@/lib/services/payment-service"
import { saveReservation } from "@/lib/services/reservations-store"
import { formatLocalDateLabel } from "@/lib/dates"
import type { Guest, PaymentMethod, PriceBreakdown, Property } from "@/lib/types"

type Step = "details" | "payment" | "confirmed"

// Bomgo's own service fee, added on top of whatever Stays confirms for the
// stay — never baked into the (real, per-date) subtotal itself.
const SERVICE_FEE_RATE = 0.08

interface StaysFee {
  label: string
  value: number
}

/**
 * A guest must only ever be charged a total that Stays itself confirmed for
 * these exact dates/guests — never a static per-listing rate. This hook
 * calls the real `calculate-price` endpoint and exposes nothing usable until
 * it succeeds; on failure the caller must block payment rather than guess.
 */
function useLiveQuote(property: Property, criteria: ReturnType<typeof parseCriteria>, nights: number) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [quote, setQuote] = useState<{ total: number; fees: StaysFee[] } | null>(null)
  const hasValidDates = Boolean(criteria.checkIn && criteria.checkOut && nights > 0)
  const guests = criteria.adults + criteria.children

  useEffect(() => {
    if (!hasValidDates) return
    let cancelled = false
    setStatus("loading")
    fetch("/api/stays/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingIds: [property.id], from: criteria.checkIn, to: criteria.checkOut, guests }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        const live = body?.live ? body.prices?.[0] : null
        if (live && typeof live.total === "number") {
          setQuote({ total: live.total, fees: Array.isArray(live.fees) ? live.fees : [] })
          setStatus("ready")
        } else {
          setStatus("error")
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [hasValidDates, property.id, criteria.checkIn, criteria.checkOut, guests])

  const price: PriceBreakdown | null = useMemo(() => {
    if (!quote) return null
    const feesTotal = quote.fees.reduce((sum, f) => sum + f.value, 0)
    const subtotal = quote.total - feesTotal
    const serviceFee = Math.round(quote.total * SERVICE_FEE_RATE)
    return {
      nights,
      nightlyPrice: nights > 0 ? Math.round(subtotal / nights) : subtotal,
      subtotal,
      cleaningFee: 0,
      energyFee: 0,
      serviceFee,
      total: quote.total + serviceFee,
    }
  }, [quote, nights])

  return { status, fees: quote?.fees ?? [], price }
}

export function CheckoutFlow({ property }: { property: Property }) {
  const router = useRouter()
  const params = useSearchParams()
  const criteria = useMemo(() => parseCriteria(params), [params])
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut)
  const hasValidDates = Boolean(criteria.checkIn && criteria.checkOut && nights > 0)
  const { status: quoteStatus, fees, price } = useLiveQuote(property, criteria, nights)

  const [step, setStep] = useState<Step>("details")
  const [guest, setGuest] = useState<GuestFormValue | null>(null)
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [voucher, setVoucher] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("pix")

  function submitDetails(value: GuestFormValue) {
    setGuest(value)
    setStep("payment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function confirmWithVoucher() {
    if (!price) return
    const code = generateVoucherCode()
    setVoucher(code)
    saveReservation({
      code,
      propertySlug: property.slug,
      propertyName: property.name,
      propertyImage: property.images[0]?.src || "/placeholder.svg",
      location: property.location,
      checkInLabel,
      checkOutLabel,
      total: price.total,
      method,
      createdAt: new Date().toISOString(),
    })
    setStep("confirmed")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handlePay(input: Parameters<typeof processPayment>[0]) {
    const res = await processPayment(input)
    setResult(res)
    if (res.status === "approved") {
      confirmWithVoucher()
    }
    return res
  }

  async function handlePixConfirmed(transactionId: string) {
    const res = await confirmPix(transactionId)
    if (res.status === "approved") {
      confirmWithVoucher()
    }
  }

  const checkInLabel = formatLocalDateLabel(criteria.checkIn) ?? "A definir"
  const checkOutLabel = formatLocalDateLabel(criteria.checkOut) ?? "A definir"

  // Never allow a reservation/payment to proceed without a valid, complete
  // date range — Stays' calculate-price requires real from/to dates, and a
  // guest must never be shown or charged a guessed value.
  if (!hasValidDates) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-20 pt-24 text-center md:pt-28">
        <h1 className="font-serif text-2xl font-medium text-foreground">Selecione as datas da sua estadia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Para continuar com a reserva de {property.name}, escolha check-in e check-out no imóvel.
        </p>
        <Link
          href={`/imovel/${property.slug}`}
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          Voltar ao imóvel e escolher datas
        </Link>
      </div>
    )
  }

  if (step === "confirmed" && guest && price) {
    return (
      <ConfirmationView
        property={property}
        guest={guest as Guest}
        voucher={voucher}
        method={method}
        price={price}
        checkInLabel={checkInLabel}
        checkOutLabel={checkOutLabel}
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 md:px-6 md:pt-28">
      <button
        type="button"
        onClick={() => (step === "payment" ? setStep("details") : router.back())}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {step === "payment" ? "Voltar aos dados" : "Voltar"}
      </button>

      <div className="mb-6 flex items-center gap-3">
        <Steps step={step} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          {step === "details" && (
            <>
              <h1 className="font-serif text-2xl font-medium text-foreground md:text-3xl">Seus dados</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Precisamos de algumas informações para concluir a sua reserva.
              </p>
              <div className="mt-6">
                <GuestForm initialValue={guest} onSubmit={submitDetails} />
              </div>
            </>
          )}

          {step === "payment" && (
            <>
              <h1 className="font-serif text-2xl font-medium text-foreground md:text-3xl">Pagamento</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ambiente seguro. Pague em Pix com confirmação imediata ou cartão em até 12x.
              </p>
              <div className="mt-6">
                {quoteStatus === "loading" && (
                  <div className="flex items-center justify-center gap-2 rounded-md border border-border bg-card py-16 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Confirmando o valor real da estadia com a Stays…
                  </div>
                )}
                {quoteStatus === "error" && (
                  <div className="flex flex-col items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-10 text-center text-sm text-destructive">
                    <TriangleAlert className="size-6" />
                    <p>
                      Não foi possível confirmar o preço real desta estadia com a Stays agora. Por segurança, não
                      geramos uma cobrança sem esse valor confirmado.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
                {quoteStatus === "ready" && price && (
                  <PaymentSection
                    total={price.total}
                    method={method}
                    onMethodChange={setMethod}
                    onPay={handlePay}
                    onPixConfirmed={handlePixConfirmed}
                    result={result}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="relative aspect-[4/3]">
              <Image
                src={property.images[0]?.src || "/placeholder.svg"}
                alt={property.name}
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <p className="inline-flex items-center gap-1 text-xs text-primary">
                <Sparkles className="size-3.5" /> Reserva Direta Bomgo
              </p>
              <h2 className="mt-1 font-serif text-lg font-medium text-foreground">{property.name}</h2>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary" /> {property.location}
              </p>

              <div className="mt-4 space-y-3 rounded-md bg-secondary/50 p-4 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <CalendarDays className="size-4 text-primary" />
                  <span>
                    {checkInLabel} → {checkOutLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="size-4 text-primary" />
                  <span>
                    {criteria.adults + criteria.children} hóspedes · {nights} noites
                  </span>
                </div>
              </div>

              {quoteStatus === "loading" && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> Consultando preço real na Stays…
                </div>
              )}
              {quoteStatus === "error" && (
                <p className="mt-4 flex items-center gap-1.5 text-sm text-destructive">
                  <TriangleAlert className="size-3.5" /> Não foi possível confirmar o preço agora.
                </p>
              )}
              {quoteStatus === "ready" && price && (
                <div className="mt-4 space-y-2 text-sm">
                  <Row label={`${formatBRL(price.nightlyPrice)} × ${nights} noites`} value={formatBRL(price.subtotal)} />
                  {fees.map((fee) => (
                    <Row key={fee.label} label={fee.label} value={formatBRL(fee.value)} />
                  ))}
                  <Row label="Serviço Bomgo" value={formatBRL(price.serviceFee)} />
                  <div className="my-2 h-px bg-border" />
                  <Row label="Total" value={formatBRL(price.total)} bold />
                </div>
              )}

              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-success" /> Pagamento protegido pela Bomgo
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Precisa de ajuda?{" "}
            <Link href="/" className="font-medium text-primary">
              Fale com a Sofia
            </Link>
          </p>
        </aside>
      </div>
    </div>
  )
}

function Steps({ step }: { step: Step }) {
  const items = [
    { key: "details", label: "Dados" },
    { key: "payment", label: "Pagamento" },
    { key: "confirmed", label: "Confirmação" },
  ]
  const activeIndex = items.findIndex((i) => i.key === step)
  return (
    <ol className="flex items-center gap-2 text-sm">
      {items.map((item, i) => (
        <li key={item.key} className="flex items-center gap-2">
          <span
            className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
              i <= activeIndex ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {i + 1}
          </span>
          <span className={i <= activeIndex ? "font-medium text-foreground" : "text-muted-foreground"}>
            {item.label}
          </span>
          {i < items.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
        </li>
      ))}
    </ol>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "text-base font-semibold text-foreground" : "text-foreground"}>{value}</span>
    </div>
  )
}
