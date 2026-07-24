import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { yearsOperating } from "@/lib/content/authors"

/**
 * Destino em destaque.
 *
 * Vem logo depois do hero, antes da vitrine de imóveis próprios, e essa ordem é
 * a mudança de modelo do site: primeiro a Bomgo mostra que conhece o destino,
 * depois oferece o que tem. Quem chega procurando "onde ficar no Beach Park"
 * não quer um catálogo — quer alguém que já esteve lá.
 *
 * Os cards apontam para as dúvidas reais de quem está decidindo, não para
 * categorias de produto. É a diferença entre um portal e um classificado.
 */

const CARDS = [
  {
    href: "/guias/beach-park",
    title: "Guia completo do Beach Park",
    body: "Quantos dias ficar, quando a região lota e o que ninguém avisa sobre os dias de fechamento.",
  },
  {
    href: "/comparativos/wellness-ou-acqua",
    title: "Wellness ou Acqua?",
    body: "Os dois são bons e resolvem coisas diferentes. Para qual perfil cada um funciona — e onde cada um decepciona.",
  },
  {
    href: "/guias/beach-park#quem-fica-perto-de-que",
    title: "Onde ficar em Porto das Dunas",
    body: "Resort colado ao parque ou apartamento a poucos minutos? Depende do tamanho do grupo e de quantos dias.",
  },
]

export function BeachParkSpotlight() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-[3/2]">
          <Image
            src="/images/guias/wellness-piscina-tobogas.jpg"
            alt="Vista de uma varanda no complexo do Beach Park: piscina abaixo e os tobogãs do Aqua Park logo atrás, com prédios de apartamentos ao lado."
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cta">
            Destino em destaque
          </p>
          <h2 className="mt-3 text-balance font-serif text-2xl font-bold leading-tight md:text-4xl">
            Descubra o Beach Park com quem conhece a região.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            A Bomgo atua em Porto das Dunas há {yearsOperating()} anos. Conhecemos de perto os
            resorts, os condomínios, os acessos e a diferença entre uma viagem que funciona e uma
            que vira corrida.
          </p>
          <Link
            href="/guias/beach-park"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
          >
            Ler o guia completo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="flex h-full flex-col rounded-xl border border-border p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <span className="font-semibold">{c.title}</span>
              <span className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {c.body}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
