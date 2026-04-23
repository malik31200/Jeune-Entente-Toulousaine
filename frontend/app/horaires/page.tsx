'use client'

import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const DAYS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Retourne une clé de tri : [groupe, rang, féminine]
// Seniors → [0], U-catégories par nombre décroissant → [1, 100-U], Féminines → [2], Futsal → [3]
function teamSortKey(name: string): [number, number, number] {
  const low = name.toLowerCase().trim()
  if (low === 'seniors') return [0, 0, 0]
  if (low.startsWith('seniors')) return [0, 1, 0]
  const uMatch = name.match(/U(\d+)/i)
  if (uMatch) {
    const num = parseInt(uMatch[1])
    const isFem = /fémin/i.test(name) ? 1 : 0
    return [1, 100 - num, isFem]
  }
  if (/futsal/i.test(low)) return [3, 0, 0]
  return [2, 0, 0]
}

function compareTeams(a: string, b: string): number {
  const ka = teamSortKey(a)
  const kb = teamSortKey(b)
  for (let i = 0; i < 3; i++) {
    if (ka[i] !== kb[i]) return ka[i] - kb[i]
  }
  return a.localeCompare(b)
}

export default function HorairesPage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/training-schedules/`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || [])
        setSchedules(list)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container py-12 text-gray-500">Chargement...</div>

  // Grouper par équipe
  const byTeam: Record<string, any[]> = {}
  for (const s of schedules) {
    const name = s.team_name || s.team
    if (!byTeam[name]) byTeam[name] = []
    byTeam[name].push(s)
  }

  // Trier les créneaux de chaque équipe par jour de la semaine
  for (const name in byTeam) {
    byTeam[name].sort((a, b) => DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week))
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-black uppercase mb-8" style={{ color: 'var(--color-primary)' }}>
        Horaires d'entraînement
      </h1>

      {Object.keys(byTeam).length === 0 && (
        <p className="text-gray-500">Aucun horaire disponible pour le moment.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(byTeam).sort(([a], [b]) => compareTeams(a, b)).map(([teamName, slots]) => (
          <div key={teamName} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3" style={{ backgroundColor: 'var(--color-primary)' }}>
              <h2 className="text-white font-black">{teamName}</h2>
            </div>
            <div className="divide-y">
              {slots.map((slot: any) => (
                <div key={slot.id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>
                      {slot.day_of_week}
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">{slot.location}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--color-accent)' }}>
                      {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
