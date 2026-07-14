"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  CalendarDays,
  ChevronLeft,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { GuestForm, type GuestFormValue } from "@/components/checkout/guest-form"
import { PaymentSection } from "@/components/checkout/payment-section"
import { ConfirmationView } from "@/components/checkout/confirmation-view"
import { parseCriteria } from "@/lib/services/search-service"
import { computePrice, formatBRL, nightsBetween } from "@/lib/pricing"
import {
  confirmPix,
  generateVoucherCode,
  processPayment,
  type PaymentResult,
} from "@/lib/services/payment-service"
import type { Guest, PaymentMethod, Property } from "@/lib/types"

type Step = "details" | "payment" | "confirmed"

export function CheckoutFlow({ property }: { property: Property }) {
  const router = useRouter()
  const params = useSearchParams()
  const criteria = useMemo(() => parseCriteria(params), [params])
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut)
  const price = useMemo(() => computePrice(property, nights), [property, nights])

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

  async function handlePay(input: Parameters<typeof processPayment>[0]) {
    const res = await processPayment(input)
    setResult(res)
    if (res.status === "approved") {
      setVoucher(generateVoucherCode())
      setStep("confirmed")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    return res
  }

  async function handlePixConfirmed(transactionId: string) {
    const res = await confirmPix(transactionId)
    if (res.status === "approved") {
      setVoucher(generateVoucherCode())
      setStep("confirmed")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const checkInLabel = criteria.checkIn
    ? new Date(criteria.checkIn).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "A definir"
  const checkOutLabel = criteria.checkOut
    ? new Date(criteria.checkOut).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "A definir"

  if (step === "confirmed" && guest) {
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
                <PaymentSection
                  total={price.total}
                  method={method}
                  onMethodChange={setMethod}
                  onPay={handlePay}
                  onPixConfirmed={handlePixConfirmed}
                  result={result}
                />
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
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

              <div className="mt-4 space-y-3 rounded-2xl bg-secondary/50 p-4 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <CalendarDays className="size-4 text-primary" />
                  <span>
                    {checkInLabel} → {checkOutLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="size-4 text-primary" />
                  <span>
                    {criteria.adults + criteria.children} hóspedes · {price.nights} noites
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <Row label={`${formatBRL(property.nightlyPrice)} × ${price.nights} noites`} value={formatBRL(price.subtotal)} />
                {price.cleaningFee > 0 && <Row label="Limpeza" value={formatBRL(price.cleaningFee)} />}
                {price.energyFee > 0 && <Row label="Energia" value={formatBRL(price.energyFee)} />}
                <Row label="Serviço Bomgo" value={formatBRL(price.serviceFee)} />
                <div className="my-2 h-px bg-border" />
                <Row label="Total" value={formatBRL(price.total)} bold />
              </div>

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
