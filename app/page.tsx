import { Hero } from "@/components/home/hero"
import { Destinations } from "@/components/home/destinations"
import { FeaturedStays } from "@/components/home/featured-stays"
import { ReviewsBand } from "@/components/home/reviews-band"
import { SofiaBand } from "@/components/home/sofia-band"
import { Partners } from "@/components/home/partners"

// Refetches real Stays availability at most once a minute instead of freezing
// featured listings at build time or re-querying Stays on every request.
export const revalidate = 60

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedStays />
      <ReviewsBand />
      <Destinations />
      <SofiaBand />
      <Partners />
    </>
  )
}
