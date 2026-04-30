import { getTeams, getMediaUrl } from '../../lib/api'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Nos Équipes — Jeune Entente Toulousaine',
  description: 'Toutes les équipes de la JET : Foot à 11, Foot à 8, Foot à 5 et Futsal.',
}


const TEAM_ORDER = ['Seniors', 'Seniors 2', 'U19', 'U17', 'U16', 'U15', 'U14', 'Féminines', 'U18 Féminines', 'U15 Féminines']

export default async function EquipesPage() {
  const data = await getTeams().catch(() => [])
  const allTeams = Array.isArray(data) ? data : (data.results || [])

  const teams = TEAM_ORDER
    .map(name => allTeams.find((t: any) => t.name === name))
    .filter(Boolean)

  return (
    <div className="container pt-12 pb-40">
      <h1 className="text-3xl font-black uppercase mb-8 mt-8" style={{ color: 'var(--color-primary)' }}>
        Foot à 11
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.map((team: any) => {
          const imageUrl = getMediaUrl(team.image)
          return (
            <Link key={team.id} href={`/equipes/${team.id}`}>
              <div
                className="rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {/* Zone image */}
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

                {/* Nom de l'équipe */}
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
    </div>
  )
}
