import { getClubPage, getMediaUrl } from '../../lib/api'
import Image from 'next/image'

export const metadata = {
  title: 'Le Club — Jeune Entente Toulousaine',
  description: 'Découvrez l\'histoire et les valeurs de la Jeune Entente Toulousaine.',
}

export default async function ClubPage() {
  let page: any = { title: 'Notre Club', subtitle: '', content: '', image: null }
  try {
    page = await getClubPage()
  } catch {}

  const imageUrl = getMediaUrl(page.image)

  // Si le contenu est du texte brut (pas de balises HTML), on convertit les sauts de ligne en paragraphes
  const hasHtml = page.content && /<[a-z][\s\S]*>/i.test(page.content)
  const contentHtml = hasHtml
    ? page.content
    : page.content
      ? page.content.split(/\n\n+/).map((p: string) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
      : ''

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Bannière */}
      <div
        className="relative flex items-end"
        style={{ minHeight: '320px', backgroundColor: 'var(--color-primary)' }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={page.title}
            fill
            className="object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
        )}
        {/* Overlay dégradé */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.25) 100%)'
        }} />
        <div className="container relative z-10 py-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-accent)' }}>
            Jeune Entente Toulousaine
          </p>
          <h1 className="text-white font-black uppercase leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="text-gray-300 text-lg mt-4 mb-4 max-w-xl leading-relaxed">{page.subtitle}</p>
          )}
        </div>
      </div>

      {/* Séparateur orange */}
      <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-accent)' }} />

      {/* Contenu */}
      <div className="container max-w-3xl" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {contentHtml ? (
          <div
            className="club-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p className="text-gray-400 italic">
            Le contenu de cette page n&apos;a pas encore été renseigné. Connectez-vous à l&apos;administration pour ajouter l&apos;histoire du club.
          </p>
        )}
      </div>

      <style>{`
        .club-content {
          color: var(--color-text);
          font-size: 1.0625rem;
          line-height: 1.85;
        }
        .club-content p {
          margin-bottom: 1.5rem;
        }
        .club-content h2, .club-content h3 {
          font-weight: 900;
          text-transform: uppercase;
          color: var(--color-primary);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          font-size: 1.25rem;
          letter-spacing: 0.05em;
        }
        .club-content strong {
          font-weight: 700;
          color: var(--color-primary);
        }
        .club-content a {
          color: var(--color-accent);
          text-decoration: underline;
        }
        .club-content ul, .club-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .club-content li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  )
}
