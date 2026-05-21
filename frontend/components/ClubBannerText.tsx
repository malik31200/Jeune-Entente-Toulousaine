'use client'

import { motion } from 'framer-motion'

interface Props {
  title: string
  subtitle?: string
}

export default function ClubBannerText({ title, subtitle }: Props) {
  return (
    <div className="container relative z-10 py-14">
      <motion.p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-accent)' }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        Jeune Entente Toulousaine
      </motion.p>

      <motion.h1
        className="text-white font-black uppercase leading-none mb-10"
        style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          className="text-gray-300 text-lg mt-4 mb-4 max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
