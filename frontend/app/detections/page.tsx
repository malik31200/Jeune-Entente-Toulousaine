'use client'

import { useEffect, useState } from 'react'
import { getDetections } from '@/lib/api'


type Detection = {
  id: number
  team: number
  team_name: string
  form_url: string
  description: string
  order: number
}

export default function DetectionsPage() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [selected, setSelected] = useState<Detection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDetections()
      .then((data: any) => {
        const list: Detection[] = Array.isArray(data) ? data : (data.results ?? [])
        const sorted = [...list].sort((a, b) => {
          const rank = (name: string) => {
            const n = name.toLowerCase()
            if (n.includes('senior') || n.includes('futsal') || n.includes('fémin')) return -1000
            const num = parseInt(n.replace(/\D/g, ''))
            return isNaN(num) ? 0 : -num
          }
          return rank(a.team_name) - rank(b.team_name)
        })
        setDetections(sorted)
        if (sorted.length > 0) setSelected(sorted[0])
      })
      .catch(() => setDetections([]))
      .finally(() => setLoading(false))
  }, [])

  const embedUrl = (url: string) => {
    if (!url) return ''
    const base = url.split('?')[0]
    return `${base}?embedded=true`
  }

  return (
    <main style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Hero banner */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: '220px',
          background: 'linear-gradient(135deg, var(--color-primary) 60%, #1a1a1a 100%)',
          borderBottom: '3px solid var(--color-accent)',
        }}
      >
        <div className="text-center">
          <h1
            className="font-black uppercase tracking-widest"
            style={{ color: 'var(--color-accent)', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Détections
          </h1>
          <p className="text-gray-300 mt-2 text-sm tracking-wider uppercase">
            Inscris-toi pour participer à nos séances de détection
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        {loading ? (
          <div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
            <div className="w-10 h-10 rounded-full border-4 border-gray-700 animate-spin" style={{ borderTopColor: 'var(--color-accent)' }} />
          </div>
        ) : detections.length === 0 ? (
          <div className="text-center" style={{ paddingTop: '4rem' }}>
            <p className="text-gray-400 text-lg">Aucune détection disponible pour le moment.</p>
            <p className="text-gray-500 text-sm mt-2">Revenez bientôt pour découvrir nos prochaines séances.</p>
          </div>
        ) : (
          <>
            {/* Category selector */}
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {detections.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200"
                  style={
                    selected?.id === d.id
                      ? {
                          backgroundColor: 'var(--color-accent)',
                          color: 'var(--color-primary)',
                          transform: 'scale(1.05)',
                        }
                      : {
                          backgroundColor: '#1a1a1a',
                          color: '#ccc',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }
                  }
                >
                  {d.team_name}
                </button>
              ))}
            </div>

            {/* Selected detection content */}
            {selected && (
              <div className="max-w-4xl mx-auto">
                {selected.description && (
                  <div
                    className="rounded-xl p-6 mb-8 text-center"
                    style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-gray-300 leading-relaxed">{selected.description}</p>
                  </div>
                )}

                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                  }}
                >
                  <iframe
                    src={embedUrl(selected.form_url)}
                    width="100%"
                    height="900"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    style={{ display: 'block' }}
                    title={`Formulaire de détection — ${selected.team_name}`}
                  >
                    Chargement…
                  </iframe>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
