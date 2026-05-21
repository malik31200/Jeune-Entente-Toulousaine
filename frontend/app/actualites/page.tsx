import { getArticles } from '../../lib/api'
import Link from 'next/link'
import ArticleGrid from '../../components/ArticleGrid'


export const metadata = {
  title: 'Actualités — La JET',
  description: 'Retrouvez toutes les actualités du club de football Jeune Entente Toulousaine.',
}

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const data = await getArticles(page).catch(() => ({ results: [], count: 0, next: null, previous: null }))

  const articles = Array.isArray(data) ? data : (data.results || [])
  const count: number = data.count || 0
  const totalPages = Math.ceil(count / 9)

  return (
    <div className="container py-12" style={{ paddingBottom: '8rem' }}>
      <h1 className="text-3xl font-black uppercase mb-2 mt-8" style={{ color: 'var(--color-primary)' }}>
        Actualités
      </h1>
      <div className="h-1 w-16 mb-10" style={{ backgroundColor: 'var(--color-accent)' }} />

      {articles.length === 0 && (
        <p className="text-gray-500">Aucune actualité pour le moment.</p>
      )}

      <ArticleGrid articles={articles} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={`/actualites?page=${page - 1}`}
              className="px-4 py-2 rounded font-bold text-sm transition-colors"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              ← Précédent
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/actualites?page=${p}`}
              className="w-10 h-10 rounded flex items-center justify-center font-bold text-sm transition-colors"
              style={p === page
                ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }
                : { backgroundColor: '#f3f4f6', color: '#374151' }
              }
            >
              {p}
            </Link>
          ))}

          {page < totalPages && (
            <Link
              href={`/actualites?page=${page + 1}`}
              className="px-4 py-2 rounded font-bold text-sm transition-colors"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              Suivant →
            </Link>
          )}
        </div>
      )}

      {count > 0 && (
        <p className="text-center text-gray-400 text-sm mb-16" style={{ marginTop: '5rem' }}>
          {count} article{count > 1 ? 's' : ''} · page {page} sur {totalPages}
        </p>
      )}
    </div>
  )
}