import { getTeams } from '../../lib/api'
import TeamGrid from '../../components/TeamGrid'

export const metadata = {
  title: 'Nos Équipes — Jeune Entente Toulousaine',
  description: 'Toutes les équipes de la JET : Foot à 11, Foot à 8, Foot à 5 et Futsal.',
}


const TEAM_ORDER = ['Seniors', 'Seniors 2', 'U19', 'U18', 'U17', 'U16', 'U15', 'U14', 'Féminines', 'U18 Féminines', 'U15 Elite Féminines', 'U15 Territoire Féminines']

export default async function EquipesPage() {
  const data = await getTeams().catch(() => [])
  const allTeams = Array.isArray(data) ? data : (data.results || [])

  const teams = TEAM_ORDER
    .map(name => allTeams.find((t: any) => t.name === name))
    .filter(Boolean)

  return (
    <div className="container pt-12 pb-40">
      <h1 className="text-4xl text-center font-black uppercase mb-8 mt-8" style={{ color: 'var(--color-primary)' }}>
        Foot à 11
      </h1>
      <TeamGrid teams={teams} />
    </div>
  )
}
