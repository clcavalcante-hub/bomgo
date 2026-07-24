import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, MapPin } from "lucide-react"
import { PropertyCard } from "@/components/property/property-card"
import {
  DESTINATIONS,
  getDestinationEntry,
  destinationSelectionFromEntry,
} from "@/lib/data/destination-taxonomy"
import { getDestinationContent } from "@/lib/data/destination-content"
import { getPropertiesForDestination } from "@/lib/data/live-properties"
import {
  JsonLd,
  breadcrumbSchema,
  itemListSchema,
  faqSchema,
} from "@/lib/seo/jsonld"

// Páginas de destino são geradas para cada localidade conhecida e revalidadas
// de hora em hora (inventário da Stays muda devagar; não precisa refetch a cada
// request). Slug desconhecido → 404.
export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams() {
  return DESTINATIONS.filter((d) => getDestinationContent(d.id)).map((d) => ({
    destino: d.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destino: string }>
}): Promise<Metadata> {
  const { destino } = await params
  const entry = getDestinationEntry(destino)
  const content = getDestinationContent(destino)
  if (!entry || !content) return { title: "Destino não encontrado" }

  return {
    title: content.heading,
    description: content.intro,
    alternates: { canonical: `/hospedagem/${destino}` },
    openGraph: {
      type: "website",
      title: content.heading,
      description: content.intro,
      url: `/hospedagem/${destino}`,
      images: [{ url: content.image, alt: content.heading }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.heading,
      description: content.intro,
      images: [content.image],
    },
  }
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ destino: string }>
}) {
  const { destino } = await params
  const entry = getDestinationEntry(destino)
  const content = getDestinationContent(destino)
  if (!entry || !content) notFound()

  const selection = destinationSelectionFromEntry(entry)
  const properties = await getPropertiesForDestination(selection, 24)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-6 md:pt-28">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Início", url: "/" },
            { name: "Hospedagem", url: "/busca" },
            { name: entry.label, url: `/hospedagem/${destino}` },
          ]),
          ...(properties.length > 0
            ? [itemListSchema(properties, (p) => `/imovel/${p.slug}`)]
            : []),
          faqSchema(content.faq),
        ]}
      />

      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Início
        </Link>
        <span>/</span>
        <Link href="/busca" className="hover:text-foreground">
          Hospedagem
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{entry.label}</span>
      </nav>

      <header className="max-w-3xl">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          <MapPin className="size-4" /> {entry.label}
        </span>
        <h1 className="mt-2 text-balance font-serif text-3xl font-extrabold text-foreground md:text-4xl">
          {content.heading}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{content.intro}</p>
        <p className="mt-4 leading-relaxed text-muted-foreground">{content.body}</p>
      </header>

      <div className="mt-6">
        <Link
          href={`/busca?destino=${entry.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Ver disponibilidade e preços <ArrowRight className="size-4" />
        </Link>
      </div>

      {properties.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-extrabold text-foreground">
            Hospedagens em {entry.label}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={i === 0}
                maxPhotos={2}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-12 rounded-lg border border-border bg-secondary/30 p-6">
          <p className="text-muted-foreground">
            Estamos ampliando o inventário em {entry.label}. Fale com a Sofia ou{" "}
            <Link href="/busca" className="font-medium text-primary hover:underline">
              veja todas as hospedagens disponíveis
            </Link>
            .
          </p>
        </section>
      )}

      <section className="mt-16 max-w-3xl">
        <h2 className="font-serif text-2xl font-extrabold text-foreground">
          Perguntas frequentes
        </h2>
        <dl className="mt-6 space-y-6">
          {content.faq.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-1.5 leading-relaxed text-muted-foreground">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
