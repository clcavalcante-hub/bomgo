'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Crown,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  Sparkles,
  Ticket,
  TriangleAlert,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { formatBRL } from '@/lib/pricing'
import { formatLocalDateLabel } from '@/lib/dates'

interface ApiReservation {
  reservationId: string
  reservationCode: string | null
  status: string
  checkInDate: string
  checkOutDate: string
  amount: { total: number }
  propertyName: string | null
  propertyImage: string | null
  propertyLocation: string | null
  propertyImages: { src: string; alt: string }[]
  propertyAmenities: { key: string; label: string }[]
  propertyLatitude: number | null
  propertyLongitude: number | null
}

const CANCELLABLE_STATUSES = new Set(['pre_reserved', 'awaiting_payment', 'confirmed'])

export function AccountDashboard() {
  const router = useRouter()
  const { user, authLoading, logout, favorites, openSofia } = useApp()
  const [reservations, setReservations] = useState<ApiReservation[]>([])
  const [ready, setReady] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<ApiReservation | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  function loadReservations() {
    return fetch('/api/account/reservations')
      .then((res) => (res.ok ? res.json() : { reservations: [] }))
      .then((body) => setReservations(body.reservations ?? []))
      .catch(() => setReservations([]))
  }

  useEffect(() => {
    loadReservations().finally(() => setReady(true))
  }, [])

  async function confirmCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    setCancelError(null)
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(cancelTarget.reservationId)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'guest_requested' }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setCancelError(body?.error ?? 'Não foi possível cancelar agora. Tente novamente.')
        setCancelling(false)
        return
      }
      setCancelTarget(null)
      setCancelling(false)
      await loadReservations()
    } catch {
      setCancelError('Não foi possível cancelar agora. Tente novamente.')
      setCancelling(false)
    }
  }

  // Client-side guard: no session means the account area is not accessible.
  useEffect(() => {
    if (ready && !authLoading && !user) router.replace('/login?next=/conta')
  }, [ready, authLoading, user, router])

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <UserIcon className="size-10 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-2xl font-medium text-foreground">Acesse sua conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecionando para o login...
        </p>
      </div>
    )
  }

  function handleLogout() {
    logout()
    router.push('/')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 md:px-6 md:pt-28">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.firstName}
              className="size-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {user.firstName.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              Olá, {user.firstName}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.isClubMember && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-medium text-gold-foreground">
              <Crown className="size-3.5 text-gold" /> Membro Clube Bomgo
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Ticket} label="Reservas" value={String(reservations.length)} />
        <StatCard icon={Heart} label="Favoritos" value={String(favorites.length)} href="/favoritos" />
        <StatCard
          icon={Crown}
          label="Clube Bomgo"
          value={user.isClubMember ? 'Ativo' : 'Inativo'}
          href="/clube"
        />
      </div>

      {/* Reservations */}
      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium text-foreground">Minhas reservas</h2>
        {reservations.length === 0 ? (
          <div className="mt-4 flex flex-col items-center rounded-md border border-dashed border-border bg-secondary/30 px-6 py-12 text-center">
            <CalendarDays className="size-9 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">Você ainda não tem reservas</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Quando concluir uma reserva, ela aparece aqui com o voucher e todos os detalhes.
            </p>
            <Link
              href="/busca"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Explorar hospedagens
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {reservations.map((r) => (
              <li
                key={r.reservationId}
                className="flex flex-col gap-4 rounded-md border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Gallery — swipeable on mobile, falls back to the single
                      saved image if the live listing lookup didn't return more. */}
                  <div className="no-scrollbar flex h-48 w-full shrink-0 snap-x snap-mandatory gap-2 overflow-x-auto rounded-md sm:h-32 sm:w-56">
                    {(r.propertyImages.length > 0
                      ? r.propertyImages
                      : [{ src: r.propertyImage || '/placeholder.svg', alt: r.propertyName ?? '' }]
                    ).map((img, i) => (
                      <div key={i} className="relative h-full w-full shrink-0 snap-start overflow-hidden rounded-md">
                        <Image src={img.src} alt={img.alt || r.propertyName || ''} fill sizes="224px" className="object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs text-primary">Voucher {r.reservationCode}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <h3 className="mt-0.5 font-serif text-lg font-medium text-foreground">{r.propertyName}</h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 text-primary" /> {r.propertyLocation}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {formatLocalDateLabel(r.checkInDate)} → {formatLocalDateLabel(r.checkOutDate)}
                      </span>
                    </div>

                    {r.propertyAmenities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.propertyAmenities.slice(0, 6).map((a) => (
                          <span
                            key={a.key}
                            className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground"
                          >
                            {a.label}
                          </span>
                        ))}
                        {r.propertyAmenities.length > 6 && (
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                            +{r.propertyAmenities.length - 6}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right sm:self-start">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold text-foreground">{formatBRL(r.amount.total)}</p>
                  </div>
                </div>

                {r.propertyLatitude != null && r.propertyLongitude != null && (
                  <iframe
                    title={`Mapa — ${r.propertyName}`}
                    src={`https://www.google.com/maps?q=${r.propertyLatitude},${r.propertyLongitude}&z=15&output=embed`}
                    className="h-40 w-full rounded-md border-0"
                    loading="lazy"
                  />
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <a
                    href={`https://checkin.bomgobrasil.com/?reserva=${encodeURIComponent(r.reservationCode ?? '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Fazer check-in
                  </a>
                  <button
                    type="button"
                    onClick={openSofia}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary"
                  >
                    <MessageCircle className="size-3.5" /> Falar com a Sofia
                  </button>
                  {CANCELLABLE_STATUSES.has(r.status) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCancelError(null)
                        setCancelTarget(r)
                      }}
                      className="inline-flex items-center rounded-full border border-destructive/30 px-3.5 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/5"
                    >
                      Cancelar reserva
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {cancelTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={() => !cancelling && setCancelTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <TriangleAlert className="size-6 text-destructive" />
              <button
                type="button"
                onClick={() => !cancelling && setCancelTarget(null)}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <h2 className="mt-3 font-serif text-lg font-medium text-foreground">Cancelar esta reserva?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dependendo da política da hospedagem, o cancelamento pode estar sujeito a uma taxa ou não ser
              reembolsável — a Bomgo não cobra taxa própria, mas as condições do imóvel se aplicam. Essa ação não
              pode ser desfeita.
            </p>
            {cancelError && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{cancelError}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary disabled:opacity-60"
              >
                Manter reserva
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                disabled={cancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {cancelling ? <Loader2 className="size-4 animate-spin" /> : 'Sim, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sofia nudge */}
      <p className="mt-10 rounded-md bg-secondary/50 px-5 py-4 text-center text-sm text-muted-foreground">
        <Sparkles className="mr-1 inline size-4 text-cta" />
        Precisa remarcar ou organizar um passeio? A Sofia cuida de tudo pelo chat.
      </p>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
}) {
  const inner = (
    <div className="flex items-center gap-4 rounded-md border border-border bg-card p-5 transition-shadow hover:shadow-lg hover:shadow-primary/5">
      <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pre_reserved: { label: 'Reservado', className: 'bg-primary/10 text-primary' },
  awaiting_payment: { label: 'Aguardando pagamento', className: 'bg-cta/15 text-cta' },
  confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada', className: 'bg-secondary text-muted-foreground' },
  expired: { label: 'Expirada', className: 'bg-secondary text-muted-foreground' },
  completed: { label: 'Concluída', className: 'bg-secondary text-muted-foreground' },
  synchronization_error: { label: 'Verificando…', className: 'bg-secondary text-muted-foreground' },
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_LABEL[status] ?? { label: status, className: 'bg-secondary text-muted-foreground' }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  )
}
