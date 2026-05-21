import { getArticle, getMediaUrl } from '../../../lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ArticleDetail from '../../../components/ArticleDetail'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const article = await getArticle(params.slug)
    const description = article.content
      ? article.content.replace(/<[^>]+>/g, '').slice(0, 155).trim() + '…'
      : 'Actualité du club Jeune Entente Toulousaine.'
    const imageUrl = article.image ? getMediaUrl(article.image) : undefined
    return {
      title: article.title,
      description,
      openGraph: {
        title: article.title,
        description,
        type: 'article',
        publishedTime: article.published_date,
        authors: ['Jeune Entente Toulousaine'],
        ...(imageUrl ? { images: [{ url: imageUrl, alt: article.title }] } : {}),
      },
    }
  } catch {
    return { title: 'Actualité' }
  }
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  let article: any
  try {
    article = await getArticle(params.slug)
  } catch {
    notFound()
  }

  return (
    <div className="container py-12 max-w-3xl" style={{ paddingBottom: '5rem' }}>
      <Link href="/actualites" className="text-sm font-semibold uppercase tracking-wider mb-6 inline-block" style={{ color: 'var(--color-accent)' }}>
        ← Toutes les actualités
      </Link>

      <ArticleDetail article={article} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            datePublished: article.published_date,
            dateModified: article.updated_at,
            author: { '@type': 'Organization', name: 'Jeune Entente Toulousaine' },
            publisher: {
              '@type': 'Organization',
              name: 'Jeune Entente Toulousaine',
              logo: { '@type': 'ImageObject', url: '/logo.png' },
            },
            ...(article.image ? { image: getMediaUrl(article.image) } : {}),
          }),
        }}
      />
    </div>
  )
}
