'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  team_name?: string
}

function MatchCard({ match }: { match: Match }) {
  const isTermine = match.status === 'TERMINE'
  const date = new Date(match.date)
  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
  const jetIsHome = match.is_home

  let jetWon = false, jetLost = false
  if (isTermine && match.home_score !== null && match.away_score !== null) {
    const homeWins = match.home_score > match.away_score
    const awayWins = match.away_score > match.home_score
    jetWon = (jetIsHome && homeWins) || (!jetIsHome && awayWins)
    jetLost = (jetIsHome && awayWins) || (!jetIsHome && homeWins)
  }

  const stripColor = isTermine
    ? jetWon ? '#22c55e' : jetLost ? '#ef4444' : '#eab308'
    : 'var(--color-accent)'

  const badgeBg = isTermine
    ? jetWon ? 'rgba(34,197,94,0.15)' : jetLost ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)'
    : 'rgba(249,115,22,0.18)'

  const badgeColor = isTermine
    ? jetWon ? '#22c55e' : jetLost ? '#ef4444' : '#eab308'
    : 'var(--color-accent)'

  const badgeLabel = isTermine
    ? jetWon ? 'VICTOIRE' : jetLost ? 'DÉFAITE' : 'NUL'
    : 'À VENIR'

  return (
    <motion.div
      className="rounded-xl overflow-hidden w-full"
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      whileHover={{
        scale: 1.04,
        y: -8,
        boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.3)',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Bande couleur résultat */}
      <div className="h-1 w-full" style={{ backgroundColor: stripColor }} />

      {/* Compétition + catégorie */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: 'var(--color-accent)' }}>
          {match.competition}
        </p>
        {match.team_name && (
          <span
            className="inline-block text-xs font-semibold mt-1.5 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(249,115,22,0.12)', color: 'rgba(249,115,22,0.85)' }}
          >
            {match.team_name}
          </span>
        )}
      </div>

      {/* Équipes + score */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-1">
          <div className="flex-1 text-right min-w-0">
            <p className={`font-black text-sm leading-tight truncate ${jetIsHome ? 'text-white' : 'text-gray-500'}`}>
              {match.home_team}
            </p>
          </div>
          <div className="flex-shrink-0 w-16 text-center">
            {isTermine ? (
              <p className="text-2xl font-black text-white tracking-tight">
                {match.home_score}–{match.away_score}
              </p>
            ) : (
              <p className="text-sm font-bold text-gray-500">VS</p>
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className={`font-black text-sm leading-tight truncate ${!jetIsHome ? 'text-white' : 'text-gray-500'}`}>
              {match.away_team}
            </p>
          </div>
        </div>
      </div>

      {/* Date + badge */}
      <div
        className="px-4 pb-4 pt-2 flex items-center justify-between gap-2 border-t"
        style={{ borderColor: 'rgba(235, 231, 231, 0.06)' }}
      >
        <span className="text-xs text-gray-500">{dateStr} · {timeStr}</span>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
        >
          {badgeLabel}
        </span>
      </div>
    </motion.div>
  )
}

function ArrowButton({
  onClick,
  disabled,
  direction,
  visible,
}: {
  onClick: () => void
  disabled: boolean
  direction: 'left' | 'right'
  visible: boolean
}) {
  const isLeft = direction === 'left'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
      style={{
        [isLeft ? 'left' : 'right']: '1rem',
        opacity: visible && !disabled ? 1 : 0,
        pointerEvents: visible && !disabled ? 'auto' : 'none',
        backgroundColor: isLeft ? 'rgba(255,255,255,0.1)' : 'var(--color-accent)',
        backdropFilter: isLeft ? 'blur(8px)' : undefined,
        border: isLeft ? '1px solid rgba(255,255,255,0.15)' : undefined,
        transform: 'translateY(-50%)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {isLeft ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  )
}

export default function MatchCarousel({ matches }: { matches: Match[] }) {
  const [startIndex, setStartIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(4)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisible(1)
      else if (window.innerWidth < 1024) setVisible(2)
      else setVisible(4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!matches.length) return null

  const canPrev = startIndex > 0
  const canNext = startIndex < matches.length - visible
  const dotsCount = Math.max(0, matches.length - visible + 1)

  const prev = () => {
    if (!canPrev) return
    setDirection(-1)
    setStartIndex((i) => i - 1)
  }
  const next = () => {
    if (!canNext) return
    setDirection(1)
    setStartIndex((i) => i + 1)
  }

  return (
    <section
      className="relative py-8"
      style={{ backgroundColor: 'var(--color-primary)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (diff > 50) next()
        else if (diff < -50) prev()
        touchStartX.current = null
      }}
    >
      <ArrowButton onClick={prev} disabled={!canPrev} direction="left" visible={hovered} />
      <ArrowButton onClick={next} disabled={!canNext} direction="right" visible={hovered} />

      <div className="container">
        <h2 className="text-white font-black uppercase text-sm tracking-widest mb-5 flex items-center gap-3">
          <span className="inline-block w-4 h-0.5" style={{ backgroundColor: 'var(--color-accent)' }} />
          Résultats &amp; Calendrier
        </h2>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(visible, matches.length)}, 1fr)` }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {matches.slice(startIndex, startIndex + visible).map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <MatchCard match={match} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {dotsCount > 1 && (
          <div className="flex justify-center gap-1.5 mt-5">
            {Array.from({ length: dotsCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > startIndex ? 1 : -1)
                  setStartIndex(i)
                }}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === startIndex ? '24px' : '6px',
                  backgroundColor: i === startIndex ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
