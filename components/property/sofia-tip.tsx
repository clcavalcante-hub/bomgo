"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

const TYPE_SPEED_MS = 28
const HOLD_MS = 15000
const ERASE_SPEED_MS = 12

export function SofiaTip({ highlight }: { highlight?: string | null }) {
  const tips = buildTips(highlight)
  const [tipIndex, setTipIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">("typing")

  const fullText = tips[tipIndex % tips.length]

  useEffect(() => {
    if (phase === "typing") {
      if (displayed.length < fullText.length) {
        const t = setTimeout(() => setDisplayed(fullText.slice(0, displayed.length + 1)), TYPE_SPEED_MS)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase("holding"), HOLD_MS)
      return () => clearTimeout(t)
    }
    if (phase === "holding") {
      const t = setTimeout(() => setPhase("erasing"), 0)
      return () => clearTimeout(t)
    }
    if (phase === "erasing") {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), ERASE_SPEED_MS)
        return () => clearTimeout(t)
      }
      setTipIndex((i) => (i + 1) % tips.length)
      setPhase("typing")
    }
  }, [phase, displayed, fullText, tips.length])

  return (
    <div className="rounded-md bg-primary p-6 text-primary-foreground md:p-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-foreground/12">
          <Sparkles className="size-6 text-cta" />
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-xl font-medium">Dica da Sofia</h3>
          <p className="mt-2 min-h-[3.5em] text-sm leading-relaxed text-primary-foreground/85">
            {displayed}
            <span aria-hidden className="ml-0.5 inline-block w-[2px] animate-pulse bg-primary-foreground/70 align-middle" style={{ height: "1em" }} />
          </p>
        </div>
      </div>
    </div>
  )
}

function buildTips(highlight?: string | null): string[] {
  const base = [
    "Reserva imediata confirmada na hora. Para essa hospedagem, recomendo reservar com antecedência nos fins de semana e feriados. Precisa de berço, transfer ou late check-out? É só me chamar que eu organizo tudo antes da sua chegada.",
    "Chegando de avião? Consigo indicar um transfer de confiança do aeroporto até aqui e já deixo tudo combinado antes da sua viagem.",
    "Se quiser estender a estadia depois de reservar, é só me chamar — eu confirmo a disponibilidade das novas datas na hora.",
    "Dúvidas sobre check-in, Wi-Fi ou regras da casa aparecem aqui no seu painel assim que a reserva é confirmada. Qualquer coisa, estou por aqui.",
  ]
  return highlight ? [`${highlight}. ${base[0]}`, ...base.slice(1)] : base
}
