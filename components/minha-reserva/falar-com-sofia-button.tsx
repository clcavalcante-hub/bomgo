"use client"

import { MessageCircle } from "lucide-react"
import { useFalarComSofia } from "@/lib/hooks/use-falar-com-sofia"

export function FalarComSofiaButton() {
  const falarComSofia = useFalarComSofia()
  return (
    <button
      type="button"
      onClick={falarComSofia}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-semibold text-cta-foreground"
    >
      <MessageCircle className="size-4" /> Falar com a Sofia
    </button>
  )
}
