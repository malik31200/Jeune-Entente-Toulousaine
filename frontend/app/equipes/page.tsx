import { getTeams } from '../../lib/api'
import Link from 'next/link'

const TEAM_ORDER = ['Seniors', 'Seniors 2', 'U19', 'U17', 'U16', 'U15', 'U14', 'Féminines', 'U18 Féminines', 'U15 Féminines', 'Futsal']

export default async function EquipesPage() {
  const data = await getTeams().catch(() => [])
  const allTeams = Array.isArray(data) ? data : (data.results || [])

  const teams = TEAM_ORDER
    .map(name => allTeams.find((t: any) => t.name === name))
    .filter(Boolean)

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-black uppercase mb-8" style={{ color: 'var(--color-primary)' }}>
        Nos Équipes
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.map((team: any) => (
          <Link key={team.id} href={`/equipes/${team.id}`}>
            <div className="rounded-lg p-6 text-center hover:opacity-80 transition-opacity cursor-pointer"
                 style={{ backgroundColor: 'var(--color-primary)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                   style={{ backgroundColor: 'var(--color-accent)' }}>
                <span className="font-black text-xl" style={{ color: 'var(--color-primary)' }}>⚽</span>
              </div>
              <h2 className="text-white font-bold text-lg">{team.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
