import Image from "next/image"
import Link from "next/link"
import { offers } from "@/lib/data/discovery"

export function Partners() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div>
        <span className="text-sm font-medium text-primary">Ofertas e parceiros</span>
        <h2 className="mt-1 font-serif text-3xl font-medium text-foreground md:text-4xl">
          Coleções pensadas para o seu momento
        </h2>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {offers.map((offer) => {
          const hasExternalLink = Boolean(offer.externalUrl)
          const cardClassName =
            "group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl md:aspect-[4/3]"
          const content = (
            <>
              <Image
                src={offer.image || "/placeholder.svg"}
                alt={offer.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent" />
              <div className="relative p-5 text-primary-foreground">
                <span className="inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  {offer.tag}
                </span>
                <h3 className="mt-3 font-serif text-2xl font-medium leading-tight">{offer.title}</h3>
                <p className="mt-1 text-sm text-primary-foreground/85">{offer.subtitle}</p>
              </div>
            </>
          )

          // Partner offers (real CJ tracked link) open the same tab, feeling
          // like a natural continuation of the Bomgo experience rather than
          // a jump to another site. Internal offers keep the normal route.
          if (hasExternalLink) {
            return (
              <a key={offer.id} href={offer.externalUrl} className={cardClassName}>
                {content}
              </a>
            )
          }

          return (
            <Link key={offer.id} href="/busca" className={cardClassName}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
