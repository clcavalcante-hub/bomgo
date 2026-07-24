import { Hero } from "@/components/home/hero"
import { BeachParkSpotlight } from "@/components/home/beach-park-spotlight"
import { HowBomgoHelps } from "@/components/home/how-bomgo-helps"
import { Destinations } from "@/components/home/destinations"
import { FeaturedStays } from "@/components/home/featured-stays"
import { ReviewsBand } from "@/components/home/reviews-band"
import { SofiaBand } from "@/components/home/sofia-band"
import { Partners } from "@/components/home/partners"

// Refetches real Stays availability at most once a minute instead of freezing
// featured listings at build time or re-querying Stays on every request.
export const revalidate = 60

/**
 * A ordem desta página é a mudança de modelo do site.
 *
 * Antes, a vitrine de apartamentos vinha logo depois do hero: o visitante caía
 * num catálogo. Agora ela vem depois da descoberta — destino, método e
 * parceria —, porque quem chega procurando "onde ficar no Beach Park" ainda não
 * está escolhendo apartamento; está decidindo o tipo de viagem.
 *
 * A vitrine não foi removida nem enfraquecida: continua inteira, e passa a ser
 * oferecida a alguém que já entendeu por que confiaria na recomendação — o que
 * converte melhor do que a mesma vitrine mostrada a quem acabou de chegar.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <BeachParkSpotlight />
      <HowBomgoHelps />
      <FeaturedStays />
      <ReviewsBand />
      <Destinations />
      <SofiaBand />
      <Partners />
    </>
  )
}
