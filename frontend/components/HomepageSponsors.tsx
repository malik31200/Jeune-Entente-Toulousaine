'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { getMediaUrl } from '../lib/api'

interface Sponsor {
  id: number
  name: string
  logo?: string
  website_url?: string
}

export default function HomepageSponsors({ sponsors }: { sponsors: Sponsor[] }) {
  if (!sponsors.length) return null

  return (
    <section className="py-12 border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
      <div className="container">
        <motion.p
          className="text-center text-xl font-bold uppercase tracking-widest mb-8"
          style={{ color: 'var(--color-text-light)' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          Nos partenaires
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-8">
          {sponsors.map((sponsor, i) => {
            const logoUrl = sponsor.logo ? getMediaUrl(sponsor.logo) : null
            const inner = logoUrl ? (
              <div className="relative h-12 w-32">
                <Image src={logoUrl} alt={sponsor.name} fill className="object-contain" sizes="128px" />
              </div>
            ) : (
              <span className="font-bold text-lg" style={{ color: 'var(--color-text-light)' }}>{sponsor.name}</span>
            )

            return (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: 'easeOut' }}
                whileHover={{ scale: 1.1, opacity: 1, transition: { duration: 0.2 } }}
                style={{ opacity: 0.6 }}
              >
                {sponsor.website_url ? (
                  <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : inner}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
