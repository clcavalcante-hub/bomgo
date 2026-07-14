import Image from "next/image"
import { Sparkles } from "lucide-react"
import { SearchBar } from "@/components/search/search-bar"

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden md:min-h-[88vh]">
      <Image
        src="/images/hero-resort.png"
        alt="Resort à beira-mar ao pôr do sol"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-primary/25" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-28 md:px-6 md:pb-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur">
            <Sparkles className="size-4 text-cta" />
            Reserva inteligente com a Sofia
          </span>
          <h1 className="mt-5 text-balance font-serif text-4xl font-medium leading-[1.05] text-primary-foreground md:text-6xl">
            A hospedagem certa, encontrada por inteligência.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/85 md:text-lg">
            A Sofia entende o que você procura, compara as melhores opções e conduz
            sua reserva do início ao fim — com a elegância que a sua viagem merece.
          </p>
        </div>

        <div className="mt-8 max-w-2xl">
          <SearchBar />
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-primary-foreground/80">
          <span>Reserva Direta Bomgo</span>
          <span>Pix e cartão em até 12x</span>
          <span>Parceiros oficiais verificados</span>
        </div>
      </div>
    </section>
  )
}
