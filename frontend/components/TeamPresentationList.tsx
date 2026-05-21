'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { getMediaUrl } from '../lib/api'

interface TeamItem {
  id: number
  display_name: string
  image?: string
  coaches?: string
}

export default function TeamPresentationList({ teams }: { teams: TeamItem[] }) {
  if (!teams.length) return <p className="text-gray-400 italic">Aucune équipe pour le moment.</p>

  return (
    <div className="flex flex-col gap-6 mt-6 mb-6">
      {teams.map((item, i) => {
        const imageUrl = getMediaUrl(item.image)
        const coaches = item.coaches ? item.coaches.split('\n').filter(Boolean) : []

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
            className="rounded-xl overflow-hidden shadow flex"
            style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', minHeight: '180px' }}
          >
            {/* Photo */}
            <div className="w-48 flex-shrink-0" style={{ minHeight: '180px' }}>
              {imageUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={item.display_name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
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
                    {coaches.map((coach: string, j: number) => (
                      <div key={j} className="flex items-center gap-2">
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
          </motion.div>
        )
      })}
    </div>
  )
}
