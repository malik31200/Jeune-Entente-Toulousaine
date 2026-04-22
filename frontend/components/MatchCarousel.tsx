'use client'

import { useState } from 'react'

interface Match {
  id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  date: string
  competition: string
  status: string
  is_home: boolean
}

function MatchCard({ match }: { match: Match }) {
  const isTermine = match.status === 'TERMINE'
  const date = new Date(match.date)
  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })

  return (
    <div className="flex-shrink-0 w-64 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-primary-light)' }}>
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--color-accent)' }}>
          {match.competition}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {dateStr} · {timeStr}
        </p>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-white font-bold text-sm truncate flex-1">{match.home_team}</span>
          {isTermine ? (
            <span className="text-white font-black text-lg mx-2 whitespace-nowrap">
              {match.home_score} – {match.away_score}
            </span>
          ) : (
            <span className="text-gray-400 font-bold text-sm mx-2">vs</span>
          )}
          <span className="text-white font-bold text-sm truncate flex-1 text-right">{match.away_team}</span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{
            backgroundColor: isTermine ? '#374151' : 'var(--color-accent)',
            color: isTermine ? '#9ca3af' : 'var(--color-primary)',
          }}
        >
          {isTermine ? 'TERMINÉ' : 'À VENIR'}
        </span>
      </div>
    </div>
  )
}

export default function MatchCarousel({ matches }: { matches: Match[] }) {
  const [startIndex, setStartIndex] = useState(0)
  const visible = 4

  if (!matches.length) return null

  const prev = () => setStartIndex((i) => Math.max(0, i - 1))
  const next = () => setStartIndex((i) => Math.min(matches.length - visible, i + 1))

  return (
    <section style={{ backgroundColor: 'var(--color-primary)' }} className="py-6">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black uppercase text-sm tracking-wider">
            Résultats & Calendrier
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={startIndex === 0}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary-light)' }}
            >
              ←
            </button>
            <button
              onClick={next}
              disabled={startIndex >= matches.length - visible}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
            >
              →
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-hidden">
          {matches.slice(startIndex, startIndex + visible).map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  )
}
