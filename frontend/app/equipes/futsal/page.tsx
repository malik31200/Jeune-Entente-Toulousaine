import { getTeams, getMediaUrl } from '../../../lib/api'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function FutsalPage() {
  const data = await getTeams().catch(() => [])
  const teams = Array.isArray(data) ? data : (data.results || [])
  const futsal = teams.find((t: any) => t.name === 'Futsal')

  if (futsal) {
    redirect(`/equipes/${futsal.id}`)
  }

  return (
    <div className="container pt-12" style={{ paddingBottom: '5rem' }}>
      <Link href="/equipes" className="text-sm font-semibold uppercase tracking-wider mb-6 inline-block" style={{ color: 'var(--color-accent)' }}>
        ← Équipes
      </Link>
      <p className="text-gray-400 italic mt-8">Équipe Futsal non trouvée.</p>
    </div>
  )
}
