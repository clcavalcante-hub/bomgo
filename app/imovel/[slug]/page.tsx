import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Bath,
  BedDouble,
  MapPin,
  Ruler,
  Star,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PropertyGallery } from "@/components/property/property-gallery"
import { PropertyActions } from "@/components/property/property-actions"
import { BookingWidget } from "@/components/property/booking-widget"
import { ExpandableText } from "@/components/property/expandable-text"
import { FormattedDescription } from "@/components/property/formatted-description"
import { SofiaTip } from "@/components/property/sofia-tip"
import { formatPropertyDescription } from "@/lib/integrations/description-formatter"
import { formatBathrooms } from "@/lib/text/format-count"
import { ExpandableAmenities } from "@/components/property/expandable-amenities"
import { PropertyReviews } from "@/components/property/property-reviews"
import { getLiveListingBySlug } from "@/lib/data/live-properties"
import { badgeConfig } from "@/lib/config"

// Listings come exclusively from the live Stays catalog — there is no static
// list of slugs to pre-render, so every request resolves on demand and is
// cached (ISR) per-slug for a minute.
export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = await getLiveListingBySlug(slug)
  if (!property) return { title: "Hospedagem não encontrada — Bomgo" }
  return {
    title: `${property.name} — Bomgo`,
    description: property.summary || property.description.slice(0, 155),
    openGraph: {
      title: property.name,
      description: property.summary || property.description.slice(0, 155),
      images: property.images[0] ? [{ url: property.images[0].src }] : undefined,
      type: "website",
    },
  }
}

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const property = await getLiveListingBySlug(slug)
  if (!property) notFound()
  const formattedDescription = await formatPropertyDescription(property.description)

  // Datas/hóspedes vindos na URL (ex.: link que a Sofia manda no WhatsApp já com
  // as datas pedidas) pré-selecionam o widget de reserva. Nomes de parâmetro
  // idênticos aos de serializeCriteria: checkin/checkout/adultos/criancas.
  const sp = await searchParams
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const initialCheckIn = pick(sp.checkin) || undefined
  const initialCheckOut = pick(sp.checkout) || undefined
  const initialAdults = Number(pick(sp.adultos)) || undefined
  const initialChildren = Number(pick(sp.criancas)) || undefined

  const facts = [
    { icon: Users, label: `${property.maxGuests} hóspedes` },
    { icon: BedDouble, label: `${property.bedrooms} quartos` },
    { icon: Bath, label: formatBathrooms(property.bathrooms) },
    { icon: Ruler, label: `${property.areaSqm} m²` },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-6 md:pt-28">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>
        <span>/</span>
        <Link href="/busca" className="hover:text-foreground">
          Busca
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{property.name}</span>
      </nav>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {property.badges.map((b) => (
          <Badge key={b} tone={badgeConfig[b].tone}>
            {badgeConfig[b].label}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-balance font-serif text-3xl font-semibold text-foreground md:text-4xl">
            {property.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4 text-primary" /> {property.location}
            </span>
            <span className="text-xs text-muted-foreground/70">Código: {property.code ?? property.id}</span>
            {property.rating > 0 && property.reviewsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-foreground">
                <Star className="size-4 fill-gold text-gold" />
                <span className="font-medium">{property.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">· {property.reviewsCount} avaliações</span>
              </span>
            )}
          </div>
        </div>
        <PropertyActions propertyId={property.id} propertyName={property.name} slug={property.slug} />
      </div>

      <div className="mt-6">
        <PropertyGallery images={property.images} name={property.name} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">{property.type}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {facts.map((f) => (
              <span key={f.label} className="inline-flex items-center gap-2 text-sm text-foreground">
                <f.icon className="size-5 text-primary" />
                {f.label}
              </span>
            ))}
          </div>

          <div className="my-8 h-px bg-border lg:hidden" />

          {/* Price/booking box, mobile only — desktop keeps the sticky
              sidebar. On phones the sidebar used to stack below EVERYTHING
              (amenities, description, reviews, rules), burying the price;
              this puts it right after the basic facts, before amenities. */}
          <div className="lg:hidden">
            <BookingWidget
              property={property}
              initialCheckIn={initialCheckIn}
              initialCheckOut={initialCheckOut}
              initialAdults={initialAdults}
              initialChildren={initialChildren}
            />
          </div>

          <div className="my-8 h-px bg-border" />

          <h2 className="font-serif text-2xl font-extrabold text-foreground">O que este lugar oferece</h2>
          <ExpandableAmenities amenities={property.amenities} limit={10} />

          <div className="my-8 h-px bg-border" />

          <h2 className="font-serif text-2xl font-extrabold text-foreground">Sobre esta hospedagem</h2>
          {formattedDescription ? (
            <FormattedDescription text={formattedDescription} />
          ) : (
            <ExpandableText text={property.description} lines={6} />
          )}

          <div className="my-8 h-px bg-border" />

          <PropertyReviews listingCode={property.code} />

          <SofiaTip highlight={property.highlight} />

          {property.reviews.length > 0 && (
            <>
              <div className="my-8 h-px bg-border" />
              <h2 className="font-serif text-2xl font-extrabold text-foreground">Avaliações dos hóspedes</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {property.reviews.map((r) => (
                  <div key={r.id} className="rounded-md border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{r.author}</p>
                        <p className="text-xs text-muted-foreground">{r.location}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-sm font-medium text-foreground">
                        <Star className="size-3.5 fill-gold text-gold" /> {r.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{r.date}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {property.rules.length > 0 && (
            <>
              <div className="my-8 h-px bg-border" />
              <h2 className="font-serif text-2xl font-extrabold text-foreground">Regras da hospedagem</h2>
              <ul className="mt-4 space-y-2">
                {property.rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {rule}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="hidden lg:sticky lg:top-28 lg:block lg:h-fit">
          <BookingWidget
              property={property}
              initialCheckIn={initialCheckIn}
              initialCheckOut={initialCheckOut}
              initialAdults={initialAdults}
              initialChildren={initialChildren}
            />
        </aside>
      </div>
    </div>
  )
}
