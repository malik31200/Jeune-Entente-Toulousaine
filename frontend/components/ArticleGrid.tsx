'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { getMediaUrl } from '../lib/api'

interface Article {
  slug: string
  title: string
  image?: string
  published_date: string
}

export default function ArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, i) => (
        <motion.div
          key={article.slug}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: 'easeOut' }}
          whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
        >
          <Link href={`/actualites/${article.slug}`} className="group block h-full">
            <div
              className="bg-white rounded-xl overflow-hidden h-full flex flex-col"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
              {article.image ? (
                <div className="relative w-full h-48 overflow-hidden flex-shrink-0">
                  <Image
                    src={getMediaUrl(article.image)!}
                    alt={article.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <span className="text-4xl">⚽</span>
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>
                  {new Date(article.published_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <h2 className="font-black text-base leading-snug flex-1" style={{ color: 'var(--color-primary)' }}>
                  {article.title}
                </h2>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="block h-0.5 w-0 group-hover:w-8 transition-all duration-300 rounded-full"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                  <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--color-accent)' }}>
                    Lire l&apos;article
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
