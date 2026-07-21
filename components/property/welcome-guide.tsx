"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Camera,
  Car,
  Check,
  Home,
  Info,
  KeyRound,
  Luggage,
  Martini,
  MapPin,
  Phone,
  ScrollText,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  TriangleAlert,
  UtensilsCrossed,
  Wifi,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react"
import { resolveTransportBody } from "@/lib/data/welcome-guide-transport"
import { resolveActivitiesBody } from "@/lib/data/welcome-guide-activities"
import { resolveInfoBody } from "@/lib/data/welcome-guide-info"
import { resolveBarsBody } from "@/lib/data/welcome-guide-bars"
import { resolveRestaurantsBody } from "@/lib/data/welcome-guide-restaurants"
import { resolveShoppingBody } from "@/lib/data/welcome-guide-shopping"

/**
 * Digital welcome guide — full-screen on mobile, centered modal on desktop
 * (sm: breakpoint via Tailwind only, no JS media query). Opened from the
 * "Instruções de check-in" button on the /conta reservation card.
 *
 * Visual reference: Chris's Canva mockup (2026-07-21) — navy gradient header
 * with an accent icon circle, cream card body, structured blocks (numbered
 * rules, key/wifi cards, checklists) instead of a single paragraph of text.
 * No hotlinked stock photography (unreliable + rights risk on a live
 * production site) — the header uses a gradient + icon instead of a photo.
 */

interface WelcomeGuideReservation {
  propertyName: string | null
  propertyLocation: string | null
  propertyFullAddress: string | null
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
  } | null
}

type SectionKey =
  | "bemVindo"
  | "checkin"
  | "localizacao"
  | "wifi"
  | "regras"
  | "transportes"
  | "equipamento"
  | "atividades"
  | "informacao"
  | "bares"
  | "restaurantes"
  | "compras"
  | "emergencias"
  | "checkout"
  | "contato"

interface SectionMeta {
  key: SectionKey
  title: string
  icon: LucideIcon
}

const SECTIONS: SectionMeta[] = [
  { key: "bemVindo", title: "Bem-vindo", icon: Home },
  { key: "checkin", title: "Check-in", icon: KeyRound },
  { key: "localizacao", title: "Localização", icon: MapPin },
  { key: "wifi", title: "Wi-Fi", icon: Wifi },
  { key: "regras", title: "Regras", icon: ScrollText },
  { key: "transportes", title: "Transportes", icon: Car },
  { key: "equipamento", title: "Equipamento", icon: Wrench },
  { key: "atividades", title: "Atividades", icon: Camera },
  { key: "informacao", title: "Informação", icon: Info },
  { key: "bares", title: "Bares e Clubes", icon: Martini },
  { key: "restaurantes", title: "Restaurantes", icon: UtensilsCrossed },
  { key: "compras", title: "Compras", icon: ShoppingCart },
  { key: "emergencias", title: "Emergências", icon: TriangleAlert },
  { key: "checkout", title: "Checkout", icon: Luggage },
  { key: "contato", title: "Contato", icon: Phone },
]

// ---------------------------------------------------------------------------
// Generic renderer for the region-sourced sections (transportes, atividades,
// informação, bares, restaurantes, compras). Those bodies already follow a
// loose convention — ALL-CAPS lines as sub-headings, "• " lines as bullets,
// blank-line-separated blocks — so this turns that plain text into cards
// instead of one flat paragraph.
// ---------------------------------------------------------------------------
function isHeadingLine(line: string): boolean {
  const letters = line.replace(/[^\p{L}]/gu, "")
  if (letters.length < 2) return false
  return letters === letters.toUpperCase() && line.length < 70
}

