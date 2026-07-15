import Image from "next/image"
import Link from "next/link"
import { destinations } from "@/lib/data/discovery"

export function Destinations() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-medium text-foreground md:text-4xl">Destinos em alta</h2>
          <p className="mt-2 text-muted-foreground">Escolhidos pela Sofia com base nas viagens do momento</p>
        </div>
      </div>

      <div className="no-scrollbar mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">
        {destinations.map((dest) => (
          <Link
            key={dest.id}
            href={`/busca?destino=${encodeURIComponent(dest.name)}`}
            className="group relative flex aspect-[3/4] w-[68vw] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-md sm:w-[38vw] md:w-[26vw] lg:w-[19vw]"
          >
            <Image
              src={dest.image || "/placeholder.svg"}
              alt={`${dest.name}, ${dest.region}`}
              fill
              sizes="(max-width: 768px) 68vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent" />
            <div className="relative p-4">
              <p className="font-serif text-xl font-medium leading-tight text-primary-foreground">{dest.name}</p>
              <p className="text-sm text-primary-foreground/80">{dest.region}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
