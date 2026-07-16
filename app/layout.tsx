import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Comfortaa, Geist_Mono, Inter } from 'next/font/google'
import { AppProviders } from '@/components/providers/app-providers'
import { SiteChrome } from '@/components/layout/site-chrome'
import './globals.css'

// Main typeface for the entire portal — body copy, navigation, buttons,
// cards, prices AND headings. Clean, neutral, professional (matches the
// reference look from bomgo.stays.com.br). See --font-sans/--font-serif in
// globals.css, both mapped to this same family.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

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

export const metadata: Metadata = {
  title: 'Bomgo — Reserva Inteligente',
  description:
    'Bomgo é a plataforma inteligente de reservas. A Sofia encontra a hospedagem ideal para você, compara opções e conduz toda a sua reserva com elegância.',
  generator: 'v0.app',
  applicationName: 'Bomgo',
  keywords: ['Bomgo', 'reserva inteligente', 'hospedagem', 'Sofia', 'concierge'],
  openGraph: {
    title: 'Bomgo — Reserva Inteligente',
    description: 'Sua IA encontra a melhor hospedagem.',
    type: 'website',
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
      className={`${inter.variable} ${comfortaa.variable} ${geistMono.variable} bg-background`}
    >
      <body className="antialiased font-sans">
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
