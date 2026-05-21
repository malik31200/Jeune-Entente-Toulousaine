import { getTeamPresentations } from '../../../lib/api'
import Link from 'next/link'
import TeamPresentationList from '../../../components/TeamPresentationList'

export const metadata = {
  title: 'Foot à 8',
  description: 'Les équipes Foot à 8 de la Jeune Entente Toulousaine : U8, U9, U10, U11. Résultats et présentation.',
}

export default async function FootA8Page() {
  const data = await getTeamPresentations('foot-a-8').catch(() => [])
  const raw = Array.isArray(data) ? data : (data.results || [])
  const teams = [...raw].sort((a: any, b: any) => {
    const n = (s: string) => parseInt(s.replace(/\D/g, '')) || 0
    return n(a.display_name) - n(b.display_name)
  })

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
            Foot à 8
          </h1>
          <p className="text-gray-400 text-sm mt-3 mb-3">U10 · U11 · U12 · U13</p>
        </div>
      </div>
      <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-accent)' }} />

      <div className="container py-12">
        <TeamPresentationList teams={teams} />
      </div>
    </div>
  )
}
