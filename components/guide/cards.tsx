"use client"

import { ArrowUpRight, BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react"
import {
  AFFILIATE_LINK_ATTRS,
  BOOKING_PARTNER_LABEL,
  affiliateHref,
  affiliateTarget,
} from "@/lib/affiliates"
import {
  ANALYTICS_EVENTS,
  track,
  trackAffiliateClick,
  type AnalyticsPayload,
} from "@/lib/analytics/events"

// Peças de clique. São os únicos componentes de guia que rodam no navegador,
// porque precisam registrar a conversão antes de o viajante sair da página.
//
// Duas decisões que se repetem aqui:
//
// 1. O evento é disparado no onClick e NUNCA bloqueia a navegação. Se a medição
//    falhar, o clique acontece do mesmo jeito — perder um dado é aceitável,
//    perder uma reserva não é.
// 2. Nenhum preço aparece em card de parceiro. A Booking não expõe tarifa pela
//    API; qualquer número aqui seria inventado e envelheceria mal. Preço é o que
//    o viajante vai buscar do outro lado — e é isso que o CTA promete.

interface HotelCardItem {
  affiliateKey: string
  name: string
  summary: string
  image?: string
  highlights: string[]
  preferredPartner?: boolean
}

export function HotelCard({
  hotel,
  placement,
  destination,
  sourcePath,
}: {
  hotel: HotelCardItem
  placement: string
  destination?: string
  sourcePath?: string
}) {
  const href = affiliateHref(hotel.affiliateKey)
  const target = affiliateTarget(hotel.affiliateKey)

  // Chave desconhecida ou desativada: o card some. Melhor uma opção a menos do
  // que um link quebrado num guia que promete curadoria.
  if (!href || !target) return null

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border">
      {hotel.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagem vem do parceiro, sem domínio fixo
        <img
          src={hotel.image}
          alt={hotel.name}
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {BOOKING_PARTNER_LABEL}
          </span>
          {hotel.preferredPartner ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-400">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Parceiro Preferencial
            </span>
          ) : null}
        </div>

        <h3 className="text-lg font-semibold leading-snug">{hotel.name}</h3>
        <p className="text-[15px] leading-relaxed text-muted-foreground">{hotel.summary}</p>

        {hotel.highlights.length ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {hotel.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <span aria-hidden="true" className="text-primary">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <a
          {...AFFILIATE_LINK_ATTRS}
          href={href}
          onClick={() =>
            trackAffiliateClick({
              affiliateKey: hotel.affiliateKey,
              placement,
              destination,
              sourcePath,
            })
          }
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Ver preços na Booking.com
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>

        <p className="text-center text-xs text-muted-foreground">
          Preços e disponibilidade são consultados na Booking.com
        </p>
      </div>
    </article>
  )
}

/** CTA de parceiro fora do card — fecha uma seção do guia. */
export function BookingCTA({
  affiliateKey,
  heading,
  body,
  label = "Ver disponibilidade na Booking.com",
  placement,
  destination,
  sourcePath,
}: {
  affiliateKey: string
  heading: string
  body?: string
  label?: string
  placement: string
  destination?: string
  sourcePath?: string
}) {
  const href = affiliateHref(affiliateKey)
  if (!href) return null

  return (
    <aside className="rounded-xl border border-border bg-muted/40 p-6 text-center">
      <h2 className="text-balance text-xl font-semibold">{heading}</h2>
      {body ? (
        <p className="mx-auto mt-2 max-w-prose text-[15px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      ) : null}
      <a
        {...AFFILIATE_LINK_ATTRS}
        href={href}
        onClick={() => {
          track(ANALYTICS_EVENTS.bookingCtaClicked, {
            affiliate_key: affiliateKey,
            placement,
            destination,
            source_path: sourcePath,
            offer_type: "parceiro",
          })
          trackAffiliateClick({ affiliateKey, placement, destination, sourcePath })
        }}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {label}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
    </aside>
  )
}

/**
 * CTA da Sofia.
 *
 * Leva o contexto da página junto (destino e conteúdo lido) para que a conversa
 * comece sabendo de onde a pessoa veio — o viajante não deveria ter que repetir
 * o que já estava lendo na tela.
 */
export function SofiaCTA({
  heading = "Não sabe qual hospedagem escolher?",
  body = "A Sofia compara localização, estrutura, perfil da viagem e faixa de preço com você.",
  label = "Pedir ajuda à Sofia",
  href = "/sofia",
  placement,
  destination,
  contentSlug,
  sourcePath,
}: {
  heading?: string
  body?: string
  label?: string
  href?: string
  placement: string
  destination?: string
  contentSlug?: string
  sourcePath?: string
}) {
  const payload: AnalyticsPayload = {
    placement,
    destination,
    content_slug: contentSlug,
    source_path: sourcePath,
  }

  const params = new URLSearchParams()
  if (destination) params.set("destino", destination)
  if (contentSlug) params.set("de", contentSlug)
  const target = params.toString() ? `${href}?${params.toString()}` : href

  return (
    <aside className="rounded-xl border border-primary/25 bg-primary/[0.05] p-6">
      <h2 className="flex items-center gap-2 text-balance text-xl font-semibold">
        <MessageCircle className="size-5 shrink-0 text-primary" aria-hidden="true" />
        {heading}
      </h2>
      <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted-foreground">{body}</p>
      <a
        href={target}
        onClick={() => track(ANALYTICS_EVENTS.sofiaCtaClicked, payload)}
        className="mt-5 inline-flex items-center justify-center rounded-lg border border-primary bg-background px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {label}
      </a>
    </aside>
  )
}
