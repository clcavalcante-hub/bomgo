"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Sparkles, TriangleAlert } from "lucide-react"
import { PaymentSection } from "@/components/checkout/payment-section"
import { formatBRL } from "@/lib/pricing"
import { confirmPix, processPayment, type PaymentResult } from "@/lib/services/payment-service"
import type { PaymentMethod } from "@/lib/types"

export function PagarReservaFlow() {
  const params = useSearchParams()
  const reservationId = params.get("reservationId")
  const totalParam = Number(params.get("total"))
  const propertyName = params.get("propriedade")
  const total = Number.isFinite(totalParam) && totalParam > 0 ? totalParam : null

  const [method, setMethod] = useState<PaymentMethod>("pix")
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [paid, setPaid] = useState(false)

  async function handlePay(input: Parameters<typeof processPayment>[0]) {
    const res = await processPayment(input)
    setResult(res)
    if (res.status === "approved") setPaid(true)
    return res
  }

  async function handlePixConfirmed(transactionId: string) {
    if (!reservationId) return
    const res = await confirmPix(transactionId, reservationId)
    if (res.status === "approved") setPaid(true)
  }

  if (!reservationId || !total) {
    return (
      <div className="mx-auto max-w-md px-4 pb-20 pt-24 text-center md:pt-28">
        <TriangleAlert className="mx-auto size-8 text-destructive" />
        <h1 className="mt-4 font-serif text-xl font-medium text-foreground">Link de pagamento inválido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Volte para a sua reserva em{" "}
          <Link href="/conta" className="text-primary underline">
            Minhas reservas
          </Link>{" "}
          e tente novamente.
        </p>
      </div>
    )
  }

  if (paid) {
    return (
      <div className="mx-auto max-w-md px-4 pb-20 pt-24 text-center md:pt-28">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/12">
          <CheckCircle2 className="size-9 text-success" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-medium text-foreground">Pagamento confirmado!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua reserva foi paga e confirmada. Você já pode acompanhar tudo em Minhas reservas.
        </p>
        <Link
          href="/conta"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          Ver minhas reservas
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-20 pt-24 md:px-6 md:pt-28">
      <p className="inline-flex items-center gap-1 text-xs text-primary">
        <Sparkles className="size-3.5" /> Pagamento da reserva
      </p>
      <h1 className="mt-1 font-serif text-2xl font-medium text-foreground md:text-3xl">Pague agora</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {propertyName ? `${propertyName} — ` : ""}
        Total: <span className="font-semibold text-foreground">{formatBRL(total)}</span>
      </p>

      <div className="mt-6">
        <PaymentSection
          total={total}
          method={method}
          onMethodChange={setMethod}
          onPay={handlePay}
          onPixConfirmed={handlePixConfirmed}
          result={result}
          reservationId={reservationId}
        />
      </div>
    </div>
  )
}
