"use client"

import Image from "next/image"
import { MessagesSquare, Sparkles, Wand2 } from "lucide-react"
import { useApp } from "@/components/providers/app-providers"

const steps = [
  {
    icon: MessagesSquare,
    title: "Conte o que você procura",
    text: "Fale como você fala com um amigo. Praia, família, pet, orçamento — a Sofia entende.",
  },
  {
    icon: Wand2,
    title: "A Sofia compara por você",
    text: "Ela cruza reservas diretas, parceiros oficiais e ofertas para achar o melhor encaixe.",
  },
  {
    icon: Sparkles,
    title: "Reserve com tranquilidade",
    text: "Pagamento em Pix ou cartão em até 12x, com confirmação imediata e suporte humano.",
  },
]

export function SofiaBand() {
  const { openSofia } = useApp()

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="size-4 text-cta" /> Conheça a Sofia
          </span>
          <h2 className="mt-5 text-balance font-serif text-3xl font-extrabold leading-tight md:text-4xl">
            Uma concierge inteligente que cuida de cada detalhe da sua reserva.
          </h2>
          <p className="mt-4 max-w-lg text-pretty leading-relaxed text-primary-foreground/85">
            A Sofia não é um chatbot qualquer. Ela conhece cada hospedagem, entende
            seu momento e conduz você até a reserva perfeita — sem complicação.
          </p>

          <div className="mt-8 space-y-5">
            {steps.map((step) => (
              <div key={step.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-foreground/12">
                  <step.icon className="size-5 text-cta" />
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-0.5 text-sm text-primary-foreground/75">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={openSofia}
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3.5 text-base font-semibold text-cta-foreground shadow-lg shadow-cta/25 transition-transform hover:scale-[1.02]"
          >
            <Sparkles className="size-5" /> Conversar com a Sofia
          </button>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-md md:aspect-[4/5]">
          <Image
            src="/images/terramaris-302-bloco3-jacuzzi.png"
            alt="Cobertura com jacuzzi e vista mar — Terra Maris 302, Bloco 3"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
            {/* Guest's question — right-aligned, WhatsApp "sent" bubble style */}
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[#DCF8C6] px-3.5 py-2 text-sm text-[#0b1a0b] shadow-md">
              Tem alguma cobertura com jacuzzi e vista mar dentro do meu orçamento?
            </div>
            {/* Sofia's reply — left-aligned, with avatar, "received" bubble style */}
            <div className="mr-auto flex max-w-[88%] items-end gap-2">
              <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 shadow-sm">
                <Image src="/images/sofia-avatar.png" alt="" width={32} height={32} className="size-8 object-cover" />
              </span>
              <div className="rounded-2xl rounded-bl-sm bg-background px-3.5 py-2 text-sm leading-snug text-foreground shadow-md">
                Encontrei uma cobertura com jacuzzi e vista mar dentro do seu orçamento. Quer ver? 😊
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
