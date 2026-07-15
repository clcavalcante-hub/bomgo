'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  CreditCard,
  Crown,
  Heart,
  LogOut,
  MapPin,
  Sparkles,
  Ticket,
  User as UserIcon,
} from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'
import { getReservations, type StoredReservation } from '@/lib/services/reservations-store'
import { formatBRL } from '@/lib/pricing'

export function AccountDashboard() {
  const router = useRouter()
  const { user, logout, favorites } = useApp()
  const [reservations, setReservations] = useState<StoredReservation[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReservations(getReservations())
    setReady(true)
  }, [])

  // Client-side guard: no session means the account area is not accessible.
  useEffect(() => {
    if (ready && !user) router.replace('/login?next=/conta')
  }, [ready, user, router])

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
          <span className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
            {user.firstName.charAt(0).toUpperCase()}
          </span>
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
                key={r.code}
                className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-md sm:size-24">
                  <Image src={r.propertyImage} alt={r.propertyName} fill sizes="96px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-primary">Voucher {r.code}</p>
                  <h3 className="mt-0.5 font-serif text-lg font-medium text-foreground">{r.propertyName}</h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-primary" /> {r.location}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" /> {r.checkInLabel} → {r.checkOutLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CreditCard className="size-3.5" /> {r.method === 'pix' ? 'Pix' : 'Cartão'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold text-foreground">{formatBRL(r.total)}</p>
                  <Link
                    href={`/imovel/${r.propertySlug}`}
                    className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    Ver imóvel
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

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