function TextCards({ body }: { body: string }) {
  const blocks = body
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean)
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean)
        const heading = isHeadingLine(lines[0]) ? lines[0] : null
        const rest = heading ? lines.slice(1) : lines
        // First block with no heading and no bullets is treated as an intro
        // note (price legend / disclaimer) rather than a full card.
        if (!heading && i === 0 && !rest.some((l) => l.startsWith("•"))) {
          return (
            <p key={i} className="text-xs italic leading-relaxed text-muted-foreground">
              {block}
            </p>
          )
        }
        return (
          <div key={i} className="rounded-2xl bg-card p-4 shadow-sm">
            {heading && <p className="font-serif text-sm font-bold text-primary">{heading}</p>}
            <div className={heading ? "mt-1.5 space-y-1" : "space-y-1"}>
              {rest.map((line, j) =>
                line.startsWith("•") ? (
                  <p key={j} className="flex gap-1.5 text-sm leading-relaxed text-foreground">
                    <span className="text-cta">•</span>
                    <span>{line.replace(/^•\s*/, "")}</span>
                  </p>
                ) : (
                  <p key={j} className="text-sm leading-relaxed text-foreground">
                    {line}
                  </p>
                ),
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
}

// ---------------------------------------------------------------------------
// Section body renderer — dispatches to a hand-built layout for sections with
// real structured reservation data, and to TextCards for the region-sourced
// free-text sections.
// ---------------------------------------------------------------------------
function SectionBody({ sectionKey, r }: { sectionKey: SectionKey; r: WelcomeGuideReservation }) {
  const ci = r.checkinInfo

  if (sectionKey === "bemVindo") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <p className="text-sm leading-relaxed text-foreground">
            Estamos felizes em recebê-lo em {r.propertyName ?? "nossa hospedagem"}. Esperamos que você tenha uma
            estadia inesquecível — e que volte outras vezes!
          </p>
        </div>
        {r.propertyAmenities.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {r.propertyAmenities.slice(0, 4).map((a) => (
              <div
                key={a.key}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-4 text-center shadow-sm"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-cta/15 text-cta">
                  <Sparkles className="size-4" />
                </span>
                <span className="text-xs font-semibold text-foreground">{a.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (sectionKey === "checkin") {
    if (!ci) return <EmptyNote text="As instruções de acesso aparecem aqui assim que a reserva for confirmada." />
    const parkingBullets = ci.parking
      ? ci.parking
          .split(/[.•\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    return (
      <div className="space-y-5">
        {ci.checkInTime && (
          <p className="text-center font-serif text-4xl font-extrabold text-primary">{ci.checkInTime}</p>
        )}
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Respeite o horário de check-in. Se quiser chegar mais cedo, fale com a Sofia e vemos o que dá pra fazer.
        </p>

        {ci.access && (
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary">
                <KeyRound className="size-5" />
              </span>
              <p className="font-serif text-lg font-bold text-primary">Acesso à casa</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{ci.access}</p>
          </div>
        )}

        {ci.doorPassword && (
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cta">Chave de acesso</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              Use a senha <span className="font-semibold">&ldquo;{ci.doorPassword}&rdquo;</span> pra entrar.
            </p>
          </div>
        )}

        {ci.parking && (
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary">
                <span className="text-sm font-extrabold">P</span>
              </span>
              <p className="font-serif text-lg font-bold text-primary">Estacionamento</p>
            </div>
            <ul className="mt-2 space-y-1">
              {(parkingBullets.length > 0 ? parkingBullets : [ci.parking]).map((line, i) => (
                <li key={i} className="flex gap-1.5 text-sm leading-relaxed text-foreground">
                  <span className="text-cta">•</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (sectionKey === "localizacao") {
    const address = r.propertyFullAddress || r.propertyLocation
    const transport = resolveTransportBody(r.propertyLocation, r.propertyFullAddress)
    if (!address) return <EmptyNote text="Em breve." />
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl shadow-sm">
          <iframe
            title="Mapa da localização"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
            className="h-40 w-full border-0"
            loading="lazy"
          />
        </div>
        <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
          <p className="font-serif text-lg font-bold text-primary">Como chegar</p>
          <p className="mt-1 text-sm text-muted-foreground">{address}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground"
          >
            <MapPin className="size-4" /> Abrir no Google Maps
          </a>
        </div>
        {transport && <TextCards body={transport} />}
      </div>
    )
  }

  if (sectionKey === "wifi") {
    if (!ci?.wifiNetwork && !ci?.wifiPassword) {
      return <EmptyNote text="Os dados de Wi-Fi aparecem aqui junto com o restante do acesso." />
    }
    return (
      <div className="space-y-3">
        {ci.wifiNetwork && (
          <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cta">Rede</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{ci.wifiNetwork}</p>
          </div>
        )}
        {ci.wifiPassword && (
          <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cta">Senha</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{ci.wifiPassword}</p>
          </div>
        )}
      </div>
    )
  }

  if (sectionKey === "regras") {
    if (r.propertyHouseRules.length === 0) return <EmptyNote text="Em breve." />
    return (
      <div className="space-y-4">
        <p className="text-center font-serif text-base font-bold text-primary">
          Obrigado por respeitar as regras da casa
        </p>
        <div className="grid grid-cols-2 gap-3">
          {r.propertyHouseRules.map((rule, i) => (
            <div key={i} className="rounded-2xl bg-card p-3.5 shadow-sm">
              <p className="font-serif text-lg font-extrabold text-cta">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (sectionKey === "equipamento") {
    if (r.propertyAmenities.length === 0) return <EmptyNote text="Em breve." />
    return (
      <div className="grid grid-cols-3 gap-3">
        {r.propertyAmenities.map((a) => (
          <div
            key={a.key}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center shadow-sm"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary">
              <Wrench className="size-4" />
            </span>
            <span className="text-[11px] font-medium leading-tight text-foreground">{a.label}</span>
          </div>
        ))}
      </div>
    )
  }

  if (sectionKey === "emergencias") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { n: "192", label: "SAMU" },
            { n: "190", label: "Polícia" },
            { n: "193", label: "Bombeiros" },
          ].map((e) => (
            <div
              key={e.label}
              className="flex flex-col items-center gap-1 rounded-full bg-card p-4 text-center shadow-sm"
            >
              <span className="font-serif text-xl font-extrabold text-primary">{e.n}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {e.label}
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <p className="flex items-center gap-2 font-serif text-sm font-bold text-primary">
            <ShieldAlert className="size-4 text-cta" /> Qualquer urgência na hospedagem
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            Fale com a Sofia — (85) 8141-2023 (WhatsApp), disponível a qualquer hora.
          </p>
        </div>
      </div>
    )
  }

  if (sectionKey === "checkout") {
    const steps = [
      "Reúna suas coisas e confira se não esqueceu nada.",
      "Desligue luzes e aparelhos elétricos.",
      "Descarte o lixo antes de sair.",
      "Feche portas e janelas.",
      "Deixe as chaves no local combinado.",
    ]
    return (
      <div className="space-y-4">
        {ci?.checkOutTime && (
          <p className="text-center font-serif text-4xl font-extrabold text-primary">{ci.checkOutTime}</p>
        )}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <p className="font-serif text-sm font-bold text-primary">Antes de sair</p>
          <div className="mt-2 space-y-2">
            {steps.map((s, i) => (
              <p key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="size-3" />
                </span>
                {s}
              </p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sectionKey === "contato") {
    return (
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-6" />
          </span>
          <div>
            <p className="font-serif text-lg font-bold text-foreground">Sofia</p>
            <p className="text-xs text-muted-foreground">Concierge digital Bomgo</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          Estou aqui pra ajudar em qualquer momento da sua estadia. Encontrou algum problema ou tem alguma dúvida? É
          só me chamar.
        </p>
        <a
          href="https://wa.me/558581412023"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground"
        >
          <Phone className="size-4" /> (85) 8141-2023 — WhatsApp
        </a>
      </div>
    )
  }

  // Region-sourced free-text sections.
  const resolvers: Partial<Record<SectionKey, string | null>> = {
    transportes: resolveTransportBody(r.propertyLocation, r.propertyFullAddress),
    atividades: resolveActivitiesBody(r.propertyLocation, r.propertyFullAddress),
    informacao: resolveInfoBody(r.propertyLocation, r.propertyFullAddress),
    bares: resolveBarsBody(r.propertyLocation, r.propertyFullAddress),
    restaurantes: resolveRestaurantsBody(r.propertyLocation, r.propertyFullAddress),
    compras: resolveShoppingBody(r.propertyLocation, r.propertyFullAddress),
  }
  const body = resolvers[sectionKey]
  if (!body) return <EmptyNote text="Em breve." />
  return <TextCards body={body} />
}

function isSectionAvailable(sectionKey: SectionKey, r: WelcomeGuideReservation): boolean {
  const ci = r.checkinInfo
  switch (sectionKey) {
    case "bemVindo":
    case "emergencias":
    case "contato":
      return true
    case "checkin":
      return Boolean(ci?.checkInTime || ci?.access || ci?.doorPassword || ci?.parking)
    case "localizacao":
      return Boolean(r.propertyFullAddress || r.propertyLocation)
    case "wifi":
      return Boolean(ci?.wifiNetwork || ci?.wifiPassword)
    case "regras":
      return r.propertyHouseRules.length > 0
    case "equipamento":
      return r.propertyAmenities.length > 0
    case "checkout":
      return Boolean(ci?.checkOutTime)
    case "transportes":
      return Boolean(resolveTransportBody(r.propertyLocation, r.propertyFullAddress))
    case "atividades":
      return Boolean(resolveActivitiesBody(r.propertyLocation, r.propertyFullAddress))
    case "informacao":
      return Boolean(resolveInfoBody(r.propertyLocation, r.propertyFullAddress))
    case "bares":
      return Boolean(resolveBarsBody(r.propertyLocation, r.propertyFullAddress))
    case "restaurantes":
      return Boolean(resolveRestaurantsBody(r.propertyLocation, r.propertyFullAddress))
    case "compras":
      return Boolean(resolveShoppingBody(r.propertyLocation, r.propertyFullAddress))
    default:
      return false
  }
}

export function WelcomeGuide({
  reservation,
  onClose,
}: {
  reservation: WelcomeGuideReservation
  onClose: () => void
}) {
  const [stage, setStage] = useState<"intro" | "grid">("intro")
  const [activeKey, setActiveKey] = useState<SectionKey | null>(null)
  const active = SECTIONS.find((s) => s.key === activeKey) ?? null
  const coverImage = reservation.propertyImages[0]?.src ?? null
  const address = reservation.propertyFullAddress || reservation.propertyLocation

  return (
    <div
      className="fixed inset-0 z-[110] bg-[#F7F3EC] sm:flex sm:items-center sm:justify-center sm:bg-black/50 sm:p-6"
      onClick={active ? undefined : onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-[#F7F3EC] sm:h-[85vh] sm:max-h-[760px] sm:w-full sm:max-w-md sm:rounded-3xl sm:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {stage === "intro" && !active ? (
          <>
            <div className="relative flex shrink-0 items-center justify-between px-5 pt-5">
              <span />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-cta">Boas-vindas</p>
              <h2 className="mt-1 font-serif text-3xl font-extrabold leading-tight text-primary">
                Seja muito
                <br />
                bem-vindo(a)
              </h2>
              {address && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-cta" /> {address}
                </p>
              )}
              <div className="mt-6 overflow-hidden rounded-2xl shadow-sm">
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt={reservation.propertyName ?? "Hospedagem"} className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-primary to-[#132a4d]">
                    <Home className="size-12 text-primary-foreground/40" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStage("grid")}
                className="mt-6 w-full rounded-full bg-cta px-6 py-3.5 text-sm font-semibold text-cta-foreground shadow-md"
              >
                Ver guia completo
              </button>
            </div>
          </>
        ) : active ? (
          <>
            <div className="relative shrink-0 bg-gradient-to-br from-primary to-[#132a4d] pb-8 pt-6">
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 text-primary-foreground/70 hover:text-primary-foreground"
              >
                <X className="size-5" />
              </button>
              <div className="px-5">
                <button
                  type="button"
                  onClick={() => setActiveKey(null)}
                  className="mb-3 flex size-10 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-md"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <div className="flex items-center gap-2.5">
                  <active.icon className="size-6 text-cta" />
                  <h2 className="font-serif text-2xl font-extrabold text-primary-foreground">{active.title}</h2>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <SectionBody sectionKey={active.key} r={reservation} />
            </div>
          </>
        ) : (
          <>
            <div className="relative shrink-0 bg-gradient-to-br from-primary to-[#132a4d] px-6 py-7">
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 text-primary-foreground/70 hover:text-primary-foreground"
              >
                <X className="size-5" />
              </button>
              <h2 className="font-serif text-3xl font-extrabold leading-tight text-primary-foreground">
                Guia de
                <br />
                Boas-vindas
              </h2>
              <p className="mt-1.5 text-sm text-primary-foreground/75">Fique, explore e aproveite</p>
              {reservation.propertyName && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs text-primary-foreground/85">
                  <MapPin className="size-3.5" /> {reservation.propertyName}
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="grid grid-cols-3 gap-x-2 gap-y-5">
                {SECTIONS.map((s) => {
                  const available = isSectionAvailable(s.key, reservation)
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setActiveKey(s.key)}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <span
                        className={`flex size-14 items-center justify-center rounded-full shadow-sm ${
                          available ? "bg-cta text-cta-foreground" : "bg-card text-muted-foreground"
                        }`}
                      >
                        <s.icon className="size-6" />
                      </span>
                      <span className="text-[11px] font-semibold leading-tight text-foreground">{s.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
