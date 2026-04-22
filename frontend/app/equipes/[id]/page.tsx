'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const SEASON_MONTH_ORDER = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6]
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://backend:8000')) return url.replace('http://backend:8000', 'http://localhost:8000')
  if (url.startsWith('/media/')) return `http://localhost:8000${url}`
  return url
}

function getSeason(date: Date): string {
  const y = date.getFullYear()
  const m = date.getMonth()
  return m >= 7 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}

type Tab = 'data' | 'resultats' | 'classement'

function computeStatsFromMatches(matches: any[]): any | null {
  // Saison la plus récente uniquement
  const allSeasons = [...new Set<string>(matches.map(m => getSeason(new Date(m.date))))].sort()
  const latestSeason = allSeasons[allSeasons.length - 1]
  const seasonMatches = latestSeason
    ? matches.filter(m => getSeason(new Date(m.date)) === latestSeason)
    : matches

  // Compétition principale = celle avec le plus de matchs terminés (exclut les coupes)
  const terminated = seasonMatches.filter(m => m.status === 'TERMINE' && m.home_score !== null)
  if (terminated.length === 0) return null

  const compCount: Record<string, number> = {}
  for (const m of terminated) compCount[m.competition] = (compCount[m.competition] || 0) + 1
  const mainComp = Object.entries(compCount).sort(([, a], [, b]) => b - a)[0][0]

  // Uniquement les matchs de la compétition principale
  const done = terminated.filter(m => m.competition === mainComp)

  let wins = 0, draws = 0, losses = 0, goals_for = 0, goals_against = 0
  for (const m of done) {
    const scored = m.is_home ? m.home_score : m.away_score
    const conceded = m.is_home ? m.away_score : m.home_score
    goals_for += scored
    goals_against += conceded
    if (scored > conceded) wins++
    else if (scored === conceded) draws++
    else losses++
  }

  const sorted = [...done].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const form = sorted.slice(0, 5).map(m => {
    const s = m.is_home ? m.home_score : m.away_score
    const c = m.is_home ? m.away_score : m.home_score
    return s > c ? 'V' : s === c ? 'N' : 'D'
  }).join('')

  return {
    goals_for, goals_against, wins, draws, losses,
    matches_played: done.length,
    form, competition: mainComp,
    season: latestSeason || '',
    ranking: null,
    points: wins * 3 + draws,
  }
}

