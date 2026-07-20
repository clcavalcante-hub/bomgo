'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  Crown,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  Ticket,
  TriangleAlert,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { formatBRL } from '@/lib/pricing'
import { formatLocalDateLabel } from '@/lib/dates'
import { PaymentSection } from '@/components/checkout/payment-section'
import { processPayment, confirmPix, type PaymentResult } from '@/lib/services/payment-service'
import type { PaymentMethod } from '@/lib/types'

interface CheckinSheetInfo {
  address: string
  access: string
  doorPassword: string
  wifiNetwork: string
  wifiPassword: string
  checkInTime: string
  checkOutTime: string
  parking: string
}

interface GuestCheckinData {
  guestName: string
  cpf: string
  adults: number
  children: number
  companions: string
}

interface ReviewData {
  rating: number
  comment: string
}

interface ApiReservation {
  reservationId: string
  reservationCode: string | null
  staysReservationId: string | null
  externalListingId: string
  partnerId: string | null
  status: string
  checkInDate: string
  checkOutDate: string
  guestsDetails: { adults: number; children: number }
  amount: { nightlyPrice: number; nights: number; subtotal: number; fees: number; total: number }
  checkinInfo: CheckinSheetInfo | null
  guestCheckinData: GuestCheckinData | null
  review: ReviewData | null
  propertyName: string | null
  propertyImage: string | null
  propertyLocation: string | null
  propertyFullAddress: string | null
  propertyHouseRules: string[]
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
// Only these statuses represent money genuinely owed — a cancelled,
// confirmed, completed, or expired reservation must never accept a new
// charge, so "Pague agora" stays disabled outside this set.
const PAYABLE_STATUSES = new Set(['pre_reserved', 'awaiting_payment'])

// Brand color + short label for the channel badge shown on OTA-sourced
// reservation cards. No trademarked logo assets are used — just each
// brand's recognizable color, which is enough for quick visual recognition
// and avoids bundling third-party logo files.
const CHANNEL_STYLE: Record<string, { color: string; label: string }> = {
  'Booking.com': { color: '#003580', label: 'Booking' },
  Airbnb: { color: '#FF385C', label: 'Airbnb' },
  Expedia: { color: '#FFC72C', label: 'Expedia' },
}

export function AccountDashboard() {
  const router = useRouter()
  const { user, authLoading, logout, favorites, openSofia } = useApp()
  const [reservations, setReservations] = useState<ApiReservation[]>([])
  const [ready, setReady] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<ApiReservation | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const [dateChangeTarget, setDateChangeTarget] = useState<ApiReservation | null>(null)
  const [payTarget, setPayTarget] = useState<ApiReservation | null>(null)
  const [payMethod, setPayMethod] = useState<PaymentMethod>('pix')
  const [payResult, setPayResult] = useState<PaymentResult | null>(null)
  const [rebookTarget, setRebookTarget] = useState<ApiReservation | null>(null)
  const [rebookCheckIn, setRebookCheckIn] = useState('')
  const [rebookCheckOut, setRebookCheckOut] = useState('')
  const [rebookQuote, setRebookQuote] = useState<{ total: number; nights: number } | null>(null)
  const [rebookError, setRebookError] = useState<string | null>(null)
  const [rebookLoading, setRebookLoading] = useState(false)
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

  const [swapTarget, setSwapTarget] = useState<ApiReservation | null>(null)
  const [swapping, setSwapping] = useState(false)
  const [swapError, setSwapError] = useState<string | null>(null)

  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [voucherTarget, setVoucherTarget] = useState<ApiReservation | OtaReservation | null>(null)
  const [photoLightbox, setPhotoLightbox] = useState<{ images: { src: string; alt: string }[]; index: number } | null>(
    null,
  )
  const [reviewTarget, setReviewTarget] = useState<ApiReservation | null>(null)
  const [reviewDraftRating, setReviewDraftRating] = useState(0)
  const [reviewDraftComment, setReviewDraftComment] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

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

  async function requestRebookQuote() {
    if (!rebookTarget || !rebookCheckIn || !rebookCheckOut) return
    setRebookError(null)
    setRebookQuote(null)
    setRebookLoading(true)
    try {
      const res = await fetch('/api/stays/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingIds: [rebookTarget.externalListingId],
          from: rebookCheckIn,
          to: rebookCheckOut,
          guests: rebookTarget.guestsDetails.adults + rebookTarget.guestsDetails.children,
        }),
      })
      const data = await res.json().catch(() => null)
      const live = data?.live ? data.prices?.[0] : null
      if (!live || typeof live.total !== 'number') {
        setRebookError('Não conseguimos confirmar o valor para essas datas. Tente outras datas.')
        setRebookLoading(false)
        return
      }
      const nights = Math.round(
        (new Date(rebookCheckOut).getTime() - new Date(rebookCheckIn).getTime()) / 86400000,
      )
      setRebookQuote({ total: live.total, nights })
      setRebookLoading(false)
    } catch {
      setRebookError('Não conseguimos confirmar o valor agora. Tente novamente.')
      setRebookLoading(false)
    }
  }

  async function confirmRebook() {
    if (!rebookTarget || !rebookQuote || !user) return
    setRebookLoading(true)
    setRebookError(null)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `rebook-${rebookTarget.reservationId}-${Date.now()}` },
        body: JSON.stringify({
          listingId: rebookTarget.externalListingId,
          checkInDate: rebookCheckIn,
          checkOutDate: rebookCheckOut,
          guests: rebookTarget.guestsDetails,
          propertyName: rebookTarget.propertyName,
          propertyImage: rebookTarget.propertyImage,
          propertyLocation: rebookTarget.propertyLocation,
          customer: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone ?? undefined,
            document: user.cpf ?? undefined,
          },
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.reservationId) {
        setRebookError(data?.error ?? 'Não foi possível criar a nova reserva agora.')
        setRebookLoading(false)
        return
      }
      setRebookTarget(null)
      setRebookLoading(false)
      await loadReservations()
      // Send the guest straight into payment for the reservation just created.
      setPayResult(null)
      setPayMethod('pix')
      setPayTarget({
        ...rebookTarget,
        reservationId: data.reservationId,
        reservationCode: data.reservationCode ?? null,
        checkInDate: rebookCheckIn,
        checkOutDate: rebookCheckOut,
        status: 'pre_reserved',
        amount: { ...rebookTarget.amount, total: rebookQuote.total, nights: rebookQuote.nights },
      })
    } catch {
      setRebookError('Não foi possível criar a nova reserva agora.')
      setRebookLoading(false)
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

  async function confirmSwap() {
    if (!swapTarget) return
    setSwapping(true)
    setSwapError(null)
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(swapTarget.reservationId)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'guest_property_swap' }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setSwapError(body?.error ?? 'Não foi possível cancelar a reserva atual agora.')
        setSwapping(false)
        return
      }
      router.push('/busca')
    } catch {
      setSwapError('Não foi possível cancelar a reserva atual agora.')
      setSwapping(false)
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

  function canReview(r: ApiReservation) {
    const reviewableStatuses = new Set(['confirmed', 'completed'])
    const today = new Date().toISOString().slice(0, 10)
    return reviewableStatuses.has(r.status) && r.checkOutDate < today
  }

  function openReviewModal(r: ApiReservation) {
    setReviewError(null)
    setReviewDraftRating(r.review?.rating ?? 0)
    setReviewDraftComment(r.review?.comment ?? '')
    setReviewTarget(r)
  }

  async function submitReview() {
    if (!reviewTarget || reviewDraftRating < 1) {
      setReviewError('Escolha uma nota de 1 a 5 estrelas.')
      return
    }
    setReviewSaving(true)
    setReviewError(null)
    try {
      const res = await fetch(`/api/account/reservations/${encodeURIComponent(reviewTarget.reservationId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewDraftRating, comment: reviewDraftComment }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Não deu pra salvar a avaliação agora.')
      const savedReview: ReviewData = body.review
      setReservations((prev) =>
        prev.map((item) =>
          item.reservationId === reviewTarget.reservationId ? { ...item, review: savedReview } : item,
        ),
      )
      setReviewTarget(null)
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Não deu pra salvar a avaliação agora.')
    } finally {
      setReviewSaving(false)
    }
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
                      saved image if the live listing lookup didn't return more.
                      Tapping any photo opens the full-screen lightbox. */}
                  <div className="no-scrollbar relative flex h-48 w-full shrink-0 snap-x snap-mandatory gap-2 overflow-x-auto rounded-md sm:h-32 sm:w-56">
                    {(r.propertyImages.length > 0
                      ? r.propertyImages
                      : [{ src: r.propertyImage || '/placeholder.svg', alt: r.propertyName ?? '' }]
                    ).map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setPhotoLightbox({
                            images:
                              r.propertyImages.length > 0
                                ? r.propertyImages
                                : [{ src: r.propertyImage || '/placeholder.svg', alt: r.propertyName ?? '' }],
                            index: i,
                          })
                        }
                        className="relative h-full w-full shrink-0 snap-start overflow-hidden rounded-md"
                      >
                        <Image src={img.src} alt={img.alt || r.propertyName || ''} fill sizes="224px" className="object-cover" />
                      </button>
                    ))}
                    {r.propertyImages.length > 1 && (
                      <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground shadow">
                        <Camera className="size-3" /> {r.propertyImages.length} fotos
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-xs text-primary">Voucher {r.reservationCode}</p>
                    </div>
                    <h3 className="mt-0.5 font-serif text-lg font-medium text-foreground">{r.propertyName}</h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 text-primary" /> {r.propertyLocation}
                    </p>
                    {r.propertyFullAddress && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{r.propertyFullAddress}</p>
                    )}
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

                    {r.checkinInfo ? (
                      <details className="mt-2 rounded-md bg-secondary/30 px-3 py-2 text-xs text-muted-foreground" open>
                        <summary className="cursor-pointer font-medium text-foreground">
                          Instruções de check-in
                        </summary>
                        {r.status === 'confirmed' || r.status === 'completed' ? (
                          <>
                            <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 leading-relaxed">
                              {r.checkinInfo.access && (
                                <>
                                  <dt className="text-foreground/70">Acesso</dt>
                                  <dd>{r.checkinInfo.access}</dd>
                                </>
                              )}
                              {r.checkinInfo.doorPassword && (
                                <>
                                  <dt className="text-foreground/70">Senha da porta</dt>
                                  <dd>{r.checkinInfo.doorPassword}</dd>
                                </>
                              )}
                              {r.checkinInfo.wifiNetwork && (
                                <>
                                  <dt className="text-foreground/70">Rede Wi-Fi</dt>
                                  <dd>{r.checkinInfo.wifiNetwork}</dd>
                                </>
                              )}
                              {r.checkinInfo.wifiPassword && (
                                <>
                                  <dt className="text-foreground/70">Senha Wi-Fi</dt>
                                  <dd>{r.checkinInfo.wifiPassword}</dd>
                                </>
                              )}
                              {r.checkinInfo.checkInTime && (
                                <>
                                  <dt className="text-foreground/70">Horário check-in</dt>
                                  <dd>{r.checkinInfo.checkInTime}</dd>
                                </>
                              )}
                              {r.checkinInfo.checkOutTime && (
                                <>
                                  <dt className="text-foreground/70">Horário check-out</dt>
                                  <dd>{r.checkinInfo.checkOutTime}</dd>
                                </>
                              )}
                              {r.checkinInfo.parking && (
                                <>
                                  <dt className="text-foreground/70">Estacionamento</dt>
                                  <dd>{r.checkinInfo.parking}</dd>
                                </>
                              )}
                            </dl>
                            {r.propertyHouseRules.length > 0 && (
                              <div className="mt-2 border-t border-border pt-2">
                                <p className="font-medium text-foreground">Regras da casa</p>
                                <p className="mt-1 whitespace-pre-line leading-relaxed">
                                  {r.propertyHouseRules.join('\n\n')}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="mt-1.5 leading-relaxed">
                            Quando sua reserva for confirmada, esses dados aparecerão aqui.
                          </p>
                        )}
                      </details>
                    ) : (
                      r.propertyHouseRules.length > 0 && (
                        <details className="mt-2 rounded-md bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                          <summary className="cursor-pointer font-medium text-foreground">
                            Instruções de check-in e regras da casa
                          </summary>
                          <p className="mt-1.5 whitespace-pre-line leading-relaxed">{r.propertyHouseRules.join('\n\n')}</p>
                        </details>
                      )
                    )}
                    {(r.status === 'pre_reserved' || r.status === 'awaiting_payment' || r.status === 'synchronization_error') && (
                      <Link
                        href={`/pagar?reservationId=${encodeURIComponent(r.reservationId)}&total=${r.amount.total}&propriedade=${encodeURIComponent(r.propertyName ?? '')}`}
                        className="mt-2 flex w-full items-center justify-center rounded-full bg-cta px-4 py-2.5 text-xs font-semibold text-cta-foreground"
                      >
                        Pague agora
                      </Link>
                    )}
                    <Link
                      href="/cancelamento"
                      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Ver política de cancelamento
                    </Link>
                  </div>

                  <div className="text-right text-xs text-muted-foreground sm:self-start">
                    <p>
                      {formatBRL(r.amount.nightlyPrice)} × {r.amount.nights} {r.amount.nights === 1 ? 'diária' : 'diárias'}
                    </p>
                    <p>Subtotal: {formatBRL(r.amount.subtotal)}</p>
                    {r.amount.fees > 0 && <p>Taxas: {formatBRL(r.amount.fees)}</p>}
                    <p className="mt-1 text-sm font-semibold text-foreground">Total: {formatBRL(r.amount.total)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {r.status === 'cancelled' ? (
                    <span className="inline-flex cursor-not-allowed items-center rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                      Fazer check-in
                    </span>
                  ) : (
                    <a
                      href={`https://checkin.bomgobrasil.com/?reserva=${encodeURIComponent(r.reservationCode ?? '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Fazer check-in
                    </a>
                  )}
                  {(r.status === 'cancelled' || r.status === 'expired') ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRebookError(null)
                        setRebookQuote(null)
                        setRebookCheckIn('')
                        setRebookCheckOut('')
                        setRebookTarget(r)
                      }}
                      className="inline-flex items-center rounded-full bg-cta px-3.5 py-1.5 text-xs font-semibold text-cta-foreground transition hover:opacity-90"
                    >
                      Reservar novamente
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!PAYABLE_STATUSES.has(r.status)}
                      onClick={() => {
                        setPayResult(null)
                        setPayMethod('pix')
                        setPayTarget(r)
                      }}
                      className="inline-flex items-center rounded-full bg-cta px-3.5 py-1.5 text-xs font-semibold text-cta-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-100"
                    >
                      Pague agora
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setVoucherTarget(r)}
                    className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary"
                  >
                    Baixar voucher
                  </button>
                  <button
                    type="button"
                    onClick={openSofia}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary"
                  >
                    <MessageCircle className="size-3.5" /> Falar com a Sofia
                  </button>
                  <button
                    type="button"
                    disabled={r.status === 'cancelled'}
                    onClick={() => setTransferModalOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary disabled:cursor-not-allowed disabled:border-transparent disabled:bg-secondary disabled:text-muted-foreground"
                  >
                    <Car className="size-3.5" /> Transfer e passeios
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
                          setSwapTarget(r)
                        }}
                        className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary"
                      >
                        Trocar de hospedagem
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
                  {canReview(r) && (
                    <button
                      type="button"
                      onClick={() => openReviewModal(r)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary"
                    >
                      <Star className="size-3.5" />
                      {r.review ? `Sua nota: ${r.review.rating}/5` : 'Avaliar estadia'}
                    </button>
                  )}
                </div>

                {r.propertyLatitude != null && r.propertyLongitude != null && (
                  <div className="overflow-hidden rounded-md border border-border">
                    <div className="flex items-center justify-between bg-secondary/40 px-3 py-2">
                      <p className="text-xs font-medium text-foreground">Localização</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${r.propertyLatitude},${r.propertyLongitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                      >
                        Abrir no Google Maps
                      </a>
                    </div>
                    <iframe
                      title={`Localização — ${r.propertyName}`}
                      src={`https://www.google.com/maps?q=${r.propertyLatitude},${r.propertyLongitude}&z=14&output=embed`}
                      className="h-32 w-full border-0"
                      loading="lazy"
                    />
                  </div>
                )}
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
                  {CHANNEL_STYLE[r.channel] && (
                    <span
                      className="absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-white shadow"
                      style={{ backgroundColor: CHANNEL_STYLE[r.channel].color }}
                    >
                      {CHANNEL_STYLE[r.channel].label}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {r.channel}
                    </span>
                    {r.reservationCode && (
                      <p className="font-mono text-xs text-primary">Nº {r.channel}: {r.reservationCode}</p>
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
                      onClick={() => setVoucherTarget(r)}
                      className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary"
                    >
                      Baixar voucher
                    </button>
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

      {transferModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setTransferModalOpen(false)}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-primary px-6 py-5 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-cta/90">
                    <Car className="size-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-primary-foreground/70">
                      Parceiro de confiança Bomgo
                    </p>
                    <h2 className="font-serif text-lg font-medium leading-tight">Transfer e passeios</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  aria-label="Fechar"
                  className="text-primary-foreground/70 hover:text-primary-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <h3 className="font-serif text-base font-medium text-foreground">Tinôco Transporte e Turismo</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Transfer aeroporto ↔ hospedagem, city tour e passeios pela região (praias, Canoa Quebrada e mais).
                Indicação de referência e confiança da Bomgo — reserve com antecedência.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <a
                  href="https://wa.me/5585986051988"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <MessageCircle className="size-4" /> WhatsApp — (85) 98605-1988
                </a>
                <a
                  href="tel:+558597676860"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary"
                >
                  (85) 99767-6860 — Delano
                </a>
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground">
                Serviço prestado por parceiro independente — pagamento e condições combinados diretamente com eles.
              </p>
            </div>
          </div>
        </div>
      )}

      {reviewTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={() => !reviewSaving && setReviewTarget(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="font-serif text-lg font-medium text-foreground">Como foi a sua estadia?</h2>
              <button
                type="button"
                onClick={() => !reviewSaving && setReviewTarget(null)}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{reviewTarget.propertyName}</p>

            <div className="mt-4 flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewDraftRating(n)}
                  aria-label={`${n} estrela(s)`}
                  className="p-0.5"
                >
                  <Star
                    className={`size-8 ${n <= reviewDraftRating ? 'fill-cta text-cta' : 'text-border'}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewDraftComment}
              onChange={(e) => setReviewDraftComment(e.target.value)}
              placeholder="Conte como foi (opcional)"
              rows={3}
              className="mt-4 w-full resize-none rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />

            {reviewError && <p className="mt-2 text-xs text-destructive">{reviewError}</p>}

            <button
              type="button"
              onClick={submitReview}
              disabled={reviewSaving}
              className="mt-4 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {reviewSaving ? 'Enviando…' : reviewTarget.review ? 'Atualizar avaliação' : 'Enviar avaliação'}
            </button>
          </div>
        </div>
      )}

      {photoLightbox && (
        <div className="fixed inset-0 z-[110] flex flex-col bg-primary/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4 text-primary-foreground">
            <span className="text-sm">
              {photoLightbox.index + 1} / {photoLightbox.images.length}
            </span>
            <button
              type="button"
              onClick={() => setPhotoLightbox(null)}
              aria-label="Fechar galeria"
              className="flex size-10 items-center justify-center rounded-full hover:bg-primary-foreground/10"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
            <button
              type="button"
              onClick={() =>
                setPhotoLightbox((s) =>
                  s ? { ...s, index: (s.index - 1 + s.images.length) % s.images.length } : s,
                )
              }
              aria-label="Foto anterior"
              className="absolute left-4 hidden size-11 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 sm:flex"
            >
              <ChevronLeft className="size-6" />
            </button>
            <div className="relative h-full max-h-[75vh] w-full max-w-4xl">
              <Image
                src={photoLightbox.images[photoLightbox.index].src || '/placeholder.svg'}
                alt={photoLightbox.images[photoLightbox.index].alt || ''}
                fill
                sizes="100vw"
                className="rounded-md object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setPhotoLightbox((s) => (s ? { ...s, index: (s.index + 1) % s.images.length } : s))
              }
              aria-label="Próxima foto"
              className="absolute right-4 hidden size-11 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 sm:flex"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>
      )}

      {voucherTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8"
          onClick={() => setVoucherTarget(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div id="voucher-print-area">
              <div className="relative bg-primary px-6 py-5 text-primary-foreground">
                <button
                  type="button"
                  onClick={() => setVoucherTarget(null)}
                  aria-label="Fechar"
                  className="absolute right-4 top-4 text-primary-foreground/70 hover:text-primary-foreground print:hidden"
                >
                  <X className="size-5" />
                </button>
                {'channel' in voucherTarget && CHANNEL_STYLE[voucherTarget.channel] ? (
                  <span
                    className="absolute left-4 top-4 rounded px-2 py-1 text-[10px] font-bold text-white shadow"
                    style={{ backgroundColor: CHANNEL_STYLE[voucherTarget.channel].color }}
                  >
                    {CHANNEL_STYLE[voucherTarget.channel].label}
                  </span>
                ) : (
                  <span className="absolute left-4 top-4 rounded bg-cta/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    Reserva Direta Bomgo
                  </span>
                )}
                <p className="pt-6 font-serif text-lg font-semibold">Bomgo</p>
                <p className="font-mono text-xs text-primary-foreground/80">Voucher {voucherTarget.reservationCode}</p>
              </div>

              <div className="px-6 py-5">
                <div className="mb-4 flex gap-3">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={voucherTarget.propertyImage || '/placeholder.svg'}
                      alt={voucherTarget.propertyName ?? ''}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-medium text-foreground">{voucherTarget.propertyName}</h3>
                    <p className="text-sm text-muted-foreground">{voucherTarget.propertyLocation}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {('propertyFullAddress' in voucherTarget && voucherTarget.propertyFullAddress) ||
                        ('checkinInfo' in voucherTarget && voucherTarget.checkinInfo?.address) ||
                        ''}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Check-in</dt>
                    <dd className="font-medium text-foreground">
                      {voucherTarget.checkInDate ? formatLocalDateLabel(voucherTarget.checkInDate) : '—'}
                      {'checkinInfo' in voucherTarget && voucherTarget.checkinInfo?.checkInTime && (
                        <> · {voucherTarget.checkinInfo.checkInTime}</>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Check-out</dt>
                    <dd className="font-medium text-foreground">
                      {voucherTarget.checkOutDate ? formatLocalDateLabel(voucherTarget.checkOutDate) : '—'}
                      {'checkinInfo' in voucherTarget && voucherTarget.checkinInfo?.checkOutTime && (
                        <> · {voucherTarget.checkinInfo.checkOutTime}</>
                      )}
                    </dd>
                  </div>
                  {'guestCheckinData' in voucherTarget && voucherTarget.guestCheckinData && (
                    <>
                      <div>
                        <dt className="text-xs text-muted-foreground">Hóspede (check-in)</dt>
                        <dd className="font-medium text-foreground">{voucherTarget.guestCheckinData.guestName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Hóspedes</dt>
                        <dd className="font-medium text-foreground">
                          {voucherTarget.guestCheckinData.adults} adulto(s)
                          {voucherTarget.guestCheckinData.children > 0 &&
                            `, ${voucherTarget.guestCheckinData.children} criança(s)`}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>

                {'checkinInfo' in voucherTarget && voucherTarget.checkinInfo && (
                  <div className="mt-4 rounded-md bg-secondary/30 px-3 py-2.5 text-xs text-muted-foreground">
                    <p className="mb-1.5 font-medium text-foreground">Acesso</p>
                    {!('status' in voucherTarget) || voucherTarget.status === 'confirmed' || voucherTarget.status === 'completed' ? (
                      <>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 leading-relaxed">
                          {voucherTarget.checkinInfo.access && (
                            <>
                              <dt className="text-foreground/70">Acesso</dt>
                              <dd>{voucherTarget.checkinInfo.access}</dd>
                            </>
                          )}
                          {voucherTarget.checkinInfo.doorPassword && (
                            <>
                              <dt className="text-foreground/70">Senha da porta</dt>
                              <dd>{voucherTarget.checkinInfo.doorPassword}</dd>
                            </>
                          )}
                          {voucherTarget.checkinInfo.wifiNetwork && (
                            <>
                              <dt className="text-foreground/70">Rede Wi-Fi</dt>
                              <dd>{voucherTarget.checkinInfo.wifiNetwork}</dd>
                            </>
                          )}
                          {voucherTarget.checkinInfo.wifiPassword && (
                            <>
                              <dt className="text-foreground/70">Senha Wi-Fi</dt>
                              <dd>{voucherTarget.checkinInfo.wifiPassword}</dd>
                            </>
                          )}
                          {voucherTarget.checkinInfo.parking && (
                            <>
                              <dt className="text-foreground/70">Estacionamento</dt>
                              <dd>{voucherTarget.checkinInfo.parking}</dd>
                            </>
                          )}
                        </dl>
                        {'propertyHouseRules' in voucherTarget && voucherTarget.propertyHouseRules.length > 0 && (
                          <div className="mt-2 border-t border-border pt-2">
                            <p className="font-medium text-foreground">Regras da casa</p>
                            <p className="mt-1 whitespace-pre-line leading-relaxed">
                              {voucherTarget.propertyHouseRules.join('\n\n')}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="leading-relaxed">Quando sua reserva for confirmada, esses dados aparecerão aqui.</p>
                    )}
                  </div>
                )}

                {'amount' in voucherTarget && voucherTarget.amount && 'nights' in voucherTarget.amount && (
                  <div className="mt-4 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        {formatBRL(voucherTarget.amount.nightlyPrice)} × {voucherTarget.amount.nights}{' '}
                        {voucherTarget.amount.nights === 1 ? 'diária' : 'diárias'}
                      </span>
                      <span>{formatBRL(voucherTarget.amount.subtotal)}</span>
                    </div>
                    {voucherTarget.amount.fees > 0 && (
                      <div className="mt-1 flex justify-between text-muted-foreground">
                        <span>Taxas</span>
                        <span>{formatBRL(voucherTarget.amount.fees)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between text-base font-semibold text-foreground">
                      <span>Total</span>
                      <span>{formatBRL(voucherTarget.amount.total)}</span>
                    </div>
                  </div>
                )}
                {'total' in voucherTarget && voucherTarget.total != null && (
                  <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatBRL(voucherTarget.total)}</span>
                  </div>
                )}

                <div className="mt-4 rounded-md bg-secondary/30 px-3 py-2.5 text-xs">
                  <p className="font-medium text-foreground">Contato</p>
                  <p className="mt-0.5 text-muted-foreground">Sofia — (85) 8141-2023 (WhatsApp)</p>
                </div>

                <Link
                  href="/cancelamento"
                  className="mt-4 inline-block text-xs font-medium text-primary hover:underline print:hidden"
                >
                  Ver política de cancelamento
                </Link>

                <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                  Documento gerado pela Bomgo Brasil Serviços de Hospedagem.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3 print:hidden">
              <button
                type="button"
                onClick={() => setVoucherTarget(null)}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:border-primary"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Imprimir / salvar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {swapTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={() => !swapping && setSwapTarget(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <TriangleAlert className="size-6 text-cta" />
              <button
                type="button"
                onClick={() => !swapping && setSwapTarget(null)}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <h2 className="mt-3 font-serif text-lg font-medium text-foreground">Trocar de hospedagem?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Isso cancela sua reserva atual em <b>{swapTarget.propertyName}</b> (sujeita à política de
              cancelamento do imóvel) e te leva pra escolher outro. A nova reserva é um pagamento separado.
            </p>
            {swapError && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{swapError}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setSwapTarget(null)}
                disabled={swapping}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary disabled:opacity-60"
              >
                Manter reserva
              </button>
              <button
                type="button"
                onClick={confirmSwap}
                disabled={swapping}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                {swapping ? <Loader2 className="size-4 animate-spin" /> : 'Cancelar e escolher outra'}
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

      {rebookTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => !rebookLoading && setRebookTarget(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-lg font-medium text-foreground">Reservar novamente</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{rebookTarget.propertyName}</p>
              </div>
              <button
                type="button"
                onClick={() => !rebookLoading && setRebookTarget(null)}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-medium text-foreground">Check-in</span>
                <input
                  type="date"
                  value={rebookCheckIn}
                  onChange={(e) => {
                    setRebookCheckIn(e.target.value)
                    setRebookQuote(null)
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-foreground">Check-out</span>
                <input
                  type="date"
                  value={rebookCheckOut}
                  onChange={(e) => {
                    setRebookCheckOut(e.target.value)
                    setRebookQuote(null)
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>

            {rebookError && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{rebookError}</p>
            )}

            {!rebookQuote ? (
              <button
                type="button"
                onClick={requestRebookQuote}
                disabled={rebookLoading || !rebookCheckIn || !rebookCheckOut}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
              >
                {rebookLoading ? <Loader2 className="size-4 animate-spin" /> : 'Calcular valor'}
              </button>
            ) : (
              <>
                <div className="mt-4 rounded-md bg-secondary/40 p-3 text-sm">
                  <div className="flex justify-between text-foreground">
                    <span>
                      {rebookQuote.nights} {rebookQuote.nights === 1 ? 'diária' : 'diárias'}
                    </span>
                    <span className="font-semibold">{formatBRL(rebookQuote.total)}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRebookQuote(null)}
                    disabled={rebookLoading}
                    className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground disabled:opacity-60"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={confirmRebook}
                    disabled={rebookLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {rebookLoading ? <Loader2 className="size-4 animate-spin" /> : 'Reservar e pagar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {payTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setPayTarget(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-lg font-medium text-foreground">Pague agora</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{payTarget.propertyName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPayTarget(null)}
                aria-label="Fechar"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4">
              <PaymentSection
                total={payTarget.amount.total}
                method={payMethod}
                onMethodChange={setPayMethod}
                onPay={async (input) => {
                  const res = await processPayment(input)
                  setPayResult(res)
                  if (res.status === 'approved') {
                    setPayTarget(null)
                    void loadReservations()
                  }
                  return res
                }}
                onPixConfirmed={async (transactionId) => {
                  const res = await confirmPix(transactionId, payTarget.reservationId)
                  setPayResult(res)
                  if (res.status === 'approved') {
                    setPayTarget(null)
                    void loadReservations()
                  }
                }}
                result={payResult}
                reservationId={payTarget.reservationId}
              />
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
  pre_reserved: { label: 'Reservado', className: 'bg-primary text-primary-foreground' },
  awaiting_payment: { label: 'Aguardando pagamento', className: 'bg-cta text-white' },
  confirmed: { label: 'Confirmada', className: 'bg-green-600 text-white' },
  cancelled: { label: 'Cancelada', className: 'bg-destructive text-white' },
  expired: { label: 'Expirada', className: 'bg-destructive text-white' },
  completed: { label: 'Concluída', className: 'bg-secondary text-muted-foreground' },
  synchronization_error: { label: 'Verificando…', className: 'bg-secondary text-muted-foreground' },
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_LABEL[status] ?? { label: status, className: 'bg-secondary text-muted-foreground' }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  )
}
