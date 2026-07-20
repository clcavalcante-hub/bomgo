import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, MessageCircle, Sparkles, TriangleAlert } from "lucide-react"
import { findOtaReservations } from "@/lib/reservations/ota-lookup"
import { formatBRL } from "@/lib/pricing"
import { formatLocalDateLabel } from "@/lib/dates"

// Status labels for the raw Stays `type` field on an OTA reservation — a
// different vocabulary than the internal pre_reserved/confirmed enum used
// for direct-booking reservations, since these come straight from Stays.
const OTA_STATUS_LABEL: Record<string, { label: string; className: string }> = {
  booked: { label: "Confirmada", className: "bg-green-600 text-white" },
  reserved: { label: "Reservado", className: "bg-primary text-primary-foreground" },
  canceled: { label: "Cancelada", className: "bg-destructive text-white" },
}

export default async function MinhaReservaPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; nome?: string }>
}) {
  const { codigo, nome } = await searchParams
  const codigoTrim = codigo?.trim() ?? ""
  const nomeTrim = nome?.trim() ?? ""

  let reservation: Awaited<ReturnType<typeof findOtaReservations>>[number] | null = null
  let searched = false
  let searchError: string | null = null

  if (codigoTrim && nomeTrim) {
    searched = true
    try {
      const matches = await findOtaReservations({ name: nomeTrim })
      reservation =
        matches.find((r) => r.reservationCode?.toUpperCase() === codigoTrim.toUpperCase()) ?? null
    } catch {
      searchError = "Não foi possível consultar sua reserva agora. Tente novamente em instantes."
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-20 pt-24 md:pt-28">
      <div className="mb-6 text-center">
        <p className="inline-flex items-center gap-1 text-xs text-primary">
          <Sparkles className="size-3.5" /> Bomgo Brasil
        </p>
        <h1 className="mt-1 font-serif text-2xl font-medium text-foreground md:text-3xl">Sua reserva</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe sua hospedagem pelo código da reserva — sem precisar criar conta.
        </p>
      </div>

      {!searched && (
        <form className="rounded-md border border-border bg-card p-6" action="/minha-reserva">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Código da reserva</span>
            <input
              name="codigo"
              defaultValue={codigoTrim}
              placeholder="Ex.: NR13J"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Nome completo do titular</span>
            <input
              name="nome"
              defaultValue={nomeTrim}
              placeholder="Como está na reserva"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground"
          >
            Buscar reserva
          </button>
        </form>
      )}

      {searched && searchError && (
        <div className="flex flex-col items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-10 text-center text-sm text-destructive">
          <TriangleAlert className="size-6" />
          <p>{searchError}</p>
          <Link href="/minha-reserva" className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Tentar de novo
          </Link>
        </div>
      )}

      {searched && !searchError && !reservation && (
        <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          <TriangleAlert className="size-6 text-cta" />
          <p>Não encontramos nenhuma reserva com esse código e nome. Confira os dados ou fale com a Sofia.</p>
          <Link href="/minha-reserva" className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            Tentar de novo
          </Link>
        </div>
      )}

      {searched && !searchError && reservation && (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="relative aspect-[4/3]">
            <Image
              src={reservation.propertyImage || "/placeholder.svg"}
              alt={reservation.propertyName ?? "Imóvel"}
              fill
              sizes="480px"
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-lg font-medium text-foreground">{reservation.propertyName ?? "-"}</h2>
              {reservation.status && OTA_STATUS_LABEL[reservation.status] && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${OTA_STATUS_LABEL[reservation.status].className}`}
                >
                  {OTA_STATUS_LABEL[reservation.status].label}
                </span>
              )}
            </div>
            {reservation.propertyLocation && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5 text-primary" /> {reservation.propertyLocation}
              </p>
            )}
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-foreground">
              <CalendarDays className="size-4 text-primary" />
              {formatLocalDateLabel(reservation.checkInDate) ?? "-"} → {formatLocalDateLabel(reservation.checkOutDate) ?? "-"}
            </p>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Código da reserva</span>
                <span className="font-mono font-medium text-foreground">{reservation.reservationCode ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Canal</span>
                <span className="font-medium text-foreground">{reservation.channel}</span>
              </div>
              {typeof reservation.total === "number" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor da reserva</span>
                  <span className="font-medium text-foreground">{formatBRL(reservation.total)}</span>
                </div>
              )}
            </div>

            <p className="mt-4 rounded-md bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
              O status do seu check-in é confirmado diretamente pela Sofia, no WhatsApp.
            </p>

            <a
              href="https://wa.me/558581412023"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-semibold text-cta-foreground"
            >
              <MessageCircle className="size-4" /> Falar com a Sofia
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
