# Phase 2 : Frontend Next.js

## Objectif
Créer le site public complet : pages, composants, appels API, et design noir/orange JET.

---

## Architecture des fichiers

```
frontend/
├── app/                        ← Pages (App Router Next.js 14)
│   ├── layout.tsx              ← Layout global (Header + Footer)
│   ├── page.tsx                ← Page d'accueil
│   ├── globals.css             ← Variables CSS + styles globaux
│   ├── actualites/
│   │   ├── page.tsx            ← Liste des articles
│   │   └── [slug]/page.tsx     ← Détail d'un article
│   ├── equipes/
│   │   ├── page.tsx            ← Grille des équipes
│   │   └── [id]/page.tsx       ← Détail équipe (3 onglets)
│   ├── horaires/
│   │   └── page.tsx            ← Horaires d'entraînement
│   └── contact/
│       └── page.tsx            ← Formulaire de contact
├── components/
│   ├── Header.tsx              ← Barre de navigation
│   ├── Footer.tsx              ← Pied de page
│   └── MatchCarousel.tsx       ← Carrousel de matchs (accueil)
└── lib/
    └── api.ts                  ← Fonctions d'appel à l'API backend
```

---

## Concept clé : Server Components vs Client Components

Next.js 14 App Router distingue deux types de composants :

### Server Components (par défaut)
- S'exécutent **côté serveur** au moment de la requête
- Peuvent faire des `fetch` directement (accès réseau interne Docker)
- **Pas** de `useState`, `useEffect`, ou événements
- Exemples : `app/page.tsx`, `app/actualites/page.tsx`, `app/equipes/page.tsx`

```tsx
// Server Component — pas de 'use client'
export default async function HomePage() {
  const articles = await getArticles()  // fetch côté serveur
  return <div>{articles.map(...)}</div>
}
```

### Client Components
- S'exécutent **dans le navigateur**
- Peuvent utiliser `useState`, `useEffect`, gérer des événements
- Déclarés avec `'use client'` en première ligne
- Exemples : `Header.tsx`, `MatchCarousel.tsx`, `app/equipes/[id]/page.tsx`

```tsx
'use client'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  // ...
}
```

**Règle simple** : si la page a besoin d'interactivité (boutons, filtres, état) → Client Component. Sinon → Server Component (plus rapide).

---

## Concept clé : URL API selon l'environnement

Le frontend tourne dans deux contextes différents :

| Contexte | Qui fait la requête | URL à utiliser |
|---|---|---|
| Server Component | Container Next.js (dans Docker) | `http://backend:8000/api` |
| Client Component | Navigateur de l'utilisateur | `http://localhost:8000/api` |

C'est pourquoi `lib/api.ts` détecte le contexte :

```typescript
const API_URL = typeof window === 'undefined'
  ? (process.env.API_URL || 'http://backend:8000/api')      // serveur
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')  // navigateur
```

- `typeof window === 'undefined'` → vrai côté serveur, faux dans le navigateur
- `process.env.API_URL` → variable d'environnement côté serveur (pas de préfixe NEXT_PUBLIC_)
- `process.env.NEXT_PUBLIC_API_URL` → variable exposée au navigateur (préfixe obligatoire)

Dans les **Client Components**, on n'utilise pas `lib/api.ts` mais `fetch` directement avec `NEXT_PUBLIC_API_URL`.

---

## Étape 1 : globals.css — Palette de couleurs

```css
:root {
  --color-primary: #111111;        /* Noir principal */
  --color-primary-light: #1f1f1f;  /* Noir légèrement plus clair */
  --color-accent: #f97316;         /* Orange JET */
  --color-accent-hover: #ea6c0a;   /* Orange foncé (hover) */
  --color-text: #1f2937;           /* Texte principal */
  --color-text-light: #6b7280;     /* Texte secondaire */
  --color-bg: #f9fafb;             /* Fond de page */
}
```

Ces variables sont utilisées partout via `style={{ color: 'var(--color-accent)' }}`. Changer une variable ici change le design sur tout le site.

---

## Étape 2 : lib/api.ts — Fonctions d'appel API

Centralise tous les appels vers le backend Django :

```typescript
export async function fetchAPI(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Erreur API : ${endpoint}`)
  return res.json()
}

