"use client"

import Image from "next/image"
import Link from "next/link"
import { CalendarDays, CheckCircle2, Download, MapPin, Sparkles } from "lucide-react"
import { formatBRL } from "@/lib/pricing"
import type { Guest, PaymentMethod, PriceBreakdown, Property } from "@/lib/types"

export function ConfirmationView({
  property,
  guest,
  voucher,
  method,
  price,
  checkInLabel,
  checkOutLabel,
}: {
  property: Property
  guest: Guest
  voucher: string
  method: PaymentMethod
  price: PriceBreakdown
  checkInLabel: string
  checkOutLabel: string
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-24 md:px-6 md:pt-32">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success/12">
          <CheckCircle2 className="size-9 text-success" />
        </span>
        <h1 className="mt-5 text-balance font-serif text-3xl font-medium text-foreground md:text-4xl">
          Reserva confirmada!
        </h1>
        <p className="mt-2 max-w-md text-pretty text-muted-foreground">
          {guest.firstName}, sua estadia está garantida. Enviamos o voucher e todos os
          detalhes para {guest.email}.
        </p>
      </div>

      {/* Voucher */}
      <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between bg-primary px-6 py-4 text-primary-foreground">
          <div>
            <p className="text-xs text-primary-foreground/70">Código do voucher</p>
            <p className="font-mono text-lg font-semibold tracking-wider">{voucher}</p>
          </div>
          <Sparkles className="size-6 text-cta" />
        </div>

        <div className="flex gap-4 p-5">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-md">
            <Image
              src={property.images[0]?.src || "/placeholder.svg"}
              alt={property.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-medium text-foreground">{property.name}</h2>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary" /> {property.location}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-foreground">
              <CalendarDays className="size-4 text-primary" />
              {checkInLabel} → {checkOutLabel}
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-border px-5 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hóspede</span>
            <span className="font-medium text-foreground">
              {guest.firstName} {guest.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pagamento</span>
            <span className="font-medium text-foreground">{method === "pix" ? "Pix" : "Cartão de crédito"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total pago</span>
            <span className="font-semibold text-foreground">{formatBRL(price.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground transition hover:border-primary"
        >
          <Download className="size-4" /> Baixar voucher
        </button>
        <a
          href={`https://checkin.bomgobrasil.com/?reserva=${encodeURIComponent(voucher)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-semibold text-cta-foreground transition hover:opacity-90"
        >
          Fazer check-in online
        </a>
      </div>

      <div className="mt-3 flex justify-center">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          Voltar ao início
        </Link>
      </div>

      <p className="mt-6 rounded-md bg-secondary/50 px-5 py-4 text-center text-sm text-muted-foreground">
        <Sparkles className="mr-1 inline size-4 text-cta" />A Sofia continua disponível para
        organizar transfer, passeios e pedidos especiais até o seu check-in.
      </p>
    </div>
  )
}
