import { getTeams } from '../../../lib/api'
import Link from 'next/link'
import TeamGrid from '../../../components/TeamGrid'

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
        <TeamGrid teams={teams} />
      </div>
    </div>
  )
}
