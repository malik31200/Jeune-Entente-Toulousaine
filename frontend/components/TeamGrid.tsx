'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { getMediaUrl } from '../lib/api'

interface Team {
  id: number
  name: string
  image?: string
}

export default function TeamGrid({ teams }: { teams: Team[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
      {teams.map((team, i) => {
        const imageUrl = getMediaUrl(team.image)
        return (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.09, ease: 'easeOut' }}
            whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
          >
            <Link href={`/equipes/${team.id}`}>
              <div
                className="rounded-lg overflow-hidden cursor-pointer group"
                style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', transition: 'box-shadow 0.25s' }}
              >
                <div className="relative h-40 overflow-hidden">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={team.name}
                        fill
                        className="object-cover object-top transition-transform duration-400 group-hover:scale-108"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                        <span className="text-2xl">⚽</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3">
                  <h2 className="text-white font-bold text-base group-hover:text-orange-400 transition-colors">
                    {team.name}
                  </h2>
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
