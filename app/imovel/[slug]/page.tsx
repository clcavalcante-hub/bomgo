import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Bath,
  BedDouble,
  MapPin,
  Ruler,
  Sparkles,
  Star,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PropertyGallery } from "@/components/property/property-gallery"
import { BookingWidget } from "@/components/property/booking-widget"
import { AmenityIcon } from "@/components/property/amenity-icon"
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

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const property = await getLiveListingBySlug(slug)
  if (!property) notFound()

  const facts = [
    { icon: Users, label: `${property.maxGuests} hóspedes` },
    { icon: BedDouble, label: `${property.bedrooms} quartos` },
    { icon: Bath, label: `${property.bathrooms} banheiros` },
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
          <h1 className="text-balance font-serif text-3xl font-medium text-foreground md:text-4xl">
            {property.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4 text-primary" /> {property.location}
            </span>
            {property.rating > 0 && property.reviewsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-foreground">
                <Star className="size-4 fill-gold text-gold" />
                <span className="font-medium">{property.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">· {property.reviewsCount} avaliações</span>
              </span>
            )}
          </div>
        </div>
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

          <div className="my-8 h-px bg-border" />

          <h2 className="font-serif text-2xl font-medium text-foreground">Sobre esta hospedagem</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{property.description}</p>

          <div className="my-8 h-px bg-border" />

          <h2 className="font-serif text-2xl font-medium text-foreground">O que este lugar oferece</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {property.amenities.map((a) => (
              <div key={a.key} className="flex items-center gap-3 text-sm text-foreground">
                <span className="flex size-10 items-center justify-center rounded-md bg-secondary">
                  <AmenityIcon amenityKey={a.key} label={a.label} className="size-5 text-primary" />
                </span>
                {a.label}
              </div>
            ))}
          </div>

          <div className="my-8 h-px bg-border" />

          <div className="rounded-md bg-primary p-6 text-primary-foreground md:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-foreground/12">
                <Sparkles className="size-6 text-cta" />
              </span>
              <div>
                <h3 className="font-serif text-xl font-medium">Dica da Sofia</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                  {property.highlight
                    ? `${property.highlight}. `
                    : ""}
                  Para essa hospedagem, recomendo reservar com antecedência nos fins de
                  semana e feriados. Precisa de berço, transfer ou late check-out? É só
                  me chamar que eu organizo tudo antes da sua chegada.
                </p>
              </div>
            </div>
          </div>

          {property.reviews.length > 0 && (
            <>
              <div className="my-8 h-px bg-border" />
              <h2 className="font-serif text-2xl font-medium text-foreground">Avaliações dos hóspedes</h2>
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
              <h2 className="font-serif text-2xl font-medium text-foreground">Regras da hospedagem</h2>
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

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <BookingWidget property={property} />
        </aside>
      </div>
    </div>
  )
}
