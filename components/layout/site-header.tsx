'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ClipboardCheck, Heart, Menu, Search, Sparkles, User, X } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { useApp } from '@/components/providers/app-providers'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/busca', label: 'Buscar' },
  { href: '/favoritos', label: 'Meus favoritos' },
  { href: '/clube', label: 'Clube Bomgo' },
]

// External standalone check-in form — same one used by the WhatsApp/Sofia flow.
const CHECKIN_FORM_URL = 'https://checkin.bomgobrasil.com'

export function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { openSearch, favorites, user } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const overlay = isHome && !scrolled
  const light = overlay

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
          overlay
            ? 'bg-transparent'
            : 'border-b border-border/70 bg-background/85 backdrop-blur-xl',
        )}
      >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        <Link href="/" aria-label="Bomgo — início" className="shrink-0">
          <Logo variant={light ? 'light' : 'default'} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                light
                  ? 'text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                  : 'text-foreground/75 hover:bg-secondary hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={CHECKIN_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
              light
                ? 'text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                : 'text-foreground/75 hover:bg-secondary hover:text-foreground',
            )}
          >
            Check-in
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Abrir busca"
            className={cn(
              'hidden size-10 items-center justify-center rounded-full transition-colors md:inline-flex',
              light
                ? 'text-primary-foreground hover:bg-primary-foreground/10'
                : 'text-foreground hover:bg-secondary',
            )}
          >
            <Search className="size-5" />
          </button>

          <Link
            href="/favoritos"
            aria-label="Meus favoritos"
            className={cn(
              'relative hidden size-10 items-center justify-center rounded-full transition-colors md:inline-flex',
              light
                ? 'text-primary-foreground hover:bg-primary-foreground/10'
                : 'text-foreground hover:bg-secondary',
            )}
          >
            <Heart className="size-5" />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-cta text-[10px] font-semibold text-cta-foreground">
                {favorites.length}
              </span>
            )}
          </Link>

          <Link
            href={user ? '/conta' : '/login'}
            className={cn(
              'hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors md:inline-flex',
              light
                ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            <User className="size-4" />
            {user ? user.firstName : 'Entrar'}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-full transition-colors md:hidden',
              light
                ? 'text-primary-foreground hover:bg-primary-foreground/10'
                : 'text-foreground hover:bg-secondary',
            )}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>
      </header>

      {/* Mobile drawer — rendered as a sibling of <header>, NOT nested inside
          it. The header uses backdrop-blur when not in overlay mode, and
          backdrop-filter on an ancestor breaks position:fixed for descendants
          (creates a new containing block) — that's why this drawer only
          rendered correctly on the home page at the very top (the one state
          where the header has no blur). Living outside <header> avoids the
          bug entirely regardless of scroll position or page. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div
            className="absolute inset-0 bg-primary/80"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-in slide-in-from-right absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-background p-6 shadow-2xl duration-300 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                openSearch()
              }}
              className="mt-8 flex items-center gap-3 rounded-md border border-border bg-secondary/60 px-4 py-3.5 text-left"
            >
              <Search className="size-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Para onde você quer viajar?
              </span>
            </button>

            <nav className="mt-6 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-2 py-3.5 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={CHECKIN_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-2 py-3.5 text-base font-medium text-foreground hover:bg-secondary"
              >
                <ClipboardCheck className="size-4 text-primary" />
                Formulário de check-in
              </a>
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              <Link
                href={user ? '/conta' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                <User className="size-4" /> {user ? `Minha conta` : 'Entrar'}
              </Link>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-cta" /> Reserva inteligente com a Sofia
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
