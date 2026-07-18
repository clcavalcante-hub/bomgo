import { Sparkles } from "lucide-react"
import { HeroSearchBar } from "@/components/search/hero-search-bar"

export function Hero() {
  return (
    <section className="relative flex min-h-[58vh] items-end md:min-h-[62vh]">
      {/* Background video clipped in its own layer — kept separate from the
          section itself so the search bar's dropdown panels (Destino/Datas/
          Hóspedes) can extend below the hero without being cut off. */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-video-poster.jpg"
          className="absolute inset-0 size-full object-cover"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/35 to-black/20" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-10 pt-20 md:px-6 md:pb-14">
        <h1 className="max-w-xl text-balance font-serif text-3xl font-extrabold leading-[1.1] text-primary-foreground md:text-5xl">
          A hospedagem certa, encontrada por inteligência.
        </h1>

        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground/90">
          <Sparkles className="size-4 text-cta" />
          A Sofia busca pra você
        </p>

        <div className="mt-3 max-w-4xl">
          <HeroSearchBar />
        </div>

        <p className="mt-4 text-center text-xs text-primary-foreground/70 md:text-sm">
          Pix e cartão em até 6x · Parceiros oficiais verificados
        </p>
      </div>
    </section>
  )
}
