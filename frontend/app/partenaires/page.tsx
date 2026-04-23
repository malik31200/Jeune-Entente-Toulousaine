import { getSponsors, getMediaUrl } from '../../lib/api'

export default async function PartenairesPage() {
  const data = await getSponsors().catch(() => [])
  const sponsors = Array.isArray(data) ? data : (data.results || [])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-black uppercase mb-2" style={{ color: 'var(--color-primary)' }}>
        Nos Partenaires
      </h1>
      <p className="text-gray-500 mb-10">Merci à tous nos partenaires pour leur soutien au club.</p>

      {sponsors.length === 0 ? (
        <p className="text-gray-400">Aucun partenaire à afficher pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sponsors.map((sponsor: any) => {
            const logoUrl = getMediaUrl(sponsor.logo)
            const card = (
              <div
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow p-6 flex flex-col items-center gap-4 group cursor-pointer border border-transparent hover:border-orange-200"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={sponsor.name}
                    className="h-20 object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                  >
                    {sponsor.name.charAt(0)}
                  </div>
                )}
                <p className="font-bold text-center text-sm" style={{ color: 'var(--color-primary)' }}>
                  {sponsor.name}
                </p>
                {sponsor.website_url && (
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                    Visiter le site →
                  </span>
                )}
              </div>
            )

            return sponsor.website_url ? (
              <a
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {card}
              </a>
            ) : (
              <div key={sponsor.id}>{card}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
