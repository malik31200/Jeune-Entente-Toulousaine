'use client'

import { motion } from 'framer-motion'

export default function ClubContent({ html }: { html: string }) {
  return (
    <motion.div
      className="club-content"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
