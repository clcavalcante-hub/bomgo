"use client"

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { useApp } from '@/components/providers/app-providers'

const platformLinks = [
  { label: 'Buscar hospedagens', href: '/busca' },
  { label: 'Reserva Direta Bomgo', href: '/busca' },
  { label: 'Clube Bomgo', href: '/clube' },
  { label: 'Meus favoritos', href: '/favoritos' },
]

const institutionalLinks = [
  { label: 'Sobre a Bomgo', href: 'https://bomgobrasil.com' },
  { label: 'Privacidade e LGPD', href: '/privacidade' },
  { label: 'Termos de uso', href: '/termos-de-uso' },
  { label: 'Política de cancelamento', href: '/cancelamento' },
]

export function SiteFooter() {
  const { openSofia } = useApp()

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A plataforma inteligente de reservas. A Sofia encontra, compara e
              conduz toda a sua hospedagem — do primeiro clique ao check-in.
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-sm">
              <Sparkles className="size-3.5 text-cta" />
              Reserva inteligente
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Plataforma</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Sofia</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/#sofia" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Como funciona
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openSofia}
                  className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Concierge inteligente
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/558581412023"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Suporte
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Institucional</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {institutionalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Bomgo. Plataforma inteligente de reservas.</p>
          <p>Valores e disponibilidade são confirmados em tempo real no momento da reserva.</p>
        </div>
      </div>
    </footer>
  )
}
