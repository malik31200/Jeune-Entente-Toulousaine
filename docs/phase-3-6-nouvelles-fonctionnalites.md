# Phase 3.6 — Nouvelles fonctionnalités (24 avril 2026)

Ce document explique les fonctionnalités ajoutées lors de la session du 24 avril : éditeur rich text, galerie photos, dropdown navbar, pages Foot à 8/5, onglet STAFF, et page Détections.

---

## 1. Éditeur Rich Text — django-ckeditor

### Le problème
Quand l'admin écrivait un article, tout le texte était du texte brut. Impossible de mettre un mot en **gras**, en *italique*, ou de faire une liste. Le rendu côté site était un bloc de texte sans mise en forme.

### La solution : django-ckeditor

CKEditor est un éditeur WYSIWYG (What You See Is What You Get) : l'admin voit directement le rendu final pendant qu'il écrit.

```
Installation :
pip install django-ckeditor==6.7.1
```

**Schéma du flux :**
```
Admin tape dans CKEditor
       │
       ▼
Django sauvegarde du HTML formaté en base
(ex: "<p>Texte en <strong>gras</strong></p>")
       │
       ▼
API renvoie ce HTML via JSON
       │
       ▼
Next.js affiche le HTML avec dangerouslySetInnerHTML
```

**Pourquoi `dangerouslySetInnerHTML` ?**
React refuse d'injecter du HTML brut par sécurité (protection XSS). Cette prop lui dit "j'ai confiance en ce HTML, affiche-le tel quel". Ici c'est sûr car le HTML vient de notre propre admin, pas d'un utilisateur externe.

**Fichiers modifiés :**
- `backend/requirements.txt` → ajout de `django-ckeditor==6.7.1`
- `backend/jet/settings.py` → `INSTALLED_APPS` + `CKEDITOR_CONFIGS`
- `backend/club/models.py` → `Article.content` et `ClubPage.content` passent de `TextField` à `RichTextField`
- `frontend/app/actualites/[slug]/page.tsx` → rendu via `dangerouslySetInnerHTML`

---

## 2. Galerie Photos

### Architecture complète (Backend → Frontend)

```
┌─────────────────────────────────────────────────┐
│  Django Admin                                   │
│  L'admin upload une photo, définit un ordre     │
└──────────────────────┬──────────────────────────┘
                       │ sauvegarde en BDD + disque
                       ▼
┌─────────────────────────────────────────────────┐
│  Modèle GalleryPhoto (PostgreSQL)               │
│  - image (fichier sur /media/gallery/)          │
│  - order (entier pour trier)                    │
│  - created_at (date automatique)                │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  API DRF : GET /api/gallery/                    │
│  Renvoie la liste JSON des photos               │
│  [{id, image, order, created_at}, ...]          │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  Page Next.js /galerie                          │
│  - Grille responsive de miniatures              │
│  - Clic → lightbox plein écran                  │
│  - Flèches prev/next + touche Escape            │
└─────────────────────────────────────────────────┘
```

### Le Lightbox — comment ça marche ?

Un lightbox, c'est une fenêtre modale qui s'ouvre par-dessus la page pour afficher une photo en grand.

**Logique de l'état React :**
```typescript
const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
// null = lightbox fermé
// 0, 1, 2... = index de la photo affichée
```

**Navigation clavier :**
```typescript
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setSelectedIndex(i => (i + 1) % photos.length)
    if (e.key === 'ArrowLeft')  setSelectedIndex(i => (i - 1 + photos.length) % photos.length)
    if (e.key === 'Escape')     setSelectedIndex(null)
  }
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)  // nettoyage
}, [photos.length])
```

**Pourquoi `object-contain` ?**
- `object-cover` : la photo remplit tout le conteneur, mais est **rognée** (parties coupées)
- `object-contain` : la photo est entière, avec des bandes noires si nécessaire
→ Pour une galerie, on veut voir les photos en entier, donc `object-contain`.