export async function getArticles() { return fetchAPI('/articles/') }
export async function getArticle(slug: string) { return fetchAPI(`/articles/${slug}/`) }
export async function getTeams() { return fetchAPI('/teams/') }
export async function getMatches(teamId?: number) { ... }
export async function getTeamStats(teamId?: number) { ... }
export async function getTrainingSchedules() { return fetchAPI('/training-schedules/') }
```

- `cache: 'no-store'` : désactive le cache Next.js → données toujours fraîches
- Si l'API renvoie une erreur HTTP → `throw new Error()` → la page affiche le fallback

**Pattern de sécurité** dans les pages :
```typescript
const data = await getArticles().catch(() => [])
const articles = Array.isArray(data) ? data : (data.results || [])
```
- `.catch(() => [])` : si l'API est down, on renvoie un tableau vide (pas de crash)
- `Array.isArray(data) ? data : data.results` : DRF peut renvoyer `[]` ou `{results: []}` selon la pagination

---

## Étape 3 : layout.tsx — Structure globale

Appliqué à **toutes les pages** automatiquement par Next.js :

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>  {/* ← contenu de chaque page */}
        <Footer />
      </body>
    </html>
  )
}
```

`{children}` est remplacé par le contenu de la page visitée. Header et Footer n'ont pas besoin d'être importés dans chaque page.

---

## Étape 4 : Header.tsx — Navigation

Client Component avec gestion du menu mobile :

```
État : menuOpen (boolean)
  → false : menu mobile caché
  → true  : menu mobile visible
```

Navigation :
- Desktop : liens horizontaux (hidden md:flex)
- Mobile : bouton hamburger → menu vertical déroulant

---

## Étape 5 : page.tsx — Page d'accueil

**Server Component** qui fait 3 appels API en parallèle :

```typescript
const [articlesData, matchesData, teamsData] = await Promise.all([
  getArticles().catch(() => []),
  getMatches().catch(() => []),
  getTeams().catch(() => []),
])
```

`Promise.all` lance les 3 requêtes simultanément → plus rapide que 3 `await` séquentiels.

### Logique du carrousel de matchs

