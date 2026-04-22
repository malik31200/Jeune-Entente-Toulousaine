import { getArticles, getMediaUrl } from '../../lib/api'
import Link from 'next/link'

export default async function ActualitesPage() {
  const data = await getArticles().catch(() => [])
  const articles = Array.isArray(data) ? data : (data.results || [])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-black uppercase mb-8" style={{ color: 'var(--color-primary)' }}>
        Actualités
      </h1>

      {articles.length === 0 && (
        <p className="text-gray-500">Aucune actualité pour le moment.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any) => (
          <Link key={article.slug} href={`/actualites/${article.slug}`} className="group">
            <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow h-full flex flex-col">
              {article.image ? (
                <img src={getMediaUrl(article.image)!} alt={article.title} className="w-full h-48 object-cover object-top" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <span className="text-4xl">⚽</span>
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>
                  {new Date(article.published_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <h2 className="font-bold text-lg group-hover:underline flex-1">{article.title}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
