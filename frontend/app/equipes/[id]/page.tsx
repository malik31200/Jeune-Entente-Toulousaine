'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const SEASON_MONTH_ORDER = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function getSeason(date: Date): string {
  const y = date.getFullYear()
  const m = date.getMonth()
  return m >= 7 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}

type Tab = 'data' | 'resultats' | 'classement'

export default function TeamDetailPage() {
  const params = useParams()
  const [team, setTeam] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('data')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedSeason, setSelectedSeason] = useState('')
  const [loading, setLoading] = useState(true)

    useEffect(() => {
    if (!params.id) return
    Promise.all([
      fetch(`${API_URL}/teams/${params.id}/`).then(r => r.json()),
      fetch(`${API_URL}/team-stats/?team=${params.id}`).then(r => r.json()),
      fetch(`${API_URL}/matches/?team=${params.id}`).then(r => r.json()),
    ]).then(([teamData, statsData, matchesData]) => {
      setTeam(teamData)
      const statsArr = Array.isArray(statsData) ? statsData : (statsData.results || [])
      setStats(statsArr[0] || null)
      const matchArr = Array.isArray(matchesData) ? matchesData : (matchesData.results || [])
      setMatches(matchArr)
      const currentSeason = getSeason(new Date())
      const seasons = [...new Set<string>(matchArr.map((m: any) => getSeason(new Date(m.date))))].sort()
      const defaultSeason = seasons.includes(currentSeason) ? currentSeason : (seasons[seasons.length - 1] || '')
      setSelectedSeason(defaultSeason)
      const months = Array.from(new Set<number>(
        matchArr.filter((m: any) => getSeason(new Date(m.date)) === defaultSeason)
          .map((m: any) => new Date(m.date).getMonth())
      )).sort((a: number, b: number) => SEASON_MONTH_ORDER.indexOf(a) - SEASON_MONTH_ORDER.indexOf(b))
      if (months.length > 0) setSelectedMonth(months[0])
    }).finally(() => setLoading(false))
  }, [params.id])

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season)
    const months = Array.from(new Set<number>(
      matches.filter((m: any) => getSeason(new Date(m.date)) === season)
        .map((m: any) => new Date(m.date).getMonth())
    )).sort((a: number, b: number) => SEASON_MONTH_ORDER.indexOf(a) - SEASON_MONTH_ORDER.indexOf(b))
    if (months.length > 0) setSelectedMonth(months[0])
  }

  if (loading) return <div className="container py-12 text-gray-500">Chargement...</div>
  if (!team || team.detail === 'Not found.') return <div className="container py-12 text-gray-500">Équipe introuvable.</div>

  const availableSeasons = [...new Set<string>(matches.map((m: any) => getSeason(new Date(m.date))))].sort()

  const TABS = [
    { key: 'data', label: 'DATA' },
    { key: 'resultats', label: 'RÉSULTATS/CALENDRIER' },
    { key: 'classement', label: 'CLASSEMENT' },
  ]

  const availableMonths = Array.from(new Set(
    matches
      .filter((m: any) => !selectedSeason || getSeason(new Date(m.date)) === selectedSeason)
      .map((m: any) => new Date(m.date).getMonth())
  )).sort((a: number, b: number) => SEASON_MONTH_ORDER.indexOf(a) - SEASON_MONTH_ORDER.indexOf(b))

  const matchesInMonth = matches
    .filter((m: any) =>
      (!selectedSeason || getSeason(new Date(m.date)) === selectedSeason) &&
      new Date(m.date).getMonth() === selectedMonth
    )
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div>
      {/* Header équipe */}
      <div className="py-12" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container">
          <Link href="/equipes" className="text-sm font-semibold uppercase tracking-wider mb-4 inline-block"
                style={{ color: 'var(--color-accent)' }}>
            ← Toutes les équipes
          </Link>
          <h1 className="text-white text-4xl font-black mt-2">{team.name}</h1>
          {stats && (
            <p className="text-gray-400 mt-2">{stats.competition} · Saison {stats.season}</p>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div style={{ backgroundColor: 'var(--color-primary-light)' }}>
        <div className="container">
          <div className="flex overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
                className="flex-shrink-0 px-5 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2"
                style={{
                  color: activeTab === tab.key ? 'var(--color-accent)' : '#9ca3af',
                  borderColor: activeTab === tab.key ? 'var(--color-accent)' : 'transparent',
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container py-8">

        {/* === DATA === */}
        {activeTab === 'data' && (
          <div className="max-w-2xl">
            {!stats ? (
              <p className="text-gray-500">Pas de statistiques disponibles pour cette équipe.</p>
            ) : (
              <>
                {stats.form && (
                  <div className="mb-8">
                    <h2 className="text-lg font-black uppercase mb-4" style={{ color: 'var(--color-primary)' }}>
                      Forme du moment
                    </h2>
                    <div className="flex gap-2">
                      {stats.form.split('').map((c: string, i: number) => (
                        <span key={i}
                          className="w-10 h-10 rounded flex items-center justify-center text-white font-black text-sm"
                          style={{ backgroundColor: c === 'V' ? '#16a34a' : c === 'N' ? '#6b7280' : '#dc2626' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Victoires', value: stats.wins, color: '#16a34a' },
                    { label: 'Nuls', value: stats.draws, color: '#6b7280' },
                    { label: 'Défaites', value: stats.losses, color: '#dc2626' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-lg p-6 text-center shadow">
                      <p className="text-4xl font-black" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-sm text-gray-500 uppercase font-semibold mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="font-black uppercase text-sm mb-6" style={{ color: 'var(--color-primary)' }}>Buts</h3>
                  <div className="flex items-end justify-around">
                    <div className="text-center">
                      <p className="text-6xl font-black" style={{ color: 'var(--color-accent)' }}>{stats.goals_for}</p>
                      <p className="text-sm text-gray-500 uppercase font-semibold mt-2">Marqués</p>
                    </div>
                    <div className="text-center">
                      <p className="text-6xl font-black text-red-600">{stats.goals_against}</p>
                      <p className="text-sm text-gray-500 uppercase font-semibold mt-2">Encaissés</p>
                    </div>
                  </div>
                  {stats.matches_played > 0 && (
                    <p className="text-center text-gray-400 text-sm mt-6">
                      {(stats.goals_for / stats.matches_played).toFixed(2)} buts/match · {stats.matches_played} matchs joués
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* === RÉSULTATS === */}
        {activeTab === 'resultats' && (
          <div>
            {/* Sélecteur saison */}
            {availableSeasons.length > 0 && (
              <div className="flex gap-2 mb-4">
                {availableSeasons.map(season => (
                  <button key={season} onClick={() => handleSeasonChange(season)}
                    className="px-4 py-2 rounded font-bold text-sm border-2 transition-colors"
                    style={{
                      borderColor: selectedSeason === season ? 'var(--color-accent)' : 'var(--color-border)',
                      color: selectedSeason === season ? 'var(--color-accent)' : 'var(--color-text-light)',
                      backgroundColor: 'white',
                    }}>
                    {season}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {availableMonths.map((m: number) => (
                <button key={m} onClick={() => setSelectedMonth(m)}
                  className="flex-shrink-0 px-4 py-2 rounded font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: selectedMonth === m ? 'var(--color-accent)' : 'var(--color-primary)',
                    color: selectedMonth === m ? 'var(--color-primary)' : 'white',
                  }}>
                  {MONTH_NAMES[m]}
                </button>
              ))}
            </div>

            {matchesInMonth.length === 0 ? (
              <p className="text-gray-500">Aucun match ce mois-ci.</p>
            ) : (
              <div className="flex flex-col gap-3 max-w-2xl">
                {matchesInMonth.map((match: any) => {
                  const isTermine = match.status === 'TERMINE'
                  const date = new Date(match.date)
                  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
                  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
                  return (
                    <div key={match.id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                          {match.competition}
                        </p>
                        <span className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: isTermine ? '#374151' : 'var(--color-accent)',
                            color: isTermine ? '#9ca3af' : 'var(--color-primary)',
                          }}>
                          {isTermine ? 'TERMINÉ' : 'À VENIR'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3 capitalize">{dateStr} · {timeStr}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-bold flex-1 text-right text-sm">{match.home_team}</span>
                        {isTermine ? (
                          <span className="font-black text-xl w-20 text-center">{match.home_score} – {match.away_score}</span>
                        ) : (
                          <span className="text-gray-400 font-bold w-20 text-center">vs</span>
                        )}
                        <span className="font-bold flex-1 text-sm">{match.away_team}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* === CLASSEMENT === */}
        {activeTab === 'classement' && (
          <div className="max-w-2xl">
            {!stats ? (
              <p className="text-gray-500">Pas de données de classement disponibles.</p>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden mb-3">
                  <div className="px-4 py-3" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <p className="text-white font-black text-sm uppercase">{stats.competition} · {stats.season}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-gray-500 text-xs uppercase">
                          <th className="text-left p-3">Pos.</th>
                          <th className="text-left p-3">Équipe</th>
                          <th className="text-center p-3">J</th>
                          <th className="text-center p-3">V</th>
                          <th className="text-center p-3">N</th>
                          <th className="text-center p-3">D</th>
                          <th className="text-center p-3">DB</th>
                          <th className="text-center p-3">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: 'rgba(249, 115, 22, 0.08)' }}>
                          <td className="p-3 font-black text-xl" style={{ color: 'var(--color-accent)' }}>
                            {stats.ranking || '–'}
                          </td>
                          <td className="p-3 font-bold">{team.name}</td>
                          <td className="p-3 text-center">{stats.matches_played}</td>
                          <td className="p-3 text-center text-green-600 font-semibold">{stats.wins}</td>
                          <td className="p-3 text-center">{stats.draws}</td>
                          <td className="p-3 text-center text-red-500 font-semibold">{stats.losses}</td>
                          <td className="p-3 text-center">
                            {stats.goals_for - stats.goals_against > 0 ? '+' : ''}{stats.goals_for - stats.goals_against}
                          </td>
                          <td className="p-3 text-center font-black text-xl" style={{ color: 'var(--color-accent)' }}>
                            {stats.points}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Données issues du scraping FFF · classement partiel
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
