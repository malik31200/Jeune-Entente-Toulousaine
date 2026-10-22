# ⚽ Jeune Entente Toulousaine (JET)

Site web officiel du club de football **Jeune Entente Toulousaine** : vitrine du club, résultats et classements récupérés automatiquement depuis la FFF, actualités, équipes, horaires d'entraînement et formulaire de contact.

Projet fullstack **Django + Next.js**, conteneurisé avec Docker.

---

## ✨ Fonctionnalités

### Site public
- **Accueil** : hero, carrousel des derniers résultats et prochains matchs (toutes catégories), dernières actualités, sponsors
- **Actualités** : liste et détail des articles (texte riche, image, vidéo)
- **Équipes** : Foot à 11, Foot à 8, Foot à 5, Futsal
  - Page détail avec 4 onglets : **DATA** (stats, forme), **RÉSULTATS / CALENDRIER**, **CLASSEMENT** (réel, FFF), **STAFF**
- **Horaires d'entraînement** par équipe
- **Détections** : formulaires d'inscription par catégorie (Google Forms intégrés)
- **Galerie photos** avec lightbox
- **Partenaires** : sponsors avec logos et liens
- **Club** : page de présentation
- **Contact** : formulaire envoyé directement par email (aucune donnée stockée)
- SEO : metadata sur chaque page, `sitemap.xml`, `robots.txt`
- Animations Framer Motion, design mobile-first noir/orange

### Administration (Django Admin, `/admin`)
- Articles (éditeur CKEditor), équipes, sponsors, galerie, détections, horaires
- **Joueurs & licences** (statut de paiement, montant, mode de paiement) — **jamais affichés publiquement**
- Paramètres du site (réseaux sociaux, boutique, email de contact)
- Compteur de visiteurs

### Automatisation
- **Scraping FFF** des résultats de toutes les équipes du club
- **Scheduler APScheduler** : 1 passage par jour en semaine, 6 passages le week-end (2h30 après chaque créneau de match)

---

## 🏗️ Stack technique

| Couche | Technologies |
|---|---|
| Backend | Django 5.1, Django REST Framework, django-ckeditor, django-apscheduler |
| Base de données | PostgreSQL 16 |
| Scraping | Requests, BeautifulSoup4 |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Médias | Cloudinary |
| Email | django-anymail (Brevo) / SMTP |
| Infra | Docker, Docker Compose, Gunicorn, WhiteNoise |
| Déploiement | Railway (backend + PostgreSQL), Vercel (frontend) |

```
Navigateur ──► Next.js (frontend :3000) ──API REST──► Django (backend :8000) ──► PostgreSQL
                                                          ▲
                                          Django Admin ───┘   Scraping FFF (APScheduler)
```

---

## 📁 Structure

```
.
├── backend/                 # Django
│   ├── jet/                 # Projet (settings, urls)
│   ├── club/                # App principale
│   │   ├── models.py        # Article, Team, Player, Match, TeamStats, Sponsor...
│   │   ├── views.py         # API REST + contact + classement
│   │   ├── scheduler.py     # Planification du scraping
│   │   └── management/commands/
│   │       ├── scrape_fff.py
│   │       ├── refresh_classements.py
│   │       └── import_fff_manual.py
│   ├── requirements.txt
│   └── start.sh             # Démarrage production (migrate, collectstatic, gunicorn)
├── frontend/                # Next.js
│   ├── app/                 # Pages (App Router)
│   ├── components/          # Composants React
│   ├── lib/                 # Appels API, utilitaires
│   └── public/              # Logo, polices
├── docs/                    # Documentation par phase de développement
└── docker-compose.yml
```

---

## 🚀 Installation en local

### Prérequis
- [Docker](https://docs.docker.com/get-docker/) et Docker Compose
- Git

### 1. Cloner le projet
```bash
git clone https://github.com/malik31200/Jeune-Entente-Toulousaine.git
cd Jeune-Entente-Toulousaine
```

### 2. Variables d'environnement
Créer un fichier `.env` à la racine (utilisé pour Cloudinary) :
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
Les autres variables de développement (base de données, `DEBUG`, `SECRET_KEY`) sont déjà définies dans `docker-compose.yml`.

### 3. Lancer les conteneurs
```bash
docker compose up --build
```

### 4. Initialiser la base
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 5. Récupérer les matchs FFF
```bash
docker compose exec backend python manage.py scrape_fff
```

### Accès
| Service | URL |
|---|---|
| Site | http://localhost:3000 |
| API | http://localhost:8000/api/ |
| Admin | http://localhost:8000/admin/ |

---

## 🔌 API

Base : `/api/`

| Endpoint | Description |
|---|---|
| `articles/` | Actualités publiées |
| `teams/` | Équipes |
| `matches/` | Matchs (résultats et calendrier) |
| `team-stats/` | Statistiques d'équipe |
| `training-schedules/` | Horaires d'entraînement |
| `sponsors/` | Partenaires |
| `gallery/` | Photos de la galerie |
| `team-presentations/?category=foot-a-8` | Présentations Foot à 8 / Foot à 5 |
| `detections/` | Formulaires de détection actifs |
| `site-settings/` | Liens réseaux sociaux, boutique |
| `classement/?cp_no=&phase=&poule=` | Classement calculé depuis la FFF |
| `club-page/` | Contenu de la page Club |
| `contact/` (POST) | Envoi du formulaire de contact par email |

> Les joueurs (`Player`) ne sont **pas** exposés dans l'API.

---

## 🛠️ Commandes utiles

```bash
# Scraper les résultats FFF
docker compose exec backend python manage.py scrape_fff

# Rafraîchir les classements
docker compose exec backend python manage.py refresh_classements

# Créer une migration après modification des modèles
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Logs
docker compose logs -f backend
```

Pour afficher le classement d'une équipe, renseigner `cp_no`, `phase_no` et `poule_no` dans l'admin (fiche Équipe).

---

## ☁️ Déploiement

**Backend (Railway)** — variables à définir :
`SECRET_KEY`, `DEBUG=0`, `DATABASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
`BREVO_API_KEY`, `DEFAULT_FROM_EMAIL`,
`DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_PASSWORD`, `DJANGO_SUPERUSER_EMAIL` (optionnel, création auto de l'admin).

Le script `backend/start.sh` lance les migrations, `collectstatic` puis Gunicorn.

**Frontend (Vercel)** — variable à définir :
`NEXT_PUBLIC_API_URL` (ex. `https://<backend>/api`).

---

## 📚 Documentation

Le dossier [`docs/`](docs/) détaille chaque phase du développement (setup Docker, backend, frontend, design, SEO, animations).

---

## 👤 Auteur

**Malik** — [@malik31200](https://github.com/malik31200)