Pour chaque équipe (dans l'ordre Seniors → U14) :
1. Filtrer les matchs de cette équipe
2. Prendre le **dernier résultat** : match TERMINE avec score, date < 60 jours
3. Prendre le **prochain match** : match A_VENIR, le plus proche dans le temps

```typescript
const sixtyDaysAgo = new Date()
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

const lastResult = [...teamMatches]
  .filter(m => m.status === 'TERMINE' && m.home_score !== null && new Date(m.date) >= sixtyDaysAgo)
  .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

const nextMatch = [...teamMatches]
  .filter(m => m.status === 'A_VENIR')
  .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
```

Le filtre 60 jours évite d'afficher d'anciens matchs de coupe (ex: Gambardella de septembre) comme "dernier résultat" en avril.

---

## Étape 6 : MatchCarousel.tsx — Carrousel

Client Component avec navigation par flèches :

```
État : startIndex (nombre)
  → tranche affichée : matches[startIndex ... startIndex + 4]
  → ← : startIndex - 1 (min 0)
  → → : startIndex + 1 (max = total - 4)
```

Chaque carte (MatchCard) affiche :
- Nom de l'équipe (orange)
- Compétition + date/heure
- Score (si TERMINE) ou "vs" (si À VENIR)
- Badge coloré TERMINÉ/À VENIR

---

## Étape 7 : actualites/ — Articles

### `app/actualites/page.tsx` (Server Component)
- Récupère tous les articles publiés via `getArticles()`
- Affiche une grille responsive 1→2→3 colonnes

### `app/actualites/[slug]/page.tsx` (Server Component)
- `[slug]` = segment dynamique : `/actualites/mon-article` → `params.slug = "mon-article"`
- `notFound()` de Next.js → page 404 si l'article n'existe pas
- Le contenu texte est splitté par `\n` pour créer des paragraphes `<p>`

---

## Étape 8 : equipes/ — Équipes

### `app/equipes/page.tsx` (Server Component)
- Récupère la liste des équipes et les trie selon `TEAM_ORDER`
- Chaque carte est un lien vers `/equipes/{id}`

### `app/equipes/[id]/page.tsx` (Client Component)

3 appels API en parallèle au chargement :
```typescript
Promise.all([
  fetch(`${API_URL}/teams/${id}/`),       // infos équipe
  fetch(`${API_URL}/team-stats/?team=${id}`), // statistiques
  fetch(`${API_URL}/matches/?team=${id}`),    // tous les matchs
])
```

**Fonction getSeason** — détermine la saison footballistique d'une date :
```typescript
function getSeason(date: Date): string {
  const y = date.getFullYear()
  const m = date.getMonth()
  return m >= 7 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}
// Août 2025 → "2025/2026"
// Avril 2026 → "2025/2026"
// Juillet 2027 → "2026/2027"
```

**Ordre des mois footballistiques** :
```typescript
const SEASON_MONTH_ORDER = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6]
// = [Août, Sep, Oct, Nov, Déc, Jan, Fév, Mar, Avr, Mai, Juin, Juil]
```

**Onglet DATA** :
- `stats.form` = chaîne "VVNDV" → chaque caractère devient un badge coloré (V=vert, N=gris, D=rouge)
- Victoires/Nuls/Défaites en gros chiffres
- Buts marqués vs encaissés

**Onglet RÉSULTATS/CALENDRIER** :
- Sélecteur de saison (affiché si au moins une saison disponible)
- Sélecteur de mois (filtré par saison sélectionnée)
- Matchs triés par date croissante (début → fin du mois)

**Onglet CLASSEMENT** :
- Affiche les stats de l'équipe dans un tableau (position, J, V, N, D, DB, Pts)
- Note : classement partiel (seulement notre équipe, pas tout le championnat)

---

## Étape 9 : horaires/page.tsx

Client Component qui :
1. Charge `/training-schedules/` depuis l'API
2. Groupe les créneaux par équipe (`byTeam[teamName].push(slot)`)
3. Trie chaque groupe par jour de la semaine (`DAYS_ORDER`)
4. Affiche une carte par équipe avec ses créneaux

---

## Étape 10 : contact/page.tsx

Client Component avec gestion d'état du formulaire :

```
État : form { name, email, phone, subject, message }
État : status 'idle' | 'loading' | 'success' | 'error'
```

Flux d'envoi :
1. `handleSubmit` → `setStatus('loading')` → bouton désactivé
2. POST vers `/api/contact/` avec le JSON du formulaire
3. Succès → `setStatus('success')` + reset du formulaire
4. Erreur → `setStatus('error')` + message rouge

**Côté backend** (`views.py`) :
```python
@api_view(['POST'])
@permission_classes([AllowAny])   # ← accessible sans authentification
def contact_view(request):
    # Construit le corps de l'email avec les champs reçus
    # En dev : EMAIL_BACKEND = console → affiche dans les logs Docker
    # En prod : remplacer par SMTP Gmail/SendGrid
```

---

## Schéma des flux de données

```
Navigateur
    │
    ├── GET /                    → page.tsx (Server)
    │       └── Promise.all([articles, matches, teams])
    │               └── http://backend:8000/api/...  (réseau Docker interne)
    │
    ├── GET /equipes/2           → equipes/[id]/page.tsx (Client)
    │       └── useEffect → fetch http://localhost:8000/api/...
    │                           (navigateur → localhost)
    │
    └── POST /api/contact/       → contact/page.tsx (Client)
            └── fetch http://localhost:8000/api/contact/
```

**Pourquoi deux URLs différentes ?**

Les Server Components tournent dans le container Docker `frontend`. Ce container ne peut pas accéder à `localhost:8000` (qui serait lui-même). Il doit utiliser le nom du service Docker `backend:8000`.

Les Client Components tournent dans le navigateur de l'utilisateur. Le navigateur est sur la machine hôte et accède à Django via `localhost:8000` (le port mappé dans docker-compose).

---

## Résumé des pages

| Page | Type | API appelée | Interactivité |
|---|---|---|---|
| `/` | Server | articles + matches + teams | Non (carrousel = Client) |
| `/actualites` | Server | articles | Non |
| `/actualites/[slug]` | Server | article par slug | Non |
| `/equipes` | Server | teams | Non |
| `/equipes/[id]` | Client | team + stats + matches | Oui (onglets, mois, saison) |
| `/horaires` | Client | training-schedules | Non |
| `/contact` | Client | POST contact | Oui (formulaire) |