/* ─── Onglet DATA ─── */
function DataTab({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <div style={{ backgroundColor: 'var(--color-primary)', minHeight: '60vh' }}>
        <div className="container py-12 text-gray-500">Aucune statistique disponible.</div>
      </div>
    )
  }

  const maxGoals = Math.max(stats.goals_for, stats.goals_against, 1)
  const maxBarHeight = 160
  const forHeight = Math.round((stats.goals_for / maxGoals) * maxBarHeight)
  const againstHeight = Math.round((stats.goals_against / maxGoals) * maxBarHeight)
  const ratio = stats.matches_played > 0
    ? (stats.goals_for / stats.matches_played).toFixed(2)
    : '–'
  const diff = stats.goals_for - stats.goals_against

  return (
    <div style={{ backgroundColor: 'var(--color-primary)', minHeight: '70vh' }}>
      <div className="container py-12">
        <div className="max-w-md mx-auto">

          {/* Graphique en barres */}
          <div className="flex items-end justify-center gap-10 mb-0" style={{ height: `${maxBarHeight + 20}px` }}>
            <div className="flex flex-col items-center gap-0">
              <motion.div
                className="w-24 rounded-t-lg"
                style={{ backgroundColor: 'var(--color-accent)' }}
                initial={{ height: 0 }}
                animate={{ height: forHeight }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <div className="flex flex-col items-center gap-0">
              <motion.div
                className="w-24 rounded-t-lg"
                style={{ backgroundColor: '#ef4444' }}
                initial={{ height: 0 }}
                animate={{ height: againstHeight }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
          </div>

          {/* Grands chiffres */}
          <div className="flex justify-around mb-10 pt-4 border-t border-gray-800">
            <div className="text-center">
              <motion.p
                className="font-black leading-none"
                style={{ color: 'var(--color-accent)', fontSize: '5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {stats.goals_for}
              </motion.p>
              <p className="text-white text-xs font-bold uppercase tracking-widest mt-2">Marqué(s)</p>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <motion.p
                className="font-black leading-none text-red-500"
                style={{ fontSize: '5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {stats.goals_against}
              </motion.p>
              <p className="text-white text-xs font-bold uppercase tracking-widest mt-2">Encaissé(s)</p>
            </div>
          </div>

          {/* Buts/match */}
          <div className="border-t border-gray-800 pt-8 text-center mb-10">
            <motion.p
              className="font-black text-white leading-none"
              style={{ fontSize: '4.5rem' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {ratio}
            </motion.p>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-3">Buts / Match</p>
          </div>

          {/* V / N / D */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <motion.div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            >
              <p className="text-5xl font-black text-green-400">{stats.wins}</p>
              <p className="text-green-400 text-xs font-bold uppercase tracking-wider mt-1">Victoires</p>
            </motion.div>
            <motion.div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.2)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            >
              <p className="text-5xl font-black text-gray-400">{stats.draws}</p>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Nuls</p>
            </motion.div>
            <motion.div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            >
              <p className="text-5xl font-black text-red-400">{stats.losses}</p>
              <p className="text-red-400 text-xs font-bold uppercase tracking-wider mt-1">Défaites</p>
            </motion.div>
          </div>

          {/* Différence de buts */}
          <div className="rounded-xl p-4 text-center mb-8"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Différence de buts</p>
            <p className={`text-3xl font-black ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {diff > 0 ? `+${diff}` : diff}
            </p>
          </div>

          {/* Forme */}
          {stats.form && (
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Forme récente</p>
              <div className="flex gap-2">
                {stats.form.split('').map((c: string, i: number) => (
                  <motion.div
                    key={i}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm"
                    style={{ backgroundColor: c === 'V' ? '#16a34a' : c === 'N' ? '#6b7280' : '#dc2626' }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.08 }}
                  >
                    {c}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Matchs joués */}
          <div className="mt-8 text-center text-gray-600 text-xs uppercase tracking-widest">
            {stats.matches_played} matchs joués
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Onglet CLASSEMENT ─── */
function ClassementTab({ stats, team }: { stats: any; team: any }) {
  const imageUrl = getMediaUrl(team?.image)

  if (!stats) {
    return (
      <div style={{ backgroundColor: 'var(--color-primary)', minHeight: '60vh' }}>
        <div className="container py-12 text-gray-500">Pas de données de classement disponibles.</div>
      </div>
    )
  }

  const diff = stats.goals_for - stats.goals_against

  return (
    <div style={{ backgroundColor: 'var(--color-primary)', minHeight: '70vh' }}>
      <div className="container py-10">
        <div className="max-w-xl">

          {/* En-tête compétition */}
          <div className="rounded-xl p-4 flex items-center gap-4 mb-6"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <span className="text-2xl">⚽</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest">Saison {stats.season}</p>
              <p className="text-white font-black uppercase text-lg leading-tight">{stats.competition}</p>
            </div>
          </div>

          {/* En-tête colonnes */}
          <div className="flex items-center gap-2 px-4 pb-2 text-gray-600 text-xs font-bold uppercase tracking-wider">
            <span className="w-8 text-center">Pos</span>
            <span className="flex-1">Équipe</span>
            <span className="w-10 text-center" style={{ color: 'var(--color-accent)' }}>Pts</span>
            <span className="w-8 text-center">J</span>
            <span className="w-8 text-center text-green-600">V</span>
            <span className="w-8 text-center">N</span>
            <span className="w-8 text-center text-red-600">D</span>
            <span className="w-10 text-center">DB</span>
          </div>

          {/* Ligne de l'équipe */}
          <motion.div
            className="flex items-center gap-2 px-4 py-4 rounded-xl"
            style={{
              backgroundColor: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.25)',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Position */}
            <span className="w-8 text-center font-black text-2xl" style={{ color: 'var(--color-accent)' }}>
              {stats.ranking || '–'}
            </span>

            {/* Logo + nom */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                style={{ backgroundColor: 'rgba(249,115,22,0.2)', border: '2px solid rgba(249,115,22,0.4)' }}>
                {imageUrl
                  ? <img src={imageUrl} alt={team.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xs font-black" style={{ color: 'var(--color-accent)' }}>JET</div>
                }
              </div>
              <span className="text-white font-bold text-sm truncate">{team.name}</span>
            </div>

            {/* Points */}
            <span className="w-10 text-center font-black text-2xl" style={{ color: 'var(--color-accent)' }}>
              {stats.points}
            </span>

            {/* J / V / N / D */}
            <span className="w-8 text-center text-gray-300 text-sm">{stats.matches_played}</span>
            <span className="w-8 text-center text-green-400 font-semibold text-sm">{stats.wins}</span>
            <span className="w-8 text-center text-gray-400 text-sm">{stats.draws}</span>
            <span className="w-8 text-center text-red-400 font-semibold text-sm">{stats.losses}</span>

            {/* DB */}
            <span className={`w-10 text-center text-sm font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {diff > 0 ? `+${diff}` : diff}
            </span>
          </motion.div>

          <p className="text-gray-700 text-xs text-center mt-6 uppercase tracking-widest">
            Données issues du scraping FFF · classement partiel
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Page principale ─── */
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
      const matchArr = Array.isArray(matchesData) ? matchesData : (matchesData.results || [])
      // Toujours calculer depuis les matchs (source de vérité), récupérer uniquement le ranking depuis TeamStats
      const computed = computeStatsFromMatches(matchArr)
      const dbStats = statsArr[0] || null
      setStats(computed ? { ...computed, ranking: dbStats?.ranking ?? null } : dbStats)
      setMatches(matchArr)
      const currentSeason = getSeason(new Date())
      const seasons = [...new Set<string>(matchArr.map((m: any) => getSeason(new Date(m.date))))].sort()
      const defaultSeason = seasons.includes(currentSeason) ? currentSeason : (seasons[seasons.length - 1] || '')
      setSelectedSeason(defaultSeason)
      const months = Array.from(new Set<number>(
        matchArr.filter((m: any) => getSeason(new Date(m.date)) === defaultSeason)
          .map((m: any) => new Date(m.date).getMonth())
      )).sort((a, b) => SEASON_MONTH_ORDER.indexOf(a) - SEASON_MONTH_ORDER.indexOf(b))
      if (months.length > 0) setSelectedMonth(months[0])
    }).finally(() => setLoading(false))
  }, [params.id])

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season)
    const months = Array.from(new Set<number>(
      matches.filter((m: any) => getSeason(new Date(m.date)) === season)
        .map((m: any) => new Date(m.date).getMonth())
    )).sort((a, b) => SEASON_MONTH_ORDER.indexOf(a) - SEASON_MONTH_ORDER.indexOf(b))
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
  )).sort((a, b) => SEASON_MONTH_ORDER.indexOf(a) - SEASON_MONTH_ORDER.indexOf(b))

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
          <Link href="/equipes" className="text-sm font-semibold uppercase tracking-wider mb-4 inline-flex items-center gap-2"
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
      {activeTab === 'data' && <DataTab stats={stats} />}

      {activeTab === 'classement' && <ClassementTab stats={stats} team={team} />}

      {activeTab === 'resultats' && (
        <div className="container py-8">
          {availableSeasons.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
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
    </div>
  )
}
