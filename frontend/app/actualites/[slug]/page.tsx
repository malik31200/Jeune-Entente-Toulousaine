import { getArticle, getMediaUrl } from '../../../lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

      {article.image && (
      <div className="relative w-full mb-8 bg-gray-100 rounded-lg overflow-hidden" style={{ maxHeight: '600px', minHeight: '300px' }}>
        <Image
          src={getMediaUrl(article.image)!}
          alt={article.title}
          fill
          className="object-contain"
          sizes="100vw"
        />
      </div>

      )}

      <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-accent)' }}>
        {new Date(article.published_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>

      <h1 className="font-black mb-6 text-center" style={{ color: 'var(--color-primary)', fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
        {article.title}
      </h1>

      {article.video_url && (
        <div className="mb-6 aspect-video">
          <iframe
            src={article.video_url.replace('watch?v=', 'embed/')}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      )}

      <div
        className="leading-relaxed text-base"
        style={{ color: 'var(--color-text)' }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  )
}
