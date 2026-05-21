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

interface Props {
  articles: Article[]
}

export default function NewsCards({ articles }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {articles.slice(0, 3).map((article, i) => (
        <motion.div
          key={article.slug}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
          whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
        >
          <Link href={`/actualites/${article.slug}`} className="group block h-full">
            <div
              className="bg-white rounded-xl overflow-hidden h-full flex flex-col"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'box-shadow 0.25s' }}
            >
              {article.image && (
                <div className="relative w-full h-52 overflow-hidden flex-shrink-0">
                  <Image
                    src={getMediaUrl(article.image)!}
                    alt={article.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Overlay orange au hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                </div>
              )}

              <div className="p-5 flex flex-col flex-grow">
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>
                  {new Date(article.published_date).toLocaleDateString('fr-FR')}
                </p>
                <h3 className="font-black text-base leading-snug flex-grow" style={{ color: 'var(--color-primary)' }}>
                  {article.title}
                </h3>
                {/* Trait orange animé au hover */}
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
