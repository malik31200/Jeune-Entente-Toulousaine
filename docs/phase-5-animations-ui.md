# Phase 5 — Animations & UI Polish

**Date** : 21 mai 2026

---

## 🎨 Améliorations UI

### Footer — Refonte complète
- Fond très sombre `#0a0a0a` + ligne orange décorative en haut
- **4 colonnes** : Logo+socials | Navigation | Le Club | Contact
- Sur mobile : Navigation + Le Club côte à côte (`grid-cols-2`), Logo et Contact centrés
- Titres de sections en orange, liens gris avec hover blanc
- Adresse cliquable (Google Maps), téléphone cliquable (`tel:`)
- Icônes réseaux sociaux dans petits carrés arrondis
- Marge intérieure via `inline style paddingTop: '2rem'` (contournement conflit Tailwind `py-12 pt-20`)

### Header mobile
- "La JET" (police GraffitiYouth) et "Jeune Entente Toulousaine" désormais visibles sur mobile
- Suppression de `hidden sm:block` sur le bloc texte
- Sous-titre réduit à `0.55rem` pour éviter le débordement

### Sponsors — Champ description
- **Modèle** : `description = models.TextField(blank=True)` ajouté à `Sponsor`
- **Migration** `0014_sponsor_description.py`
- **Serializer** : champ `description` inclus dans `SponsorSerializer`
- Affiché entre le nom et "Visiter le site →" sur la page partenaires

### Page Partenaires
- Cards de hauteur égale : `h-full` + `flex-grow` sur la description + `mt-auto` sur le lien
- "Visiter le site →" : `text-sm font-bold` (était `text-xs`)
- Mobile : 1 card par ligne (était 2 colonnes)

---

## ✨ Animations Framer Motion & IntersectionObserver

### Composants créés
| Composant | Usage |
|-----------|-------|
| `NewsCards.tsx` | Cards actualités homepage — scroll + hover |
| `ArticleGrid.tsx` | Grille `/actualites` — scroll + hover |
| `ArticleDetail.tsx` | Détail article — image scale-in, date, titre en cascade |
| `AnimatedContent.tsx` | **Partagé** — IntersectionObserver par élément HTML (p, h2, ul, img…) |
| `ClubBannerText.tsx` | Bannière page Club — badge, titre, sous-titre en cascade |
| `ClubContent.tsx` | Contenu page Club — utilise `AnimatedContent` |
| `HomepageSponsors.tsx` | Section sponsors homepage — titre + logos staggered |
| `SponsorCards.tsx` | Page Partenaires — whileInView + whileHover |
| `TeamGrid.tsx` | Grille équipes Foot à 11 & Futsal — scroll + hover |
| `TeamPresentationList.tsx` | Cards Foot à 8 & Foot à 5 — scroll + hover |

### Pages animées
| Page | Type d'animation |
|------|-----------------|
| **Homepage** | Carrousel : section fade-in + titre slide (whileInView). Cards actus : stagger fade-up. Sponsors : logos scale-in staggered |
| **Actualités** | Chaque card : fade-up au scroll, image zoom + overlay orange au hover |
| **Détail article** | Image : scale-in. Date : slide gauche. Titre : fade-up. Contenu : par paragraphe via IntersectionObserver |
| **Club** | Bannière : badge → titre → sous-titre en cascade. Contenu : par paragraphe via IntersectionObserver |
| **Équipes** (Foot à 11) | Cards : stagger fade-up, card se soulève + image zoom + nom orange au hover |
| **Équipes** (Foot à 8 / 5) | Cards horizontales : fade-up staggered, soulèvement + zoom + nom orange au hover |
| **Futsal** | Utilise `TeamGrid` — mêmes animations que Foot à 11 |
| **Équipe détail** (`[id]`) | Résultats : chaque match card fade-up au scroll + soulèvement hover. Classement : chaque ligne se soulève au hover |
| **Entraînements** | Chaque card équipe : fade-up staggered + soulèvement hover |
| **Détections** | Boutons catégorie : stagger à l'entrée. Formulaire : AnimatePresence au changement de catégorie |
| **Galerie** | Chaque photo : scale-in au scroll (stagger par lot de 8), zoom au hover |
| **Partenaires** | Chaque card : fade-up staggered, soulèvement + ombre + nom orange au hover |

### Pattern `AnimatedContent` (clé)
> Résout le problème "seulement le premier paragraphe s'anime"  
> Un seul `whileInView` sur le wrapper ne suffit pas pour du contenu long.  
> Solution : après le rendu, `querySelectorAll('p, h2, ul, blockquote, figure, img...')` puis `IntersectionObserver` individuel sur chaque élément → chaque bloc s'anime en entrant dans le viewport, jusqu'à la fin du texte.

### Règle importante — Next.js Server → Client
> **On ne peut pas passer une fonction comme prop d'un Server Component vers un Client Component.**  
> `getMediaUrl` doit être importé **directement** dans le composant client (pas passé en prop).  
> Erreur rencontrée : `Application error: server-side exception` sur la homepage après création de `NewsCards`.

---

## 🔧 Corrections techniques

- **Futsal page** : utilisait une grille statique sans `motion` → remplacé par `TeamGrid`
- **Fermeture de balises** : `<section>` → `<motion.section>` requiert la mise à jour du tag fermant
- **Conflit Tailwind pt-20/py-12** : pt-20 n'override pas py-12 → inline style utilisé à la place
- **`group-hover` + `motion.div`** : fonctionne si `className="... group"` est bien sur le `motion.div`
