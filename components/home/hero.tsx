import Image from "next/image"
import { HeroSearchBar } from "@/components/search/hero-search-bar"

export function Hero() {
  return (
    <section className="relative flex min-h-[80vh] items-end overflow-hidden md:min-h-[78vh]">
      <Image
        src="/images/hero-resort.png"
        alt="Resort à beira-mar ao pôr do sol"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Video hook: swap the <Image> above for a <video autoPlay muted loop
          playsInline> pointing at /videos/hero.mp4 once the file is provided —
          the gradient and layout below need no changes. */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-primary/10" />

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-28 md:px-6 md:pb-24">
        <h1 className="max-w-xl text-balance font-serif text-3xl font-medium leading-[1.1] text-primary-foreground md:text-5xl">
          A hospedagem certa, encontrada por inteligência.
        </h1>

        <div className="mt-7 max-w-3xl">
          <HeroSearchBar />
        </div>

        <p className="mt-4 text-xs text-primary-foreground/70 md:text-sm">
          Reserva direta Bomgo · Pix e cartão em até 12x · Parceiros oficiais verificados
        </p>
      </div>
    </section>
  )
}
