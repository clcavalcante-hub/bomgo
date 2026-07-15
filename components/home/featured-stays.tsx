import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PropertyCard } from "@/components/property/property-card"
import { getFeaturedProperties } from "@/lib/data/live-properties"

export async function FeaturedStays() {
  const featured = await getFeaturedProperties(3)
  if (featured.length === 0) return null

  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-primary">Reserva Direta Bomgo</span>
            <h2 className="mt-1 font-serif text-3xl font-medium text-foreground md:text-4xl">
              Seleção especial da Sofia
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              As hospedagens mais bem avaliadas do momento, com reserva direta e o melhor preço garantido.
            </p>
          </div>
          <Link
            href="/busca?destino=todos"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary md:inline-flex"
          >
            Ver tudo <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property, i) => (
            <PropertyCard key={property.id} property={property} priority={i === 0} />
          ))}
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/busca?destino=todos"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground"
          >
            Ver todas as hospedagens <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
