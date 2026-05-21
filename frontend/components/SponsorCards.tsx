'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { getMediaUrl } from '../lib/api'

interface Sponsor {
  id: number
  name: string
  logo?: string
  website_url?: string
  description?: string
}

export default function SponsorCards({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ alignItems: 'stretch' }}>
      {sponsors.map((sponsor, i) => {
        const logoUrl = getMediaUrl(sponsor.logo)

        const card = (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.09, ease: 'easeOut' }}
            whileHover={{ y: -7, boxShadow: '0 16px 40px rgba(0,0,0,0.12)', transition: { duration: 0.2, ease: 'easeOut' } }}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-4 group cursor-pointer border border-transparent hover:border-orange-200 h-full"
          >
            {logoUrl ? (
              <div className="relative h-20 w-full flex-shrink-0 overflow-hidden">
                <Image
                  src={logoUrl}
                  alt={sponsor.name}
                  fill
                  className="object-contain transition-transform duration-400 group-hover:scale-105"
                  sizes="(max-width: 768px) 40vw, 200px"
                />
              </div>
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
              >
                {sponsor.name.charAt(0)}
              </div>
            )}

            <p className="font-bold text-center text-sm transition-colors group-hover:text-orange-500" style={{ color: 'var(--color-primary)' }}>
              {sponsor.name}
            </p>

            {sponsor.description && (
              <p className="text-xs text-center text-gray-500 leading-relaxed -mt-2 flex-grow">
                {sponsor.description}
              </p>
            )}

            {sponsor.website_url && (
              <span className="text-sm font-bold mt-auto" style={{ color: 'var(--color-accent)' }}>
                Visiter le site →
              </span>
            )}
          </motion.div>
        )

        return sponsor.website_url ? (
          <a key={sponsor.id} href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="flex flex-col">
            {card}
          </a>
        ) : (
          <div key={sponsor.id} className="flex flex-col">{card}</div>
        )
      })}
    </div>
  )
}
