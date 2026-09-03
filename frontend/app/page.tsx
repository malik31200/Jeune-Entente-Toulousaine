import { getArticles, getMatches, getTeams, getSponsors, getMediaUrl } from '../lib/api'
import MatchCarousel from '../components/MatchCarousel'
import Link from 'next/link'
import FadeIn from '../components/FadeIn'
import Image from 'next/image'
import NewsCards from '../components/NewsCards'
import HomepageSponsors from '../components/HomepageSponsors'

export const metadata = {
  title: 'Jeune Entente Toulousaine — Club de football à Toulouse',
  description: 'La Jeune Entente Toulousaine est un club formateur dédié aux jeunes, alliant passion, compétition et esprit d\'équipe à Toulouse.',
  openGraph: {
    title: 'Jeune Entente Toulousaine — Club de football à Toulouse',
    description: 'Club formateur toulousain : résultats, actualités, équipes Foot à 11, 8, 5 et Futsal.',
    url: '/',
    type: 'website' as const,
  },
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

    const TEAM_ORDER = ['Seniors', 'Seniors 2', 'U19', 'U18', 'U17', 'U16', 'U15', 'U14', 'Féminines', 'U18 Féminines', 'U15 Elite Féminines', 'U15 Territoire Féminines', 'Futsal']
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    // Marge de tolérance : un match peut rester en statut A_VENIR quelques
    // jours après le coup d'envoi si la FFF n'a pas encore publié le score
    // (délai normal) — on ne l'exclut du "prochain match" que passé ce délai,
    // pour ne pas cacher un résultat simplement pas encore rentré.
    const staleAVenirCutoff = new Date()
    staleAVenirCutoff.setDate(staleAVenirCutoff.getDate() - 4)

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
        // On exclut les matchs restés bloqués en "A_VENIR" depuis plus de
        // 4 jours (résultat jamais récupéré, ex: coupure du scraping FFF) —
        // sinon ils remontent avant les vrais matchs à venir. Un match joué
        // il y a 1-2 jours dont le score n'est pas encore publié reste
        // affiché normalement pendant ce délai.
        .filter((m: any) => m.status === 'A_VENIR' && new Date(m.date) >= staleAVenirCutoff && (!mainComp || m.competition === mainComp))
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
                }}
            >
                    {heroArticle?.image && (
                        <Image
                            src={getMediaUrl(heroArticle.image)!}
                            alt={heroArticle.title}
                            fill
                            className="object-cover object-center"
                            priority
                            sizes="100vw"
                        />
                    )}


                {/* Overlay */}
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)'
                }} />

                {/* Contenu bas */}
                <div className="container relative z-10" style={{ paddingBottom: '5rem' }}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">

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
                                <div className="flex flex-col items-center max-w-sm md:mb-20">
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
                <NewsCards articles={articles} />
                {articles.length > 3 && (
                    <div className="text-center mt-8 mb-8">
                        <Link href="/actualites" className="font-semibold underline" style={{ color: 'var(--color-accent)' }}>
                            Voir toutes les actualités →
                        </Link>
                    </div>
                )}
            </div>
            </section>

            {/* ─── Sponsors ─── */}
            <HomepageSponsors sponsors={sponsors} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SportsOrganization',
              name: 'Jeune Entente Toulousaine',
              alternateName: 'JET',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://jet-toulouse.fr',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jet-toulouse.fr'}/logo.png`,
              sport: 'Football',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Toulouse',
                addressRegion: 'Occitanie',
                addressCountry: 'FR',
              },
            }),
          }}
        />
        </>
    )
}
