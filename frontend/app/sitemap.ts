import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jet-toulouse.fr'
const API_URL = process.env.API_URL || 'http://backend:8000/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/actualites`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/club`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/equipes`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/equipes/foot-a-8`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/equipes/foot-a-5`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/equipes/futsal`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/horaires`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/detections`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/galerie`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/partenaires`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  let articleUrls: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_URL}/articles/?page_size=200`, { cache: 'no-store' })
    const data = await res.json()
    const articles = Array.isArray(data) ? data : (data.results || [])
    articleUrls = articles
      .filter((a: any) => a.is_published)
      .map((a: any) => ({
        url: `${SITE_URL}/actualites/${a.slug}`,
        lastModified: new Date(a.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
  } catch {}

  let teamUrls: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_URL}/teams/`, { cache: 'no-store' })
    const data = await res.json()
    const teams = Array.isArray(data) ? data : (data.results || [])
    teamUrls = teams.map((t: any) => ({
      url: `${SITE_URL}/equipes/${t.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {}

  return [...staticPages, ...articleUrls, ...teamUrls]
}
