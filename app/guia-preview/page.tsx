"use client"

import { useState } from "react"
import Link from "next/link"
import { WelcomeGuide } from "@/components/property/welcome-guide"

interface SampleReservation {
  propertyName: string
  propertyLocation: string
  propertyFullAddress: string
  propertyHouseRules: string[]
  propertyAmenities: { key: string; label: string }[]
  propertyImages: { src: string; alt: string }[]
  checkInDate: string
  checkOutDate: string
  checkinInfo: {
    access: string
    doorPassword: string
    wifiNetwork: string
    wifiPassword: string
    checkInTime: string
    checkOutTime: string
    parking: string
  }
}

const SAMPLES: Record<string, { label: string; reservation: SampleReservation }> = {
  "porto-das-dunas": {
    label: "Porto das Dunas (Terra Maris)",
    reservation: {
      propertyName: "Terra Maris — Apto teste",
      propertyLocation: "Porto das Dunas, Aquiraz",
      propertyFullAddress: "Av. dos Golfinhos, 2071 — Porto das Dunas — Aquiraz",
      propertyHouseRules: ["Não é permitido fumar dentro do apartamento.", "Silêncio após as 22h."],
      propertyAmenities: [
        { key: "wifi", label: "Wi-Fi" },
        { key: "ac", label: "Ar-condicionado" },
        { key: "kitchen", label: "Cozinha equipada" },
      ],
      propertyImages: [],
      checkInDate: "2026-08-18",
      checkOutDate: "2026-08-20",
      checkinInfo: {
        access: "Portaria informa o número do apartamento na chegada.",
        doorPassword: "1234",
        wifiNetwork: "TerraMaris_Guest",
        wifiPassword: "bemvindo123",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        parking: "1 vaga coberta",
      },
    },
  },
  meireles: {
    label: "Meireles (Landscape)",
    reservation: {
      propertyName: "Landscape Beira Mar — Apto teste",
      propertyLocation: "Meireles, Fortaleza",
      propertyFullAddress: "Av. Beira-Mar, 2450 — Meireles — Fortaleza",
      propertyHouseRules: ["Proibido animais.", "Máximo 4 hóspedes."],
      propertyAmenities: [
        { key: "wifi", label: "Wi-Fi" },
        { key: "pool", label: "Piscina" },
        { key: "gym", label: "Academia" },
      ],
      propertyImages: [],
      checkInDate: "2026-08-18",
      checkOutDate: "2026-08-20",
      checkinInfo: {
        access: "Portaria 24h, leve documento com foto.",
        doorPassword: "5678",
        wifiNetwork: "Landscape_Guest",
        wifiPassword: "beiramar2026",
        checkInTime: "15:00",
        checkOutTime: "12:00",
        parking: "1 vaga",
      },
    },
  },
}

export default function GuiaPreviewPage() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-28 text-center">
      <h1 className="font-serif text-2xl font-bold text-foreground">Preview — Guia de Boas-vindas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Página só pra teste, com dados fictícios — não precisa de login nem reserva real.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {Object.keys(SAMPLES).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Abrir guia — {SAMPLES[key].label}
          </button>
        ))}
      </div>
      <Link href="/" className="mt-8 inline-block text-xs text-muted-foreground hover:underline">
        Voltar pro site
      </Link>

      {active && <WelcomeGuide reservation={SAMPLES[active].reservation} onClose={() => setActive(null)} />}
    </div>
  )
}
