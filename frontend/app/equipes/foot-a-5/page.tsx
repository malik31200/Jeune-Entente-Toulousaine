import { getTeamPresentations, getMediaUrl } from '../../../lib/api'
import Link from 'next/link'

export default async function FootA5Page() {
  const data = await getTeamPresentations('foot-a-5').catch(() => [])
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
            Foot à 5
          </h1>
          <p className="text-gray-400 text-sm mt-3 mb-3">U5 · U6 · U7 · U8 · U9</p>
        </div>
      </div>
      <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-accent)' }} />

      <div className="container py-12 mt-3 mb-3">
        {teams.length === 0 ? (
          <p className="text-gray-400 italic">Aucune équipe pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-6 mt-6 mb-6">
            {teams.map((item: any) => {
              const imageUrl = getMediaUrl(item.image)
              const coaches = item.coaches ? item.coaches.split('\n').filter(Boolean) : []
              return (
                <div key={item.id} className="rounded-xl overflow-hidden shadow flex" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', minHeight: '180px' }}>
                  {/* Photo */}
                  <div className="w-48 flex-shrink-0" style={{ minHeight: '180px' }}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.display_name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                        <span className="text-4xl">⚽</span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 p-6">
                    <h2 className="font-black uppercase text-xl mb-4" style={{ color: 'var(--color-primary)' }}>
                      {item.display_name}
                    </h2>
                    {coaches.length > 0 && (
                      <>
                        <p className="font-bold uppercase text-xs tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
                          Staff
                        </p>
                        <div className="flex flex-col gap-2">
                          {coaches.map((coach: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                                {coach.trim()[0]?.toUpperCase()}
                              </div>
                              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{coach.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
