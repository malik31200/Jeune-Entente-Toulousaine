# Phase 3 — Design & Polish

> **Session du 22 avril 2026**  
> Ce document explique de façon pédagogique tout ce qui a été réalisé lors de cette session, pourquoi on l'a fait, et quels fichiers ont été modifiés.

---

## 🎯 Objectif de cette session

Transformer un site fonctionnel en un site **visuellement professionnel**, avec :
- Une identité visuelle réelle (logo, police street)
- Des animations fluides (Framer Motion)
- Un carrousel de matchs digne d'un site de club pro
- Des pages équipes avec des stats correctes et un design style TFC

---

## 1. Animations — Framer Motion

### Pourquoi ?
Un site statique paraît cheap. Les animations d'entrée donnent du rythme et de la classe.

### Qu'est-ce que Framer Motion ?
C'est une librairie React qui permet d'animer des éléments HTML. On remplace un `<div>` par un `<motion.div>` et on lui donne des propriétés `initial` (état de départ) et `animate` (état d'arrivée).

```tsx
// Exemple : fade in depuis le bas
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
  Mon contenu
</motion.div>
```

### Fichier créé : `frontend/components/FadeIn.tsx`
Un composant réutilisable qui encapsule cette animation. On lui passe un `delay` pour créer un effet cascade (le titre apparaît, puis 0.2s plus tard la grille, etc.).

```tsx
<FadeIn>          {/* apparaît à 0s */}
  <h2>Titre</h2>
</FadeIn>
<FadeIn delay={0.4}>  {/* apparaît 0.4s après */}
  <div className="grid...">...</div>
</FadeIn>
```

### Fichier modifié : `frontend/app/page.tsx`
- Hero text encapsulé dans `<FadeIn>`
- Titre "Dernières actualités" dans `<FadeIn delay={0.2}>`
- Grille d'articles dans `<FadeIn delay={0.4}>`

---

## 2. Identité visuelle — Logo & Police

### Logo réel
On a remplacé le cercle orange ⚽ par le vrai logo du club (`logo.png`).

**Important** : pour le rendre rond, on utilise `rounded-full` + `object-cover` sur la balise `<img>`. La propriété CSS `border-radius: 50%` coupe l'image en cercle.

**Fichiers modifiés :**
- `frontend/components/Header.tsx` — logo rond + animé
- `frontend/components/Footer.tsx` — logo rond

### Police "Graffiti Youth" — style street/graffiti
Le client voulait un style "attaché, street, comme Nike" pour "La JET".

**Pourquoi une police custom et pas Google Fonts ?**  
Parce que "Graffiti Youth" n'est pas disponible sur Google Fonts — c'est une police téléchargée. Il faut donc l'héberger soi-même.

**Comment ça fonctionne ?**

1. **Copier le fichier** dans `frontend/public/fonts/GraffitiYouth-Regular.otf`  
   Le dossier `public/` dans Next.js est servi statiquement à l'URL `/fonts/...`

2. **Déclarer la police** dans `frontend/app/globals.css` avec `@font-face` :
```css
@font-face {
  font-family: 'GraffitiYouth';
  src: url('/fonts/GraffitiYouth-Regular.otf') format('opentype');
  font-display: swap; /* charge la police en arrière-plan, affiche le fallback d'abord */
}
```

3. **Utiliser la police** dans les composants :
```tsx
style={{ fontFamily: 'GraffitiYouth', fontSize: '1.5rem' }}
```

### Animation du Header
Le header est un `'use client'` (composant React classique), donc on peut utiliser Framer Motion directement dedans.

**Séquence d'animation :**
1. Logo : tourne de -180° → 0° + scale 0 → 1 (effet spring, rebond naturel)
2. "La JET" : glisse depuis la gauche + fade in (delay 0.35s)
3. "Jeune Entente Toulousaine" : idem (delay 0.55s)

```tsx
<motion.img
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
/>
```

`type: 'spring'` = animation physique avec rebond. `stiffness` = rigidité du ressort, `damping` = amortissement.

---

## 3. Carrousel de matchs — redesign complet

### Fichier modifié : `frontend/components/MatchCarousel.tsx`

C'est le composant le plus remanié. Voici les concepts introduits.

### Flèches visibles au survol (style PSG)
**Technique :** on utilise un state React `hovered` + `onMouseEnter`/`onMouseLeave` sur la section.

```tsx
const [hovered, setHovered] = useState(false)

<section onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
  <button style={{ opacity: hovered && !disabled ? 1 : 0, transition: 'opacity 0.2s' }}>
```

L'opacité passe de 0 à 1 uniquement quand la souris est sur la section ET que la flèche est active (pas désactivée).

### Cards avec hover animé
Chaque card utilise `motion.div` avec `whileHover` :
```tsx
<motion.div
  whileHover={{
    scale: 1.04,
    y: -8,
    boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.3)',
  }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
```
`scale: 1.04` = agrandit légèrement. `y: -8` = remonte de 8px. `boxShadow` = ombre + bordure orange lumineuse.

### Bande colorée résultat
En haut de chaque card, une bande de 4px de hauteur change de couleur selon le résultat :
- 🟢 Vert : victoire de la JET
- 🔴 Rouge : défaite
- 🟡 Jaune : nul
- 🟠 Orange : match à venir

**Comment on sait si JET a gagné ?** On utilise `is_home` (booléen du modèle Django) pour savoir si la JET joue à domicile ou à l'extérieur, puis on compare les scores.

### Animation de transition des cards
```tsx
<AnimatePresence mode="popLayout" initial={false}>
  {matches.slice(startIndex, startIndex + 4).map((match) => (
    <motion.div
      key={match.id}
      initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
    >
```
`AnimatePresence` gère les éléments qui entrent/sortent du DOM. `direction` (-1 ou 1) détermine si les cards entrent/sortent par la gauche ou la droite.

### Dots de navigation
Des petits ronds en bas permettent de sauter directement à un index. Le dot actif s'agrandit (`width: 24px` vs `6px`), créant un indicateur visuel élégant.

---

## 4. Page Équipes — photo dans les cards

### Fichier modifié : `frontend/app/equipes/page.tsx`

Avant : toutes les cards avaient le même cercle orange ⚽.  
Après : si l'admin a uploadé une photo d'équipe dans Django Admin, elle s'affiche.

**Concept clé : `getMediaUrl()`**  
Les URLs d'images viennent du backend Django (`http://backend:8000/media/...`). Mais le navigateur ne peut pas atteindre `backend:8000` (c'est un nom de container Docker interne). Il faut remplacer par `http://localhost:8000`.

