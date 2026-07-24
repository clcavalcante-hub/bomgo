import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Comfortaa, Geist_Mono } from 'next/font/google'
import { AppProviders } from '@/components/providers/app-providers'
import { SiteChrome } from '@/components/layout/site-chrome'
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/components/analytics/google-tag-manager'
import { OrganizationJsonLd } from '@/components/seo/organization-json-ld'
import { SITE_URL } from '@/lib/site-url'
import './globals.css'

// Body copy AND headings use the visitor's own system font (San Francisco
// on iPhone/Mac, Segoe UI on Windows, Roboto on Android) — see
// --font-sans/--font-serif in globals.css. No custom Google Font is loaded
// for running text: it's the exact typeface already familiar from every
// native app the person uses, with zero webfont load time.

// Comfortaa is now reserved exclusively for the "Bomgo" wordmark/logo — the
// one deliberately rounded, brand-specific accent — never for running text,
// headings, or any other UI copy. See --font-logo in globals.css.
const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-comfortaa',
  display: 'swap',
})

// Monospace, used narrowly for voucher codes / masked card numbers where
// fixed-width digits improve legibility — not part of the portal's running
// text typography.
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

// O título fala do que se vende E de onde: quem procura "Bomgo" já nos achou;
// quem procura apartamento por temporada em Porto das Dunas precisa nos achar
// por essas palavras. `metadataBase` faz toda URL relativa (canônica, OG image)
// resolver no domínio da marca em vez de no host da vez.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: {
    default: 'Aluguel por Temporada em Fortaleza e Porto das Dunas | Bomgo Brasil',
    template: '%s | Bomgo Brasil',
  },
  description:
    'Apartamentos por temporada em Porto das Dunas (Aquiraz, perto do Beach Park) e na Beira-Mar de Fortaleza. Reserva direta com quem cuida do imóvel, sem taxa de plataforma.',
  applicationName: 'Bomgo Brasil',
  keywords: [
    'aluguel por temporada Fortaleza',
    'apartamento Porto das Dunas',
    'temporada Aquiraz',
    'apartamento perto do Beach Park',
    'apartamento beira-mar Fortaleza',
    'Terra Maris',
    'PortaMaris',
    'reserva direta',
  ],
  openGraph: {
    title: 'Aluguel por Temporada em Fortaleza e Porto das Dunas | Bomgo Brasil',
    description:
      'Apartamentos por temporada em Porto das Dunas e na Beira-Mar de Fortaleza, com reserva direta e sem taxa de plataforma.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Bomgo Brasil',
    url: '/',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1e2a52',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${comfortaa.variable} ${geistMono.variable} bg-background`}
    >
      <body className="antialiased font-sans">
        <GoogleTagManagerNoScript />
        <OrganizationJsonLd />
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <GoogleTagManager />
      </body>
    </html>
  )
}
