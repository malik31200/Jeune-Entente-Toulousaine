import { getTeams, getMediaUrl } from '../../../lib/api'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Futsal — Jeune Entente Toulousaine',
  description: 'Les équipes Futsal de la Jeune Entente Toulousaine.',
}

export default async function FutsalPage() {
  const data = await getTeams().catch(() => [])
  const allTeams = Array.isArray(data) ? data : (data.results || [])
  const teams = allTeams.filter((t: any) => t.name.toLowerCase().includes('futsal'))

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Bannière */}
      <div className="relative flex items-end" style={{ minHeight: '220px', backgroundColor: 'var(--color-primary)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 100%)' }} />
        <div className="container relative z-10 py-10">
          <Link href="/equipes" className="text-xs font-bold uppercase tracking-widest mb-3 inline-block hover:opacity-80" style={{ color: 'var(--color-accent)' }}>
            ← Équipes
          </Link>
          <h1 className="text-white font-black uppercase leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            Futsal
          </h1>
          <p className="text-gray-400 text-sm mt-3 mb-3">Foot en salle</p>
        </div>
      </div>
      <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-accent)' }} />

      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        {teams.length === 0 ? (
          <p className="text-gray-400 italic">Aucune équipe Futsal pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((team: any) => {
              const imageUrl = getMediaUrl(team.image)
              return (
                <Link key={team.id} href={`/equipes/${team.id}`}>
                  <div
                    className="rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <div className="relative h-40 overflow-hidden">
                      {imageUrl ? (
                        <>
                          <Image
                            src={imageUrl}
                            alt={team.name}
                            fill
                            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                            <span className="text-2xl">⚽</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3">
                      <h2 className="text-white font-bold text-base group-hover:text-orange-400 transition-colors">
                        {team.name}
                      </h2>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