```ts
export function getMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://backend:8000'))
    return url.replace('http://backend:8000', 'http://localhost:8000')
  if (url.startsWith('/media/'))
    return `http://localhost:8000${url}`
  return url
}
```

**Structure de la card avec image :**
```tsx
{imageUrl ? (
  <>
    <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
  </>
) : (
  <div>⚽ fallback</div>
)}
```
Le `dégradé` (`linear-gradient`) assure que le nom de l'équipe en bas est toujours lisible même sur une photo claire.

---

## 5. Page Détail Équipe — DATA & CLASSEMENT style TFC

### Fichier modifié : `frontend/app/equipes/[id]/page.tsx`

C'est le fichier le plus complexe. Architecture en sous-composants :

```
TeamDetailPage (composant principal)
├── DataTab (onglet DATA)
├── ClassementTab (onglet CLASSEMENT)
└── onglet RÉSULTATS (inline)
```

### Onglet DATA — style TFC

**Graphique en barres animé :**
```tsx
<motion.div
  className="w-24 rounded-t-lg"
  style={{ backgroundColor: 'var(--color-accent)' }}
  initial={{ height: 0 }}
  animate={{ height: forHeight }}  // hauteur calculée proportionnellement
  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
/>
```
La hauteur de chaque barre est proportionnelle aux buts : `height = (goals / max) * 160px`.

### Calcul des stats depuis les matchs

**Problème rencontré :** Le modèle `TeamStats` en base était parfois incorrect (données périmées du scraping). Solution : toujours recalculer depuis les matchs réels.

**Fonction `computeStatsFromMatches()` :**

```ts
function computeStatsFromMatches(matches: any[]): any | null {
  // 1. Filtrer sur la saison la plus récente (pas les saisons précédentes)
  const latestSeason = allSeasons[allSeasons.length - 1]
  
  // 2. Filtrer sur la compétition principale
  //    (championnat = plus de matchs, exclut les coupes qui ont 2-3 matchs)
  const mainComp = Object.entries(compCount).sort(([,a],[,b]) => b-a)[0][0]
  
  // 3. Calculer V/N/D depuis les scores
  const scored = m.is_home ? m.home_score : m.away_score
  const conceded = m.is_home ? m.away_score : m.home_score
}
```

**Pourquoi filtrer par compétition ?**  
Le scraper récupère TOUS les matchs JET : championnat + coupe + etc. Si on calcule les stats sur tous les matchs, on obtient par exemple 30 matchs au lieu de 22 dans le championnat → chiffres faux par rapport au classement FFF.

**Source de vérité finale :**
```ts
const computed = computeStatsFromMatches(matchArr)
const dbStats = statsArr[0] || null
setStats(computed
  ? { ...computed, ranking: dbStats?.ranking ?? null }  // stats calculées + rang de la DB
  : dbStats  // fallback DB si aucun match
)
```

---

## 📁 Récapitulatif des fichiers modifiés

| Fichier | Ce qui a changé |
|---------|----------------|
| `frontend/components/FadeIn.tsx` | **NOUVEAU** — composant d'animation réutilisable |
| `frontend/public/fonts/GraffitiYouth-Regular.otf` | **NOUVEAU** — police custom |
| `frontend/app/globals.css` | Ajout `@font-face` pour Graffiti Youth |
| `frontend/app/layout.tsx` | Ajout Bebas Neue via `next/font/google` (variable CSS) |
| `frontend/components/Header.tsx` | Logo rond + police Graffiti Youth + animations Framer Motion |
| `frontend/components/Footer.tsx` | Logo rond + police Graffiti Youth |
| `frontend/app/page.tsx` | Animations FadeIn sur hero + actualités |
| `frontend/components/MatchCarousel.tsx` | **Refonte complète** — flèches hover, cards animées, bande couleur résultat, dots, AnimatePresence |
| `frontend/app/equipes/page.tsx` | Cards avec photo d'équipe + fallback |
| `frontend/app/equipes/[id]/page.tsx` | **Refonte complète** — DATA style TFC, CLASSEMENT style TFC, calcul stats depuis matchs |

---

## 🧠 Concepts clés appris

| Concept | Où l'a-t-on utilisé |
|---------|---------------------|
| `motion.div` / `whileHover` | Cards du carrousel, badges de forme |
| `AnimatePresence` | Transition entre cards du carrousel |
| `type: 'spring'` | Animation logo dans le Header |
| `@font-face` CSS | Police Graffiti Youth custom |
| `rounded-full` + `object-cover` | Logo rond |
| `group` + `onMouseEnter` | Flèches carrousel visibles au survol |
| `getMediaUrl()` | Conversion URL Docker → URL publique |
| `linear-gradient` overlay | Lisibilité du texte sur photo |
| Calcul stats front-end | `computeStatsFromMatches()` — fallback robuste |
| Filtre par compétition principale | Exclure les coupes des stats de championnat |

---

## 🚀 Prochaine étape : Déploiement

- Configurer les variables d'environnement production
- Remplacer `http://localhost:8000` par le vrai domaine du backend
- Déployer backend sur Railway/Render
- Déployer frontend sur Vercel
- Configurer le domaine
