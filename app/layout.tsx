import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Manrope, Geist_Mono } from 'next/font/google'
import { AppProviders } from '@/components/providers/app-providers'
import { SiteChrome } from '@/components/layout/site-chrome'
import './globals.css'

// Interface, formulários, navegação, botões, cards, preços e textos.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Títulos de destaque — sans-serif, nunca serif/editor de texto.
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

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
      className={`${inter.variable} ${manrope.variable} ${geistMono.variable} bg-background`}
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
