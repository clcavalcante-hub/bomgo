import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CheckoutFlow } from "@/components/checkout/checkout-flow"
import { getLiveListingBySlug } from "@/lib/data/live-properties"

// No static catalog to enumerate — every checkout resolves the live listing
// on demand from Stays, with a short per-slug ISR cache.
export const revalidate = 60

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const property = await getLiveListingBySlug(slug)
  if (!property) notFound()

  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <CheckoutFlow property={property} />
    </Suspense>
  )
}
