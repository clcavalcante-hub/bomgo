import { Hero } from "@/components/home/hero"
import { Destinations } from "@/components/home/destinations"
import { FeaturedStays } from "@/components/home/featured-stays"
import { SofiaBand } from "@/components/home/sofia-band"
import { Partners } from "@/components/home/partners"

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedStays />
      <Destinations />
      <SofiaBand />
      <Partners />
    </>
  )
}
