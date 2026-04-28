import { getArticles, getMatches, getTeams, getSponsors, getMediaUrl } from '../lib/api'
import MatchCarousel from '../components/MatchCarousel'
import Link from 'next/link'
import FadeIn from '../components/FadeIn'

export const metada = {
    title: 'Jeune Entente Toulousaine - Club de football à Toulouse',
    description: 'La Jeune Entente Toulousaine est un club formateur dédié aux jeunes, alliant passion, compétition et esprit d\'équipe.'
}

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

    const carouselMatches: any[] = []
    for (const teamName of TEAM_ORDER) {
      const team = teams.find((t: any) => t.name === teamName)
      if (!team) continue
      const teamMatches = allMatches.filter((m: any) => m.team === team.id)

      // Compétition principale = celle avec le plus de matchs terminés
      const terminated = teamMatches.filter((m: any) => m.status === 'TERMINE' && m.home_score !== null)
      const compCount: Record<string, number> = {}
      for (const m of terminated) compCount[m.competition] = (compCount[m.competition] || 0) + 1
      const mainComp = Object.keys(compCount).length > 0
        ? Object.entries(compCount).sort(([, a], [, b]) => b - a)[0][0]
        : null

      const lastResult = terminated
        .filter((m: any) => (!mainComp || m.competition === mainComp) && new Date(m.date) >= sixtyDaysAgo)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      const nextMatch = teamMatches
        .filter((m: any) => m.status === 'A_VENIR' && (!mainComp || m.competition === mainComp))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

      if (lastResult) carouselMatches.push({ ...lastResult, team_name: teamName })
      if (nextMatch) carouselMatches.push({ ...nextMatch, team_name: teamName })
    }

    return (
        <>
            {/* ─── Hero plein écran ─── */}
            <section
                className="relative flex flex-col justify-end"
                style={{
                    minHeight: 'calc(100vh - 64px)',
                    backgroundColor: 'var(--color-primary)',
                    backgroundImage: heroArticle?.image ? `url(${getMediaUrl(heroArticle.image)})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)'
                }} />

                {/* Contenu bas */}
                <div className="container relative z-10" style={{ paddingBottom: '5rem' }}>
                    <div className="flex items-end justify-between gap-6">

                        {/* Gauche : titre du club */}
                        <FadeIn>
                            <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-accent)' }}>
                                Jeune Entente Toulousaine
                            </p>
                            <h1
                                className="leading-none font-black uppercase"
                                style={{
                                    fontFamily: 'var(--font-bebas, Bebas Neue, sans-serif)',
                                    fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                                    color: 'white',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                BIENVENUE
                            </h1>
                            <h2
                                className="leading-none font-black uppercase"
                                style={{
                                    fontFamily: 'var(--font-bebas, Bebas Neue, sans-serif)',
                                    fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                                    color: 'var(--color-accent)',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                À LA JET
                            </h2>
                        </FadeIn>

                        {/* Droite : dernier article */}
                        {heroArticle && (
                            <FadeIn delay={0.2}>
                                <div className="flex flex-col items-center max-w-sm mb-20">
                                    <p className="text-white font-black uppercase mb-4 leading-tight text-center w-full" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
                                        {heroArticle.title}
                                    </p>
                                    <Link
                                        href={`/actualites/${heroArticle.slug}`}
                                        className="flex items-center justify-center gap-2 font-bold px-6 py-3 rounded transition-opacity hover:opacity-80 w-full"
                                        style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                                    >
                                        Lire l'article →
                                    </Link>
                                </div>
                            </FadeIn>
                        )}

                    </div>
                </div>
            </section>

            {/* ─── Carrousel matchs ─── */}
            <MatchCarousel matches={carouselMatches} />

            {/* ─── Dernières actus ─── */}
            <section style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="container py-16">
                <FadeIn delay={0.2}>
                    <h2 className="text-2xl font-black uppercase mb-8 mt-8" style={{ color: 'var(--color-primary)' }}>
                        Dernières actualités
                    </h2>
                </FadeIn>
                <FadeIn delay={0.4}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {articles.slice(0, 3).map((article: any) => (
                            <Link key={article.slug} href={`/actualites/${article.slug}`} className="group">
                                <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                                    {article.image && (
                                        <img src={getMediaUrl(article.image)!} alt={article.title} className="w-full h-48 object-cover object-top" />
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
                </FadeIn>
                {articles.length > 3 && (
                    <div className="text-center mt-8">
                        <Link href="/actualites" className="font-semibold underline" style={{ color: 'var(--color-accent)' }}>
                            Voir toutes les actualités →
                        </Link>
                    </div>
                )}
            </div>
            </section>

            {/* ─── Sponsors ─── */}
            {sponsors.length > 0 && (
                <section className="py-12 border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                    <div className="container">
                        <p className="text-center text-xl font-bold uppercase tracking-widest mb-8" style={{ color: 'var(--color-text-light)' }}>
                            Nos partenaires
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-8">
                            {sponsors.map((sponsor: any) => (
                                sponsor.website_url ? (
                                    <a key={sponsor.id} href={sponsor.website_url} target="_blank" rel="noopener noreferrer"
                                        className="opacity-60 hover:opacity-100 transition-opacity">
                                        {sponsor.logo
                                            ? <img src={getMediaUrl(sponsor.logo)!} alt={sponsor.name} className="h-12 object-contain" />
                                            : <span className="font-bold text-lg" style={{ color: 'var(--color-text-light)' }}>{sponsor.name}</span>
                                        }
                                    </a>
                                ) : (
                                    <div key={sponsor.id} className="opacity-60">
                                        {sponsor.logo
                                            ? <img src={getMediaUrl(sponsor.logo)!} alt={sponsor.name} className="h-12 object-contain" />
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
