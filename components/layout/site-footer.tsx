import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

const columns = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Buscar hospedagens', href: '/busca' },
      { label: 'Reserva Direta Bomgo', href: '/busca' },
      { label: 'Clube Bomgo', href: '/clube' },
      { label: 'Meus favoritos', href: '/favoritos' },
    ],
  },
  {
    title: 'Sofia',
    links: [
      { label: 'Como funciona', href: '/' },
      { label: 'Concierge inteligente', href: '/' },
      { label: 'Suporte', href: '/' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { label: 'Sobre a Bomgo', href: 'https://bomgobrasil.com' },
      { label: 'Privacidade e LGPD', href: '/privacidade' },
      { label: 'Termos de uso', href: '/termos-de-uso' },
      { label: 'Política de cancelamento', href: '/cancelamento' },
    ],
  },
]

export function SiteFooter() {
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

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Bomgo. Plataforma inteligente de reservas.</p>
          <p>Valores e disponibilidade são confirmados em tempo real no momento da reserva.</p>
        </div>
      </div>
    </footer>
  )
}
