'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { getMediaUrl } from '../lib/api'

interface Article {
  title: string
  image?: string
  published_date: string
  video_url?: string
  content: string
}

export default function ArticleDetail({ article }: { article: Article }) {
  const imageUrl = article.image ? getMediaUrl(article.image) : null

  return (
    <>
      {imageUrl && (
        <motion.div
          className="relative w-full mb-8 bg-gray-100 rounded-lg overflow-hidden"
          style={{ maxHeight: '600px', minHeight: '300px' }}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </motion.div>
      )}

      <motion.p
        className="text-sm font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--color-accent)' }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      >
        {new Date(article.published_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </motion.p>

      <motion.h1
        className="font-black mb-6 text-center"
        style={{ color: 'var(--color-primary)', fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
      >
        {article.title}
      </motion.h1>

      {article.video_url && (
        <motion.div
          className="mb-6 aspect-video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <iframe
            src={article.video_url.replace('watch?v=', 'embed/')}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </motion.div>
      )}

      <motion.div
        className="article-content text-base"
        style={{ color: 'var(--color-text)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </>
  )
}
