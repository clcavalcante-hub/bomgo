"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Camera,
  Car,
  Home,
  Info,
  KeyRound,
  Luggage,
  Martini,
  MapPin,
  Phone,
  ScrollText,
  ShoppingCart,
  TriangleAlert,
  UtensilsCrossed,
  Wifi,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react"
import { resolveTransportBody } from "@/lib/data/welcome-guide-transport"

/**
 * Digital welcome guide — full-screen on mobile, centered modal on desktop
 * (sm: breakpoint switches the layout via Tailwind only, no JS media query).
 * Opened from the "Instruções de check-in" button on the /conta reservation
 * card. Content per section is built from real reservation/property data
 * where available (check-in, regras, contato, checkout, emergências); the
 * rest are static placeholders until Chris feeds real content per condomínio
 * — this first version is the architecture test, not final content.
 */

interface WelcomeGuideReservation {
  propertyName: string | null
  propertyLocation: string | null
  propertyFullAddress: string | null
  propertyHouseRules: string[]
  propertyAmenities: { key: string; label: string }[]
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
  } | null
}

interface GuideSection {
  key: string
  title: string
  icon: LucideIcon
  body: string
  available: boolean
}

function buildSections(r: WelcomeGuideReservation): GuideSection[] {
  const ci = r.checkinInfo

  const checkinBody = [
    ci?.checkInTime ? `Horário de check-in: ${ci.checkInTime}.` : null,
    ci?.access ? `Acesso: ${ci.access}` : null,
    ci?.doorPassword ? `Senha da porta: ${ci.doorPassword}` : null,
    ci?.parking ? `Estacionamento: ${ci.parking}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  const wifiBody = [
    ci?.wifiNetwork ? `Rede: ${ci.wifiNetwork}` : null,
    ci?.wifiPassword ? `Senha: ${ci.wifiPassword}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  const equipamentoBody =
    r.propertyAmenities.length > 0 ? r.propertyAmenities.map((a) => `• ${a.label}`).join("\n") : ""

  return [
    {
      key: "bemVindo",
      title: "Bem-vindo",
      icon: Home,
      available: true,
      body: `Estamos felizes em recebê-lo em ${r.propertyName ?? "nossa hospedagem"}. Esperamos que você tenha uma estadia inesquecível.`,
    },
    {
      key: "checkin",
      title: "Check-in",
      icon: KeyRound,
      available: checkinBody.length > 0,
      body: checkinBody || "As instruções de acesso aparecem aqui assim que a reserva for confirmada.",
    },
    {
      key: "localizacao",
      title: "Localização",
      icon: MapPin,
      available: Boolean(r.propertyFullAddress || r.propertyLocation),
      body: r.propertyFullAddress || r.propertyLocation || "Em breve.",
    },
    {
      key: "wifi",
      title: "Wi-Fi",
      icon: Wifi,
      available: wifiBody.length > 0,
      body: wifiBody || "Os dados de Wi-Fi aparecem aqui junto com o restante do acesso.",
    },
    {
      key: "regras",
      title: "Regras",
      icon: ScrollText,
      available: r.propertyHouseRules.length > 0,
      body: r.propertyHouseRules.length > 0 ? r.propertyHouseRules.join("\n\n") : "Em breve.",
    },
    {
      key: "transportes",
      title: "Transportes",
      icon: Car,
      available: Boolean(resolveTransportBody(r.propertyLocation, r.propertyFullAddress)),
      body:
        resolveTransportBody(r.propertyLocation, r.propertyFullAddress) ??
        "Em breve — informações de aeroporto, ônibus e transfer.",
    },
    {
      key: "equipamento",
      title: "Equipamento",
      icon: Wrench,
      available: equipamentoBody.length > 0,
      body: equipamentoBody || "Em breve.",
    },
    {
      key: "atividades",
      title: "Atividades",
      icon: Camera,
      available: false,
      body: "Em breve — passeios e atividades na região.",
    },
    {
      key: "informacao",
      title: "Informação",
      icon: Info,
      available: false,
      body: "Em breve — farmácia, banco, correios e outros serviços próximos.",
    },
    {
      key: "bares",
      title: "Bares e Clubes",
      icon: Martini,
      available: false,
      body: "Em breve.",
    },
    {
      key: "restaurantes",
      title: "Restaurantes",
      icon: UtensilsCrossed,
      available: false,
      body: "Em breve.",
    },
    {
      key: "compras",
      title: "Compras",
      icon: ShoppingCart,
      available: false,
      body: "Em breve.",
    },
    {
      key: "emergencias",
      title: "Emergências",
      icon: TriangleAlert,
      available: true,
      body: "SAMU: 192\nPolícia: 190\nBombeiros: 193\n\nEm caso de qualquer urgência na hospedagem, fale com a Sofia.",
    },
    {
      key: "checkout",
      title: "Checkout",
      icon: Luggage,
      available: Boolean(ci?.checkOutTime),
      body: ci?.checkOutTime
        ? `Horário de checkout: ${ci.checkOutTime}.\n\nAntes de sair: reúna seus pertences, desligue aparelhos, feche portas e janelas e deixe as chaves no local combinado.`
        : "Em breve.",
    },
    {
      key: "contato",
      title: "Contato",
      icon: Phone,
      available: true,
      body: "Sofia — (85) 8141-2023 (WhatsApp)\n\nEstamos disponíveis para ajudar em qualquer momento da sua estadia.",
    },
  ]
}

export function WelcomeGuide({
  reservation,
  onClose,
}: {
  reservation: WelcomeGuideReservation
  onClose: () => void
}) {
  const sections = buildSections(reservation)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const active = sections.find((s) => s.key === activeKey) ?? null

  return (
    <div
      className="fixed inset-0 z-[110] bg-card sm:flex sm:items-center sm:justify-center sm:bg-black/50 sm:p-6"
      onClick={active ? undefined : onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-card sm:h-[85vh] sm:max-h-[720px] sm:w-full sm:max-w-md sm:rounded-3xl sm:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {active ? (
          <>
            <div className="flex items-center gap-3 bg-primary px-5 py-4 text-primary-foreground">
              <button
                type="button"
                onClick={() => setActiveKey(null)}
                aria-label="Voltar"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cta/90"
              >
                <ArrowLeft className="size-4" />
              </button>
              <h2 className="font-serif text-lg font-medium">{active.title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="ml-auto text-primary-foreground/70 hover:text-primary-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {active.available ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{active.body}</p>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">{active.body}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="bg-primary px-6 py-6 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-medium leading-tight">Guia de Boas-vindas</h2>
                  <p className="mt-1 text-sm text-primary-foreground/80">Fique, explore e aproveite</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="text-primary-foreground/70 hover:text-primary-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
              {reservation.propertyName && (
                <p className="mt-3 text-sm text-primary-foreground/80">{reservation.propertyName}</p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="grid grid-cols-3 gap-x-2 gap-y-6">
                {sections.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiveKey(s.key)}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
                      <s.icon className="size-6" />
                    </span>
                    <span className="text-[11px] font-medium leading-tight text-foreground">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
