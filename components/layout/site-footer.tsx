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

// Fixed link color palette — deliberately darker than the rest of the site
// to close the page visually, so arbitrary hex values instead of the theme
// tokens (which are tuned for light backgrounds elsewhere).
const linkClass = 'text-sm text-[#CBD5E1] transition-colors hover:text-[#F28A45]'
const headingClass = 'text-sm font-semibold text-white'

export function SiteFooter() {
  const { openSofia } = useApp()

  return (
    <footer className="bg-[#0E2342]">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-[#AEBACB]">
              A plataforma inteligente de reservas, do primeiro clique ao check-in.
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#29415F] px-3 py-1.5 text-xs font-medium text-[#E97832]">
              <Sparkles className="size-3.5" />
              Reserva inteligente
            </p>
          </div>

          <div>
            <h3 className={headingClass}>Plataforma</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Sofia e suporte</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link href="/#sofia" className={linkClass}>
                  Como funciona
                </Link>
              </li>
              <li>
                <button type="button" onClick={openSofia} className={`text-left ${linkClass}`}>
                  Concierge inteligente
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/558581412023"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Suporte
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Institucional</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {institutionalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#29415F] pt-6 text-xs text-[#AEBACB]">
          <p>© {new Date().getFullYear()} Bomgo. Plataforma inteligente de reservas.</p>
        </div>
      </div>
    </footer>
  )
}
