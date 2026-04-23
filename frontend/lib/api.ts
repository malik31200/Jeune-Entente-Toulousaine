const API_URL = typeof window === 'undefined'
  ? (process.env.API_URL || 'http://backend:8000/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')

export async function fetchAPI(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Erreur API : ${endpoint}`)
        return res.json()
}

export async function getArticles(page = 1) {
    return fetchAPI(`/articles/?page=${page}`)
}

export async function getArticle(slug: string) {
    return fetchAPI(`/articles/${slug}/`)
}

export async function getTeams() {
    return fetchAPI('/teams/')
}

export async function getMatches(teamId?: number, status?: string) {
    let url = '/matches/?'
    if (teamId) url += `team=${teamId}&`
    if (status) url += `status=${status}&`
    return fetchAPI(url)
}

export async function getTrainingSchedules() {
    return fetchAPI('/training-schedules')
}

export async function getSponsors() {
    return fetchAPI('/sponsors')
}

export async function getTeamStats(teamId?: number) {
    let url = '/team-stats/'
    if (teamId) url += `?team=${teamId}`
    return fetchAPI(url)
}

export async function getSiteSettings() {
    return fetchAPI('/site-settings/')
}

export function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://backend:8000')) return url.replace('http://backend:8000', 'http://localhost:8000')
  if (url.startsWith('/media/')) return `http://localhost:8000${url}`
  return url
}