**Fichiers créés/modifiés :**
- `backend/club/models.py` → modèle `GalleryPhoto`
- `backend/club/admin.py` → `GalleryPhotoAdmin`
- `backend/club/serializers.py` → `GalleryPhotoSerializer`
- `backend/club/views.py` → `GalleryPhotoViewSet`
- `backend/club/urls.py` → enregistrement du ViewSet
- `frontend/lib/api.ts` → `getGallery()`
- `frontend/app/galerie/page.tsx` → page complète (grille + lightbox)

---

## 3. Navbar — Dropdown Équipes

### Le besoin
La navbar avait un lien "Équipes" unique. Mais il y a 4 types d'équipes différentes (Foot à 11, Foot à 8, Foot à 5, Futsal), chacune avec sa propre page.

### Solution : menu déroulant au survol

**Schéma du comportement :**
```
Souris entre sur "Équipes"
        │
        ▼
openDropdown() → setEquipesOpen(true)
        │
        ▼
Le dropdown apparaît (position absolute sous le lien)

Souris quitte la zone
        │
        ▼
closeDropdown() → setTimeout(150ms) → setEquipesOpen(false)
```

**Pourquoi un délai de 150ms ?**
Sans délai, si la souris passe de "Équipes" vers le dropdown, il y a un micro-espace entre les deux éléments. Le dropdown se fermerait avant que la souris l'atteigne. Le délai laisse le temps à la souris de traverser cet espace.

```typescript
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

const openDropdown = () => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current)  // annule fermeture en cours
  setEquipesOpen(true)
}
const closeDropdown = () => {
  timeoutRef.current = setTimeout(() => setEquipesOpen(false), 150)
}
```

**Mobile :** accordion au clic (pas de hover sur mobile), le chevron tourne avec une classe CSS `rotate-180`.

---

## 4. Pages Foot à 8 / Foot à 5 — TeamPresentation

### Le problème
Les pages Foot à 8 et Foot à 5 contiennent plusieurs équipes (ex: U6, U7, U8 pour le Foot à 5). Ces équipes ne sont pas des `Team` dans le sens Foot à 11 — elles n'ont pas de matchs FFF, juste une photo et des coachs.

### Solution : modèle TeamPresentation

```python
class TeamPresentation(models.Model):
    category    # 'foot-a-8' ou 'foot-a-5'
    team        # FK vers Team (optionnel, si l'équipe existe déjà)
    name        # Nom libre si pas de Team liée
    image       # Photo de l'équipe
    coaches     # Texte, un nom par ligne
    order       # Ordre d'affichage
```

**Flux de données :**
```
Admin crée une TeamPresentation (catégorie: foot-a-5, nom: U6, photo, coachs)
       │
       ▼
API : GET /api/team-presentations/?category=foot-a-5
       │
       ▼
Page /equipes/foot-a-5 reçoit la liste
       │
       ▼
Tri automatique par numéro : parseInt("U6".replace(/\D/g, '')) → 6
→ U6, U7, U8, U9, U10...
       │
       ▼
Affichage en cards : photo à gauche (object-contain) + nom + staff à droite
```

**Pourquoi la FK Team est optionnelle ?**
L'équipe "U6 Foot à 5" n'est pas dans le modèle Team (pas de matchs FFF). Plutôt que de créer une équipe vide juste pour avoir un nom, on peut entrer le nom directement dans `TeamPresentation.name`. La FK est un raccourci pratique si l'équipe existe déjà.

**Page Futsal :** fait un `redirect()` serveur vers la page détail de l'équipe Futsal (elle existe comme vraie Team avec matchs). Pas besoin d'une page séparée.

---

## 5. Onglet STAFF — Pages équipes

### Le besoin
L'admin voulait afficher les coachs de chaque équipe sur la page publique.

### Solution minimale : champ TextField sur Team

```python
# Dans le modèle Team
coaches = models.TextField(blank=True, help_text="Un nom par ligne")
```

Un simple champ texte avec un nom par ligne. Simple, efficace, pas besoin d'un modèle "Coach" complet.

**Côté frontend :**
```typescript
// Conversion texte → tableau
const coachesList = team.coaches
  .split('\n')
  .filter(Boolean)  // supprime les lignes vides

// Affichage
coachesList.map(coach => (
  <div>
    <div style={{ backgroundColor: 'var(--color-accent)' }}>
      {coach[0]}  {/* Initiale dans un cercle orange */}
    </div>
    <span>{coach}</span>
  </div>
))
```

