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

interface OtaReservation {
  staysReservationId: string
  reservationCode: string | null
  propertyName: string | null
  propertyImage: string | null
  propertyLocation: string | null
  checkInDate: string | null
  checkOutDate: string | null
  total: number | null
  currency: string | null
  channel: string
}

const CANCELLABLE_STATUSES = new Set(['pre_reserved', 'awaiting_payment', 'confirmed'])

// All current inventory is in the Fortaleza/Aquiraz area — Pinto Martins is
// the only relevant airport, so it's hardcoded rather than built as a
// per-property lookup. Revisit if Bomgo expands to another city.
const FORTALEZA_AIRPORT = { lat: -3.776254, lng: -38.532556 }

export function AccountDashboard() {
  const router = useRouter()
  const { user, authLoading, logout, favorites, openSofia } = useApp()
  const [reservations, setReservations] = useState<ApiReservation[]>([])
  const [ready, setReady] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<ApiReservation | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const [dateChangeTarget, setDateChangeTarget] = useState<ApiReservation | null>(null)
  const [newCheckIn, setNewCheckIn] = useState('')
  const [newCheckOut, setNewCheckOut] = useState('')
  const [dateQuote, setDateQuote] = useState<{ newTotal: number; previousTotal: number; difference: number } | null>(
    null,
  )
  const [quoting, setQuoting] = useState(false)
  const [dateChangeError, setDateChangeError] = useState<string | null>(null)
  const [diffCard, setDiffCard] = useState({ number: '', holder: '', expiry: '', cvv: '' })
  const [payingDiff, setPayingDiff] = useState(false)
  const [applyingDateChange, setApplyingDateChange] = useState(false)

  const [otaReservations, setOtaReservations] = useState<OtaReservation[]>([])
  const [otaReady, setOtaReady] = useState(false)
  const [otaSearchOpen, setOtaSearchOpen] = useState(false)
  const [otaFullName, setOtaFullName] = useState('')
  const [otaCode, setOtaCode] = useState('')
  const [otaSearching, setOtaSearching] = useState(false)
  const [otaSearchError, setOtaSearchError] = useState<string | null>(null)

  function loadReservations() {
    return fetch('/api/account/reservations')
      .then((res) => (res.ok ? res.json() : { reservations: [] }))
      .then((body) => setReservations(body.reservations ?? []))
      .catch(() => setReservations([]))
  }

  function loadOtaReservations() {
    return fetch('/api/account/ota-reservations')
      .then((res) => (res.ok ? res.json() : { reservations: [] }))
      .then((body) => setOtaReservations(body.reservations ?? []))
      .catch(() => setOtaReservations([]))
  }

  useEffect(() => {
    loadReservations().finally(() => setReady(true))
    loadOtaReservations().finally(() => setOtaReady(true))
  }, [])

  async function submitOtaSearch(e: React.FormEvent) {
    e.preventDefault()
    setOtaSearchError(null)
    setOtaSearching(true)
    try {
      const res = await fetch('/api/account/ota-reservations/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: otaFullName, code: otaCode || undefined }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setOtaSearchError(data?.error ?? 'Não foi possível buscar agora. Tente novamente.')
        setOtaSearching(false)
        return
      }
      await loadOtaReservations()
      setOtaSearching(false)
      setOtaSearchOpen(false)
      setOtaFullName('')
      setOtaCode('')
    } catch {
      setOtaSearchError('Não foi possível buscar agora. Tente novamente.')
      setOtaSearching(false)
    }
  }

  async function requestQuote() {
    if (!dateChangeTarget || !newCheckIn || !newCheckOut) return
    setDateChangeError(null)
    setDateQuote(null)
    setQuoting(true)
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(dateChangeTarget.reservationId)}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInDate: newCheckIn, checkOutDate: newCheckOut }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setDateChangeError(data?.error ?? 'Não foi possível calcular o novo valor agora.')
        setQuoting(false)
        return
      }
      setDateQuote({
        newTotal: data.newAmount.total,
        previousTotal: data.previousTotal,
        difference: data.difference,
      })
      setQuoting(false)
    } catch {
      setDateChangeError('Não foi possível calcular o novo valor agora.')
      setQuoting(false)
    }
  }

  async function commitDateChange() {
    if (!dateChangeTarget) return
    setApplyingDateChange(true)
    setDateChangeError(null)
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(dateChangeTarget.reservationId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInDate: newCheckIn, checkOutDate: newCheckOut }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setDateChangeError(body?.error ?? 'Não foi possível confirmar a alteração agora.')
        setApplyingDateChange(false)
        return
      }
      setDateChangeTarget(null)
      setApplyingDateChange(false)
      await loadReservations()
    } catch {
      setDateChangeError('Não foi possível confirmar a alteração agora.')
      setApplyingDateChange(false)
    }
  }

  async function payDifferenceAndCommit() {
    if (!dateChangeTarget || !dateQuote) return
    setPayingDiff(true)
    setDateChangeError(null)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'card',
          amount: dateQuote.difference,
          installments: 1,
          cardNumber: diffCard.number,
          holder: diffCard.holder,
          expiry: diffCard.expiry,
          cvv: diffCard.cvv,
          reservationId: dateChangeTarget.reservationId,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || data?.status !== 'approved') {
        setDateChangeError(data?.message ?? 'Pagamento da diferença recusado. Tente outro cartão.')
        setPayingDiff(false)
        return
      }
      setPayingDiff(false)
      await commitDateChange()
    } catch {
      setDateChangeError('Não foi possível processar o pagamento agora.')
      setPayingDiff(false)
    }
  }

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
                  <div className="overflow-hidden rounded-md border border-border">
                    <div className="flex items-center justify-between bg-secondary/40 px-3 py-2">
                      <p className="text-xs font-medium text-foreground">
                        Como chegar — Aeroporto de Fortaleza (Pinto Martins) → {r.propertyName}
                      </p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${FORTALEZA_AIRPORT.lat},${FORTALEZA_AIRPORT.lng}&destination=${r.propertyLatitude},${r.propertyLongitude}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                      >
                        Abrir no Google Maps
                      </a>
                    </div>
                    <iframe
                      title={`Rota — ${r.propertyName}`}
                      src={`https://www.google.com/maps?saddr=${FORTALEZA_AIRPORT.lat},${FORTALEZA_AIRPORT.lng}&daddr=${r.propertyLatitude},${r.propertyLongitude}&output=embed`}
                      className="h-40 w-full border-0"
                      loading="lazy"
                    />
                  </div>
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
                          setDateChangeError(null)
                          setDateQuote(null)
                          setNewCheckIn(r.checkInDate)
                          setNewCheckOut(r.checkOutDate)
                          setDateChangeTarget(r)
                        }}
                        className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary"
                      >
                        Trocar data / adicionar diária
                      </button>
                    )}
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

      {/* OTA-sourced reservations — read-only, found by matching this
          account's email/phone against Stays, or manually linked below. */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-medium text-foreground">Reservas em outros sites</h2>
          <button
            type="button"
            onClick={() => setOtaSearchOpen((o) => !o)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {otaSearchOpen ? 'Fechar busca' : 'Não achou sua reserva? Buscar'}
          </button>
        </div>

        {otaSearchOpen && (
          <form
            onSubmit={submitOtaSearch}
            className="mt-3 flex flex-col gap-3 rounded-md border border-border bg-secondary/30 p-4 sm:flex-row sm:items-end"
          >
            <label className="flex-1">
              <span className="mb-1 block text-xs font-medium text-foreground">Nome completo do titular</span>
              <input
                value={otaFullName}
                onChange={(e) => setOtaFullName(e.target.value)}
                required
                placeholder="Como está na reserva"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="sm:w-48">
              <span className="mb-1 block text-xs font-medium text-foreground">Código (opcional)</span>
              <input
                value={otaCode}
                onChange={(e) => setOtaCode(e.target.value)}
                placeholder="Ex: HM2QNZPDN1"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              disabled={otaSearching}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
            >
              {otaSearching ? <Loader2 className="size-4 animate-spin" /> : 'Buscar'}
            </button>
          </form>
        )}
        {otaSearchError && (
          <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{otaSearchError}</p>
        )}

        {otaReady && otaReservations.length === 0 && !otaSearchOpen && (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhuma reserva de Booking.com, Airbnb ou Expedia encontrada com seu e-mail de login.
          </p>
        )}

        {otaReservations.length > 0 && (
          <ul className="mt-4 flex flex-col gap-4">
            {otaReservations.map((r) => (
              <li
                key={r.staysReservationId}
                className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md sm:size-24">
                  <Image
                    src={r.propertyImage || '/placeholder.svg'}
                    alt={r.propertyName ?? ''}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {r.channel}
                    </span>
                    {r.reservationCode && (
                      <p className="font-mono text-xs text-primary">{r.reservationCode}</p>
                    )}
                  </div>
                  <h3 className="mt-0.5 font-serif text-lg font-medium text-foreground">{r.propertyName}</h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-primary" /> {r.propertyLocation}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {r.checkInDate && r.checkOutDate && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {formatLocalDateLabel(r.checkInDate)} → {formatLocalDateLabel(r.checkOutDate)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
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
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Reserva feita pela {r.channel} — cancelamentos e alterações de data só podem ser feitos lá.
                  </p>
                </div>
                {r.total != null && (
                  <div className="text-right sm:self-start">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold text-foreground">{formatBRL(r.total)}</p>
                  </div>
                )}
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

      {dateChangeTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => !quoting && !payingDiff && !applyingDateChange && setDateChangeTarget(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="font-serif text-lg font-medium text-foreground">Trocar data / adicionar diária</h2>
              <button
                type="button"
                onClick={() => setDateChangeTarget(null)}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{dateChangeTarget.propertyName}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-medium text-foreground">Check-in</span>
                <input
                  type="date"
                  value={newCheckIn}
                  onChange={(e) => {
                    setNewCheckIn(e.target.value)
                    setDateQuote(null)
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-foreground">Check-out</span>
                <input
                  type="date"
                  value={newCheckOut}
                  onChange={(e) => {
                    setNewCheckOut(e.target.value)
                    setDateQuote(null)
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>

            {dateChangeError && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{dateChangeError}</p>
            )}

            {!dateQuote ? (
              <button
                type="button"
                onClick={requestQuote}
                disabled={quoting || !newCheckIn || !newCheckOut}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                {quoting ? <Loader2 className="size-4 animate-spin" /> : 'Calcular novo valor'}
              </button>
            ) : (
              <div className="mt-4 rounded-md bg-secondary/40 p-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Valor já pago</span>
                  <span>{formatBRL(dateQuote.previousTotal)}</span>
                </div>
                <div className="mt-1 flex justify-between font-medium text-foreground">
                  <span>Novo valor</span>
                  <span>{formatBRL(dateQuote.newTotal)}</span>
                </div>
                <div className="mt-2 border-t border-border pt-2">
                  {dateQuote.difference > 0 ? (
                    <p className="text-xs text-foreground">
                      Diferença a pagar: <b>{formatBRL(dateQuote.difference)}</b>
                    </p>
                  ) : dateQuote.difference < 0 ? (
                    <p className="text-xs text-muted-foreground">
                      O novo valor é {formatBRL(Math.abs(dateQuote.difference))} menor. Não processamos reembolso
                      automático dessa diferença — nossa equipe entra em contato pelo WhatsApp.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem diferença de valor.</p>
                  )}
                </div>

                {dateQuote.difference > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    <input
                      placeholder="Número do cartão"
                      value={diffCard.number}
                      onChange={(e) => setDiffCard((c) => ({ ...c, number: e.target.value }))}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <input
                      placeholder="Nome impresso no cartão"
                      value={diffCard.holder}
                      onChange={(e) => setDiffCard((c) => ({ ...c, holder: e.target.value }))}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="MM/AAAA"
                        value={diffCard.expiry}
                        onChange={(e) => setDiffCard((c) => ({ ...c, expiry: e.target.value }))}
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <input
                        placeholder="CVV"
                        value={diffCard.cvv}
                        onChange={(e) => setDiffCard((c) => ({ ...c, cvv: e.target.value }))}
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDateQuote(null)}
                    disabled={payingDiff || applyingDateChange}
                    className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-60"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={dateQuote.difference > 0 ? payDifferenceAndCommit : commitDateChange}
                    disabled={payingDiff || applyingDateChange}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {payingDiff || applyingDateChange ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : dateQuote.difference > 0 ? (
                      'Pagar diferença e confirmar'
                    ) : (
                      'Confirmar alteração'
                    )}
                  </button>
                </div>
              </div>
            )}
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
