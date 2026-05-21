import { getSponsors } from '../../lib/api'
import SponsorCards from '../../components/SponsorCards'

export const metadata = {
  title: 'Partenaires — Jeune Entente Toulousaine',
  description: 'Découvrez les sponsors et partenaires de la Jeune Entente Toulousaine.',
}

export default async function PartenairesPage() {
  const data = await getSponsors().catch(() => [])
  const sponsors = Array.isArray(data) ? data : (data.results || [])

  return (
    <div className="container py-12" style={{ paddingBottom: '5rem' }}>
      <h1 className="text-3xl font-black uppercase mb-2 mt-10" style={{ color: 'var(--color-primary)' }}>
        Nos Partenaires
      </h1>
      <div className="h-1 w-16 mb-8" style={{ backgroundColor: 'var(--color-accent)' }} />
      <p className="text-gray-500 mb-10">Merci à tous nos partenaires pour leur soutien au club.</p>

      {sponsors.length === 0 ? (
        <p className="text-gray-400">Aucun partenaire à afficher pour le moment.</p>
      ) : (
        <SponsorCards sponsors={sponsors} />
      )}
    </div>
  )
}
