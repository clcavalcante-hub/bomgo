import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CheckoutFlow } from "@/components/checkout/checkout-flow"
import { getPropertyBySlug, allProperties } from "@/lib/data/properties"

export function generateStaticParams() {
  return allProperties.map((p) => ({ slug: p.slug }))
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const property = getPropertyBySlug(slug)
  if (!property) notFound()

  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <CheckoutFlow property={property} />
    </Suspense>
  )
}
