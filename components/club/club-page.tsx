'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BadgePercent, CalendarClock, Crown, Gift, Headphones, Sparkles, Tag } from 'lucide-react'
import { useApp } from '@/components/providers/app-providers'

const benefits = [
  {
    icon: Tag,
    title: 'Preço Clube exclusivo',
    description: 'Tarifas reduzidas em toda a rede Reserva Direta Bomgo e parceiros oficiais.',
  },
  {
    icon: BadgePercent,
    title: 'Descontos progressivos',
    description: 'Quanto mais você viaja, maior o desconto acumulado nas próximas estadias.',
  },
  {
    icon: CalendarClock,
    title: 'Flexibilidade de datas',
    description: 'Troque as datas da sua reserva quando precisar, com recálculo automático do valor.',
  },
  {
    icon: Headphones,
    title: 'Sofia prioritária',
    description: 'Atendimento prioritário do concierge inteligente, antes e durante a viagem.',
  },
  {
    icon: Gift,
    title: 'Ofertas antecipadas',
    description: 'Acesso antecipado a promoções e datas de alta procura.',
  },
  {
    icon: Crown,
    title: 'Benefícios no destino',
    description: 'Cortesias e upgrades selecionados em hospedagens participantes.',
  },
]

export function ClubPage() {
  const { user } = useApp()
  const isMember = Boolean(user?.isClubMember)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/partner-3.png"
          alt="Ambiente premium de resort parceiro Bomgo"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-32 text-primary-foreground md:px-6 md:pb-24 md:pt-40">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
            <Crown className="size-3.5 text-gold" /> Clube Bomgo
          </p>
          <h1 className="mt-4 max-w-2xl text-balance font-serif text-4xl font-medium leading-tight md:text-5xl">
            Viaje mais, pague menos e seja tratado como convidado.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-primary-foreground/85">
            O programa de fidelidade da Bomgo reúne preços exclusivos, flexibilidade
            e a Sofia sempre ao seu lado — sem mensalidade.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isMember ? (
              <span className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-gold-foreground">
                <Crown className="size-4" /> Você já é membro do Clube
              </span>
            ) : (
              <>
                <Link
                  href="/cadastro?next=/clube"
                  className="inline-flex items-center justify-center rounded-full bg-cta px-6 py-3.5 text-sm font-semibold text-cta-foreground transition hover:bg-cta/90"
                >
                  Entrar no Clube gratuitamente
                </Link>
                <Link
                  href="/login?next=/clube"
                  className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-foreground/10"
                >
                  Já sou membro
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-balance font-serif text-3xl font-medium text-foreground md:text-4xl">
            Benefícios que acompanham cada viagem
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Ativação imediata ao criar sua conta. Sem taxa, sem letras miúdas.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <article key={b.title} className="rounded-md border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-primary">
                <b.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-medium text-foreground">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
            </article>
          ))}
        </div>

        {!isMember && (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-md bg-primary px-6 py-12 text-center text-primary-foreground">
            <Sparkles className="size-7 text-cta" />
            <h3 className="max-w-md text-balance font-serif text-2xl font-medium">
              Pronto para desbloquear os preços do Clube?
            </h3>
            <Link
              href="/cadastro?next=/clube"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary-foreground px-6 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary-foreground/90"
            >
              Criar minha conta
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
