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

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {destinations.map((dest) => (
          <Link
            key={dest.id}
            href={`/busca?destino=${encodeURIComponent(dest.name)}`}
            className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl"
          >
            <Image
              src={dest.image || "/placeholder.svg"}
              alt={`${dest.name}, ${dest.region}`}
              fill
              sizes="(max-width: 768px) 50vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent" />
            <div className="relative p-3">
              <p className="font-serif text-lg font-medium leading-tight text-primary-foreground">{dest.name}</p>
              <p className="text-xs text-primary-foreground/80">{dest.region}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
