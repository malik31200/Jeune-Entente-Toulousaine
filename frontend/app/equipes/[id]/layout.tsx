import { getTeams } from '../../../lib/api'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const data = await getTeams()
    const teams = Array.isArray(data) ? data : (data.results || [])
    const team = teams.find((t: any) => String(t.id) === params.id)
    if (!team) return { title: 'Équipe' }
    const description = team.description
      || `Résultats, calendrier et classement de l'équipe ${team.name} de la Jeune Entente Toulousaine.`
    return {
      title: team.name,
      description,
      openGraph: {
        title: `${team.name} — JET Toulouse`,
        description,
        type: 'website',
      },
    }
  } catch {
    return { title: 'Équipe' }
  }
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
