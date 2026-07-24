import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Comfortaa, Geist_Mono } from 'next/font/google'
import { AppProviders } from '@/components/providers/app-providers'
import { SiteChrome } from '@/components/layout/site-chrome'
import { SITE_URL } from '@/lib/site-url'
import {
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  DEFAULT_OG_IMAGE,
} from '@/lib/seo/seo'
import { JsonLd, organizationSchema, websiteSchema } from '@/lib/seo/jsonld'
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

export const metadata: Metadata = {
  // Base absoluta: faz TODA url canônica e imagem social apontar para o
  // domínio real. Sem isso, o Open Graph e o canonical saem relativos/quebrados
  // (era a causa do site "não fixar o domínio").
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // Páginas internas viram "Título da página | Bomgo".
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  formatDetection: { telephone: false },
  // Verificação de propriedade no Google Search Console (renderiza a
  // <meta name="google-site-verification">). Necessária para indexar o site
  // e enviar o sitemap.
  verification: {
    google: '7oIEwwqTLvBjQDz8GQVB4eLrqlpXlSVpVoOY7aPqgv8',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Bomgo — aluguel por temporada no Ceará',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
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
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
