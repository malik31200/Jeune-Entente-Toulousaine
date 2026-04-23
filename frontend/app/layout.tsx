import type { Metadata } from 'next'
import { Bebas_Neue } from 'next/font/google'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getSiteSettings } from '../lib/api'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

export const metadata: Metadata = {
  title: 'Jeune Entente Toulousaine',
  description: 'Site officiel du club de football Jeune Entente Toulousaine',
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
      <body>
        <Header shopUrl={shopUrl} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
