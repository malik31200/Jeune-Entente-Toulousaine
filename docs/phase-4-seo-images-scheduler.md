# Phase 4 — SEO, Next Image & Scheduler FFF (29 avril 2026)

Ce document explique les fonctionnalités ajoutées : metadata SEO, migration vers Next.js Image, fix Docker pour les images, et automatisation du scraping FFF avec APScheduler.

---

## 1. SEO — Metadata par page

### Le problème
Sans `<title>` ni `<meta description>`, Google ne sait pas quoi afficher dans ses résultats. L'onglet du navigateur affichait juste "localhost".

### La solution : Next.js Metadata API

Dans le App Router de Next.js, chaque `page.tsx` **Server Component** peut exporter une constante `metadata` :

```tsx
export const metadata = {
  title: 'Actualités — La JET',
  description: 'Retrouvez toutes les actualités de la Jeune Entente Toulousaine.',
}
```

Next.js injecte automatiquement ces valeurs dans le `<head>` du HTML.

### Problème : `'use client'` + `metadata` = interdit

Les pages avec `'use client'` s'exécutent dans le navigateur, trop tard pour modifier le `<head>`. Next.js refuse l'export `metadata` dedans.

**Schéma :**
```
Server Component  → génère le HTML complet → peut modifier <head> ✅
Client Component  → s'exécute dans le navigateur → <head> déjà envoyé ❌
```

**Solution : créer un `layout.tsx` serveur à côté**

```
frontend/app/detections/
  ├── layout.tsx   ← Server Component avec metadata ✅
  └── page.tsx     ← 'use client' sans metadata
```

```tsx
// layout.tsx
export const metadata = {
  title: 'Détections — Jeune Entente Toulousaine',
  description: '...',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

Pages avec layout.tsx créé : `detections`, `contact`, `horaires`, `galerie`.

---

## 2. Next.js Image — Optimisation des photos

### Pourquoi remplacer `<img>` ?

| `<img>` classique | `<Image>` Next.js |
|-------------------|-------------------|
| Format original (JPG, PNG) | Converti en **WebP** automatiquement |
| Chargé immédiatement | **Lazy loading** (chargé quand visible) |
| Taille originale | **Redimensionné** selon l'écran |

### Deux patterns selon le contexte

**Image statique** (logo, taille connue) :
```tsx
<Image src="/logo.png" alt="Logo" width={40} height={40} />
```

**Image dynamique** (vient de l'API, taille inconnue) → `fill` avec conteneur `relative` :
```tsx
<div className="relative w-full h-48">
  <Image
    src={getMediaUrl(article.image)!}
    alt={article.title}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 33vw"
  />
</div>
```

**`priority`** sur le hero : image visible immédiatement → préchargée sans lazy loading.

**`sizes`** : indique à Next.js quelle version charger selon l'écran → économie de bande passante.

### Configuration `next.config.mjs`

Next.js refuse les images depuis des domaines non déclarés :

```js
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/media/**' },
      { protocol: 'http', hostname: 'backend', port: '8000', pathname: '/media/**' },
    ],
  },
}
```

---

## 3. Fix Docker — getMediaUrl context-aware

### Le problème

```
Navigateur               → http://localhost:8000 ✅ / http://backend:8000 ❌
Serveur Next.js (Docker) → http://backend:8000  ✅ / http://localhost:8000 ❌
```

Dans Docker Compose, chaque service a un nom réseau. `localhost` dans le container frontend pointe vers lui-même, pas vers le backend → il faut `backend:8000`.

### Pourquoi `<Image>` résout le problème des photos

Next.js proxie les images via `/_next/image` :
```
Navigateur → GET localhost:3000/_next/image?url=http://backend:8000/media/photo.jpg
Next.js    → télécharge depuis backend:8000 (réseau Docker interne)
           → sert l'image optimisée au navigateur ✅
```

Le navigateur ne touche jamais `backend:8000` directement.

### getMediaUrl intelligent

Pour les cas restants (CSS background-image, etc.), `getMediaUrl` détecte le contexte :

```typescript
export function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const isServer = typeof window === 'undefined'  // true = Node.js, false = navigateur
  const serverBase = 'http://backend:8000'
  const clientBase = 'http://localhost:8000'
  const base = isServer ? serverBase : clientBase

  if (url.startsWith('http://backend:8000'))   return isServer ? url : url.replace(serverBase, clientBase)
  if (url.startsWith('http://localhost:8000')) return isServer ? url.replace(clientBase, serverBase) : url
  if (url.startsWith('/media/'))               return `${base}${url}`
  return url
}
```

`typeof window === 'undefined'` : `window` n'existe pas en Node.js (serveur) → `undefined`.

---

## 4. Scheduler FFF — APScheduler

### Planning automatique

- **Lundi → Vendredi** : scraping à 23h00
- **Samedi & Dimanche** : 6 scrapings (13h30 / 15h30 / 17h30 / 18h30 / 21h00 / 23h00)

### Pourquoi APScheduler ?

| Solution | Complexité | Infrastructure |
|----------|-----------|----------------|
| **APScheduler** | Simple | Tourne dans Django |
| Celery + Beat | Complexe | Nécessite Redis |
| Cron système | Moyen | Hors Docker |

### Architecture

```
Django démarre
      │
      ▼
apps.py → ready()     ← appelé quand tout Django est prêt
      │
      ▼
scheduler.start()
      │
      ├── Vérifie que les tables APScheduler existent (protection migrate)
      ├── Enregistre les jobs CronTrigger
      └── BackgroundScheduler tourne en thread séparé
```

### Pourquoi `ready()` dans `apps.py` ?

`ready()` est appelé par Django **une seule fois**, après que tous les modèles sont chargés. C'est le seul endroit sûr pour démarrer des processus qui accèdent à la BDD.

```python
class ClubConfig(AppConfig):
    def ready(self):
        from . import scheduler   # import ICI pour éviter imports circulaires
        scheduler.start()
```

### Protection "chicken and egg" avec migrate

`ready()` est aussi appelé pendant `migrate`. Mais les tables APScheduler n'existent pas encore → crash.

```python
def start():
    from django.db import connection
    tables = connection.introspection.table_names()
    if 'django_apscheduler_djangojob' not in tables:
        return  # sort proprement, migrate créera les tables
    # ... démarrage normal
```

**Procédure d'installation :**
```bash
docker compose build backend          # installe django-apscheduler
docker compose up backend -d          # démarre (scheduler en attente)
docker compose exec backend python manage.py migrate  # crée les tables
docker compose restart backend        # redémarre → ✅ Scheduler FFF démarré.
```

---

## Ce qu'il reste à faire

| Tâche | Priorité |
|-------|----------|
| Responsive mobile | Moyenne |
| SMTP email production | Haute |
| Déploiement backend (Railway/Render) | Haute |
| Déploiement frontend (Vercel) | Haute |
| Domaine + HTTPS | Haute |
