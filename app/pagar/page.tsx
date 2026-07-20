import { Suspense } from "react"
import { PagarReservaFlow } from "@/components/pagar/pagar-reserva-flow"

export default function PagarReservaPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <PagarReservaFlow />
    </Suspense>
  )
}
