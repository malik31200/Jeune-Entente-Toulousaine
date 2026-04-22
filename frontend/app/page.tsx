import { getArticles, getMatches,  getTeams, getSponsors } from '../lib/api'
import MatchCarousel from '../components/MatchCarousel'
import Link from 'next/link'

export default async function Home() {
    const [articlesData, matchesData, teamsData, sponsorsData] = await Promise.all([
      getArticles().catch(() => []),
      getMatches().catch(() => []),
      getTeams().catch(() => []),
      getSponsors().catch(() => []),
    ])

    const articles = Array.isArray(articlesData) ? articlesData : (articlesData.results || [])
    const allMatches = Array.isArray(matchesData) ? matchesData : (matchesData.results || [])
    const teams = Array.isArray(teamsData) ? teamsData : (teamsData.results || [])
    const heroArticle = articles[0] || null
    const sponsors = Array.isArray(sponsorsData) ? sponsorsData : (sponsorsData.results || [])


    const TEAM_ORDER = ['Seniors', 'Seniors 2', 'U19', 'U17', 'U16', 'U15', 'U14', 'Féminines', 'U18 Féminines', 'U15 Féminines', 'Futsal']

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const matches: any[] = []
    for (const teamName of TEAM_ORDER) {
      const team = teams.find((t: any) => t.name === teamName)
      if (!team) continue

    const teamMatches = allMatches.filter((m: any) => m.team === team.id)

    const lastResult = [...teamMatches]
      .filter((m: any) => m.status === 'TERMINE' && m.home_score !== null && new Date(m.date) >= sixtyDaysAgo)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const nextMatch = [...teamMatches]
      .filter((m: any) => m.status === 'A_VENIR')
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

    if (lastResult) matches.push({ ...lastResult, team_name: teamName })
    if (nextMatch) matches.push({ ...nextMatch, team_name: teamName })
  }



  return (
    <>
      {/* Hero */}
      <section
        className="relative flex items-end min-h-[70vh]"
        style={{
          backgroundColor: 'var(--color-primary)',
          backgroundImage: heroArticle?.image ? `url(${heroArticle.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        <div className="container relative z-10 pb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>
            Actualité
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black max-w-3xl leading-tight mb-4">
            {heroArticle?.title || 'Bienvenue à la Jeune Entente Toulousaine'}
          </h1>
          {heroArticle && (
            <Link
              href={`/actualites/${heroArticle.slug}`}
              className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
            >
              Lire l'article →
            </Link>
          )}
        </div>
      </section>

      {/* Carrousel matchs */}
      <MatchCarousel matches={matches} />

      {/* Dernières actus */}
      <section className="container py-16">
        <h2 className="text-2xl font-black uppercase mb-8" style={{ color: 'var(--color-primary)' }}>
          Dernières actualités
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article: any) => (
            <Link key={article.slug} href={`/actualites/${article.slug}`} className="group">
              <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                {article.image && (
                  <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-accent)' }}>
                    {new Date(article.published_date).toLocaleDateString('fr-FR')}
                  </p>
                  <h3 className="font-bold text-lg group-hover:underline">{article.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {articles.length > 3 && (
          <div className="text-center mt-8">
            <Link href="/actualites" className="font-semibold underline" style={{ color: 'var(--color-accent)' }}>
              Voir toutes les actualités →
            </Link>
          </div>
        )}
      </section>

      {/* Sponsors */}
{sponsors.length > 0 && (
  <section className="py-12 border-t" style={{ borderColor: 'var(--color-border)' }}>
    <div className="container">
      <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: 'var(--color-text-light)' }}>
        Nos partenaires
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {sponsors.map((sponsor: any) => (
          sponsor.website_url ? (
            <a key={sponsor.id} href={sponsor.website_url} target="_blank" rel="noopener noreferrer"
               className="opacity-60 hover:opacity-100 transition-opacity">
              {sponsor.logo
                ? <img src={sponsor.logo} alt={sponsor.name} className="h-12 object-contain" />
                : <span className="font-bold text-lg" style={{ color: 'var(--color-text-light)' }}>{sponsor.name}</span>
              }
            </a>
          ) : (
            <div key={sponsor.id} className="opacity-60">
              {sponsor.logo
                ? <img src={sponsor.logo} alt={sponsor.name} className="h-12 object-contain" />
                : <span className="font-bold text-lg" style={{ color: 'var(--color-text-light)' }}>{sponsor.name}</span>
              }
            </div>
          )
        ))}
      </div>
    </div>
  </section>
)}

    </>
  )
}
