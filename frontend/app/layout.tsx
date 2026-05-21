import type { Metadata } from 'next'
import { Bebas_Neue } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getSiteSettings } from '../lib/api'

export const dynamic = 'force-dynamic'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jet-toulouse.fr'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jeune Entente Toulousaine — Club de football à Toulouse',
    template: '%s | JET Toulouse',
  },
  description: 'Site officiel de la Jeune Entente Toulousaine, club de football à Toulouse. Résultats, actualités, équipes et horaires d\'entraînement.',
  openGraph: {
    siteName: 'Jeune Entente Toulousaine',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/logo.png', width: 500, height: 500, alt: 'Logo Jeune Entente Toulousaine' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settingsData = await getSiteSettings().catch(() => null)
  const settings = Array.isArray(settingsData) ? settingsData[0] : (settingsData?.results?.[0] || null)
  const shopUrl = settings?.shop_url || null

  return (
    <html lang="fr" className={bebasNeue.variable}>
      <body className="flex flex-col min-h-screen">
        <Header shopUrl={shopUrl} />
       <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