**4ème onglet ajouté** dans `/equipes/[id]` : DATA | RÉSULTATS | CLASSEMENT | **STAFF**

---

## 6. Page Détections

### Le concept
L'admin crée une "Détection" liée à une équipe existante (FK vers Team), avec un lien Google Form. Les visiteurs choisissent leur catégorie et remplissent le formulaire directement sur le site.

### Architecture

```
┌──────────────────────────────────────────┐
│  Admin Django                            │
│  Crée une Détection :                    │
│  - Équipe : U14 (FK → Team)              │
│  - Form URL : https://forms.google.com/..│
│  - Description : "Détection samedi..."   │
│  - Actif : ✓                             │
└───────────────────────┬──────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────┐
│  API : GET /api/detections/              │
│  (filtre is_active=True)                 │
│  Renvoie : [{id, team, team_name,        │
│              form_url, description}]     │
└───────────────────────┬──────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────┐
│  Page /detections                        │
│                                          │
│  [Seniors] [U17] [U15] [U14] ...         │
│  ← boutons triés du plus grand au U5    │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │  iframe Google Form                 │ │
│  │  (URL + ?embedded=true)             │ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### Pourquoi ForeignKey vers Team et pas un CharField ?

**Avec CharField :**
- L'admin tape "U17" → mais il a peut-être écrit "u17" ou "U 17" ailleurs
- Pas de lien avec les vrais matchs de l'équipe
- Risque de fautes de frappe

**Avec ForeignKey :**
- L'admin choisit dans un menu déroulant les équipes existantes
- Cohérence garantie par la base de données
- Si l'équipe change de nom → la détection suit automatiquement

### Tri des boutons

```typescript
const rank = (name: string) => {
  if (name.includes('senior')) return -1000  // Seniors toujours en premier
  const num = parseInt(name.replace(/\D/g, ''))  // U17 → 17
  return isNaN(num) ? 0 : -num  // négatif → ordre décroissant
}
// Résultat : Seniors → U19 → U18 → U17 → ... → U5
```

### Google Form en iframe

Google Forms propose un mode "embedded" qui supprime le header Google et rend le formulaire plus discret. Il suffit d'ajouter `?embedded=true` à l'URL :

```
https://docs.google.com/forms/d/xxx/viewform
→ https://docs.google.com/forms/d/xxx/viewform?embedded=true
```

Le code le fait automatiquement :
```typescript
const embedUrl = (url: string) => {
  const base = url.split('?')[0]  // supprime les params existants
  return `${base}?embedded=true`
}
```

---

## Récapitulatif des migrations

| Migration | Contenu |
|-----------|---------|
| 0005 | GalleryPhoto + Article.content → RichTextField |
| 0006 | CategoryPage (non utilisée publiquement) |
| 0007 | TeamPresentation (Foot à 8 / Foot à 5) |
| 0008 | Team.coaches (TextField) |
| 0009 | Detection (avec CharField category — remplacé) |
| 0010 | Detection : category → ForeignKey Team |

Pour appliquer toutes les migrations depuis zéro :
```bash
docker compose exec backend python manage.py migrate
```

## Ce qu'il reste à faire (Phase 4)

| Tâche | Priorité | Détail |
|-------|----------|--------|
| SMTP email | Haute | Configurer Gmail/SendGrid dans `.env` production |
| Déploiement backend | Haute | Railway ou Render |
| Déploiement frontend | Haute | Vercel |
| Variables prod | Haute | `NEXT_PUBLIC_API_URL`, `SECRET_KEY`, `CORS_ALLOWED_ORIGINS` |
| Domaine + HTTPS | Haute | DNS + certificat SSL (Let's Encrypt) |
| SEO | Moyenne | `<title>` et `<meta description>` par page |
| Next Image | Moyenne | Remplacer `<img>` par `<Image>` Next.js |
| Scheduler scraping | Moyenne | Cron APScheduler pour FFF automatique |
| Responsive mobile | Moyenne | Vérifier navbar hamburger, carrousel, onglets |
| Mentions légales | Basse | Page statique |
| Export licences | Basse | Export Excel des joueurs |
