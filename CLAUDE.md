
---

## 🎯 1. Vision et Objectifs

### Vision globale

Créer un **site web moderne pour un club de football** qui combine :

- 🏆 Vitrine professionnelle (type TFC)
- 📊 Affichage automatique des résultats
- 📰 Gestion d'actualités
- 🤝 Outil de génération de leads

### Objectifs principaux

1. **Pour le club** : Communiquer efficacement avec les supporters
2. **Pour les visiteurs** : Accès rapide aux infos (résultats, actus, contact)
3. **Pour vous** : Projet portfolio démontrant vos compétences fullstack

### 🎯 Points clés de conception

**Simplicité et efficacité :**

- ✅ **Pas de stockage des contacts** : Formulaire → Email direct (RGPD simplifié)
- ✅ **Joueurs en gestion interne uniquement** : Admin peut gérer l'effectif et les licences, mais rien n'est affiché publiquement
- ✅ **Horaires d'entraînement** : Table dédiée pour une gestion flexible
- ✅ **Scraping FFF intelligent** : 1x/jour en semaine, 6x/jour le week-end (2h30 après chaque match)
- ✅ **Carrousel matchs homepage** : Derniers résultats + prochains matchs (toutes catégories)
- ✅ **Page détail équipe** : 3 onglets (DATA/RÉSULTATS/CLASSEMENT)

**Design et UX :**

- ✅ **Style TFC** : Moderne, épuré, professionnel
- ✅ **Mobile-first** : Responsive sur tous écrans
- ✅ **Interactions fluides** : Flèches de navigation au survol, transitions Framer Motion

---

## 🏗️ 2. Stack Technique

### Backend

- **Framework** : Django 5.x
- **Admin** : Django Admin (interface de gestion intégrée)
- **API** : Django REST Framework (DRF)
- **Base de données** : PostgreSQL
- **Scraping** : BeautifulSoup4 / Requests
- **Email** : Django Email (SMTP)

### Frontend

- **Framework** : Next.js 14+ (App Router)
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **Fetch** : Axios / Fetch API
- **Images** : Next Image (optimisation automatique)

### Infrastructure

- **Containerisation** : Docker + Docker Compose
- **Services** :
    - Container Django (backend)
    - Container PostgreSQL (BDD)
    - Container Next.js (frontend)
    - Container Nginx (reverse proxy - optionnel)

### Déploiement (futur)

- **Backend** : Railway / Render / VPS
- **Frontend** : Vercel / Netlify
- **Coût estimé** : 5-15€/mois

---

## 🏛️ 3. Architecture Globale

```
┌─────────────────┐
│   Utilisateur   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Next.js (Frontend)    │
│  - Pages publiques      │
│  - Design moderne       │
│  - Responsive           │
└──────────┬──────────────┘
           │
           │ API REST (JSON)
           │
           ▼
┌─────────────────────────┐
│   Django (Backend)      │
│  - API REST Framework   │
│  - Logique métier       │
│  - Scraping FFF         │
│  - Email contact        │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│   PostgreSQL (BDD)      │
│  - Articles             │
│  - Équipes              │
│  - Matchs               │
│  - TeamStats            │
│  - Sponsors             │
│  - TrainingSchedule     │
│  - Players (admin only) │
└─────────────────────────┘

┌─────────────────────────┐
│  Django Admin           │
│  (Interface de gestion) │
│  - Staff du club        │
└─────────────────────────┘
```

---

## 📊 4. Modèles de Données (Django)

### 📰 Article

```python
- title (CharField)
- slug (SlugField)
- content (TextField)
- image (ImageField)
- video_url (URLField, optionnel)
- author (ForeignKey User)
- published_date (DateTimeField)
- is_published (BooleanField)
- created_at (DateTimeField)
- updated_at (DateTimeField)
```

### 👥 Team (Équipe)

```python
- name (CharField) # Ex: "Seniors A", "U17", "U14"
- category (CharField) # Ex: "Seniors", "Jeunes"
- description (TextField)
- image (ImageField)
- order (IntegerField) # Pour l'ordre d'affichage
```

### ⚽ Player (Joueur) - VISIBLE ADMIN UNIQUEMENT

```python
# Infos basiques
- first_name (CharField)
- last_name (CharField)
- photo (ImageField, optionnel)
- position (CharField) # Gardien, Défenseur, Milieu, Attaquant
- jersey_number (IntegerField)
- team (ForeignKey Team)

# Contact interne
- email (EmailField, optionnel)
- phone (CharField, optionnel)

# Gestion licence
- license_paid (BooleanField) # Payée ou non
- payment_method (CharField) # Espèces, Chèque, Virement, CB, Autre
- payment_date (DateField, null=True)
- license_amount (DecimalField) # Montant de la licence
- notes (TextField, optionnel) # Remarques internes

- created_at (DateTimeField)
- updated_at (DateTimeField)
```

**⚠️ Important** : Les joueurs ne sont JAMAIS affichés sur le site public. Uniquement pour gestion interne de l'admin.

### 🏋️ TrainingSchedule (Horaires d'entraînement)

```python
- team (ForeignKey Team)
- day_of_week (CharField) # Lundi, Mardi, Mercredi...
- start_time (TimeField) # 18:00
- end_time (TimeField) # 19:30
- location (CharField) # Stade Municipal, Complexe Sportif...
- is_active (BooleanField) # Pour désactiver temporairement
- created_at (DateTimeField)
```

### 🏟️ Match

```python
- date (DateTimeField)
- home_team (CharField)
- away_team (CharField)
- home_score (IntegerField, null=True)
- away_score (IntegerField, null=True)
- competition (CharField)
- location (CharField)
- is_home (BooleanField) # Match à domicile ?
- team (ForeignKey Team) # Notre équipe concernée
- status (CharField) # TERMINE, A_VENIR, EN_COURS
- scraped_at (DateTimeField) # Date de récupération
```

### 📊 TeamStats (Statistiques d'équipe)

```python
- team (ForeignKey Team)
- season (CharField) # Ex: "2025/2026"
- competition (CharField) # Ex: "National U17"

# Statistiques
- matches_played (IntegerField)
- wins (IntegerField)
- draws (IntegerField)
- losses (IntegerField)
- goals_for (IntegerField) # Buts marqués
- goals_against (IntegerField) # Buts encaissés
- points (IntegerField)
- ranking (IntegerField) # Position au classement

# Forme (5 derniers matchs)
- form (CharField) # Ex: "VVNDV" (V=Victoire, N=Nul, D=Défaite)

- updated_at (DateTimeField)
```

### 🏆 Sponsor

```python
- name (CharField)
- logo (ImageField)
- website_url (URLField, optionnel)
- order (IntegerField) # Ordre d'affichage
- is_active (BooleanField)
- created_at (DateTimeField)
```

### ⚙️ SiteSettings (Configuration)

```python
- shop_url (URLField) # Lien boutique
- facebook_url (URLField)
- instagram_url (URLField)
- twitter_url (URLField)
- youtube_url (URLField)
- contact_email (EmailField) # Email de réception des formulaires
```

**Note** : Pas de table Contact - Le formulaire envoie directement un email sans stockage en BDD.

---

## 👤 5. User Stories (18 au total)

### 🌐 Visiteur du site

**US-01** : En tant que **visiteur**, je veux **voir la page d'accueil** afin de **découvrir le club rapidement**

- Hero section avec image marquante
- **Carrousel de matchs interactif**
    - Derniers résultats (toutes catégories U14→Seniors)
    - Prochains matchs à venir
    - Navigation avec flèches gauche/droite (visibles au survol uniquement)
    - Style cartes modernes avec logos, scores, dates
- Dernières actualités (3-4)
- Sponsors

**US-02** : En tant que **visiteur**, je veux **consulter les résultats des matchs** afin de **suivre les performances**

- Liste des matchs par équipe
- Filtrer par équipe (U14, U17, Seniors...)
- Voir les scores
- Date et compétition
- Dernier match joué
- Prochain match à venir
- Calendrier complet

**US-03** : En tant que **visiteur**, je veux **lire les actualités** afin de **rester informé**

- Liste des articles
- Détail d'un article (texte + image + vidéo)
- Navigation entre articles

**US-04** : En tant que **visiteur**, je veux **voir les équipes du club** afin de **connaître la structure**

- Liste des équipes (Seniors A, U17, U14, etc.)
- Description de chaque équipe
- Photo d'équipe

**US-04b** : En tant que **visiteur**, je veux **cliquer sur une équipe** afin de **voir ses détails complets**

- **Onglet DATA** : Statistiques de la saison
    - Buts marqués / Buts encaissés
    - Victoires / Nuls / Défaites
    - Forme du moment (5 derniers matchs : V, N, D)
    - Graphiques visuels
- **Onglet RÉSULTATS/CALENDRIER** :
    - Navigation par mois
    - Matchs passés avec scores + badge "TERMINÉ"
    - Matchs à venir avec date/heure + badge "À VENIR"
    - Filtrable par saison
- **Onglet CLASSEMENT** :
    - Position au classement
    - Points, matchs joués
    - Victoires, nuls, défaites
    - Différence de buts

**US-05** : En tant que **visiteur**, je veux **consulter les horaires d'entraînement** afin de **savoir quand venir**

- Horaires par équipe
- Jours et heures
- Lieux d'entraînement

**US-06** : En tant que **visiteur**, je veux **contacter le club** afin de **poser une question ou m'inscrire**

- Formulaire simple (nom, email, message)
- Envoi direct par email (pas de stockage en BDD)
- Confirmation visuelle après envoi

**US-07** : En tant que **visiteur**, je veux **accéder à la boutique** afin de **acheter des produits**

- Lien visible vers site externe

**US-08** : En tant que **visiteur**, je veux **suivre le club sur les réseaux** afin de **rester connecté**

- Liens vers Facebook, Instagram, Twitter, YouTube
- Icônes visibles (header ou footer)

**US-09** : En tant que **visiteur**, je veux **voir les sponsors** afin de **découvrir les partenaires**

- Section sponsors en footer ou homepage
- Logos cliquables vers sites partenaires

---

### 👨‍💼 Administrateur du club

**US-10** : En tant qu'**admin**, je veux **me connecter à l'interface d'administration** afin de **gérer le contenu**

- Accès via /admin
- Authentification sécurisée

**US-11** : En tant qu'**admin**, je veux **créer/modifier/supprimer des articles** afin de **publier des actualités**

- Éditeur de texte
- Upload d'images
- Lien vidéo YouTube
- Brouillon ou publié

**US-12** : En tant qu'**admin**, je veux **gérer les équipes** afin de **présenter la structure du club**

- Ajouter/modifier/supprimer équipes
- Description et photo d'équipe
- Ordre d'affichage

**US-13** : En tant qu'**admin**, je veux **gérer les joueurs** afin de **suivre l'effectif et les licences**

- Ajouter/modifier/supprimer joueurs
- Informations : nom, prénom, position, numéro, équipe
- Upload photo
- Coordonnées (email, téléphone)
- **Gestion licences** : statut payé/non payé, mode de paiement, montant, date
- Filtrer par équipe
- Filtrer par statut licence (payé/non payé)
- Notes internes
- **⚠️ Les joueurs sont UNIQUEMENT visibles par l'admin (jamais sur le site public)**

**US-14** : En tant qu'**admin**, je veux **gérer les horaires d'entraînement** afin de **informer les membres**

- Ajouter/modifier/supprimer créneaux
- Choisir équipe, jour, horaire, lieu
- Activer/désactiver temporairement

**US-15** : En tant qu'**admin**, je veux **gérer les sponsors** afin de **mettre à jour les partenaires**

- Ajouter/modifier/supprimer sponsors
- Upload logos
- Activer/désactiver
- Réordonner

**US-16** : En tant qu'**admin**, je veux **configurer les paramètres du site** afin de **gérer les liens et infos**

- URL boutique
- URLs réseaux sociaux
- Email de réception (pour formulaire contact)

---

### 🤖 Système (automatisé)

**US-17** : En tant que **système**, je veux **récupérer les résultats FFF automatiquement** afin de **afficher les scores sans intervention manuelle**

- **Script de scraping intelligent** :
    - **En semaine (Lun-Ven)** : 1 scraping à 6h00
    - **Week-end (Sam-Dim)** : 6 scrapings (2h30 après chaque créneau de match)
        - 13h30 (matchs de 11h)
        - 15h30 (matchs de 13h)
        - 17h30 (matchs de 15h)
        - 18h30 (matchs de 16h)
        - 20h30 (matchs de 18h)
        - 22h30 (matchs de 20h)
- Stockage en base (Match + TeamStats)
- Logs des erreurs et monitoring
- Calcul automatique des statistiques d'équipe

---

## 🎯 6. Priorisation MoSCoW

### 🔴 MUST HAVE (Indispensables - MVP)

**Phase 1 - Lancement minimal viable**

|ID|User Story|Priorité|
|---|---|---|
|US-01|Page d'accueil basique|⭐⭐⭐|
|US-02|Affichage résultats matchs|⭐⭐⭐|
|US-03|Lecture des articles|⭐⭐⭐|
|US-06|Formulaire de contact (email direct)|⭐⭐⭐|
|US-10|Connexion admin|⭐⭐⭐|
|US-11|Gestion articles (admin)|⭐⭐⭐|
|US-17|Scraping résultats FFF|⭐⭐⭐|

**🎯 Objectif** : Site fonctionnel pour communiquer (actus + résultats + contact)

---

### 🟠 SHOULD HAVE (Importants - V1)

**Phase 2 - Fonctionnalités essentielles**

|ID|User Story|Priorité|
|---|---|---|
|US-04|Présentation des équipes|⭐⭐|
|US-04b|Page détail équipe (DATA/RÉSULTATS/CLASSEMENT)|⭐⭐|
|US-05|Horaires d'entraînement|⭐⭐|
|US-09|Affichage sponsors|⭐⭐|
|US-12|Gestion équipes (admin)|⭐⭐|
|US-13|Gestion joueurs + licences (admin uniquement)|⭐⭐|
|US-14|Gestion horaires entraînement (admin)|⭐⭐|
|US-15|Gestion sponsors (admin)|⭐⭐|

**🎯 Objectif** : Site complet avec toutes les informations club + gestion interne

---

### 🟡 COULD HAVE (Souhaitables - V2)

**Phase 3 - Améliorations**

|ID|User Story|Priorité|
|---|---|---|
|US-07|Lien boutique externe|⭐|
|US-08|Liens réseaux sociaux|⭐|
|US-16|Configuration paramètres site|⭐|

**Fonctionnalités supplémentaires possibles :**

- Newsletter
- Galerie photos
- Statistiques d'équipe
- Classement championnat (si disponible sur FFF)
- Export Excel des licences
- Relance automatique licences impayées
- Espace membres/parents

**🎯 Objectif** : Site enrichi et attractif + outils de gestion avancés

---

### ⚪ WON'T HAVE (Hors scope V1)

**Fonctionnalités non prioritaires**

- Système de billetterie
- E-commerce intégré (boutique interne)
- Live match (score en temps réel)
- Forum / commentaires
- Application mobile native
- Système de réservation terrains
- Gestion comptabilité complète
- Espace privé joueurs avec profil public
- Paiement en ligne des licences

---

## 📅 7. Plan de Développement (Étape par Étape)

### 🔧 Phase 0 : Setup Environnement (Jour 1-2)

**Pédagogie** : Comprendre Docker et la configuration initiale

1. ✅ Créer la structure Docker
    - `docker-compose.yml`
    - Dockerfile Django
    - Dockerfile Next.js
2. ✅ Configuration Django
    - Initialiser projet Django
    - Configurer PostgreSQL
    - Settings (ALLOWED_HOSTS, DATABASES, etc.)
3. ✅ Configuration Next.js
    - Initialiser projet Next.js
    - Installer Tailwind CSS
4. ✅ Tester containers
    - `docker-compose up`
    - Vérifier connexions

---

### 🎨 Phase 1 : Backend MVP (Jour 3-7)

**Pédagogie** : Apprendre Django, les modèles, l'admin

1. ✅ Créer les modèles Django
    - Article, Team, Player (avec gestion licences), Match, **TeamStats**, TrainingSchedule, Sponsor, SiteSettings
    - **Pas de modèle Contact** (formulaire envoie directement email)
    - Migrations
    - Comprendre l'ORM Django
2. ✅ Configurer Django Admin
    - Enregistrer les modèles
    - Personnaliser l'affichage (list_display, search_fields, list_filter)
    - **Player** : Filtres par équipe et statut licence
    - **TrainingSchedule** : Organisation par équipe
    - **TeamStats** : Vue en lecture seule (calculées auto)
    - Comprendre l'interface admin
3. ✅ Créer l'API REST (Django REST Framework)
    - Serializers (transformer modèles en JSON)
    - ViewSets (endpoints API)
    - **Attention** : Player n'est PAS exposé dans l'API (admin uniquement)
    - **Nouveaux endpoints** : `/teams/{id}/stats/`, `/teams/{id}/matches/`
    - URLs API
    - Tester avec Postman/Thunder Client
4. ✅ Configuration Email (formulaire contact)
    - Settings SMTP (Gmail, SendGrid, etc.)
    - Vue pour envoyer email directement
    - Pas de stockage en BDD
5. ✅ Script de scraping FFF avec calcul stats
    - Récupérer HTML page résultats
    - Parser les données
    - Stocker matchs en base
    - **Calcul automatique TeamStats** (victoires, buts, forme)
    - Command Django (`python manage.py scrape_results`)
    - **Scheduler** : Configuration pour semaine vs week-end

---

### 🎨 Phase 2 : Frontend MVP (Jour 8-12)

**Pédagogie** : Découvrir Next.js, Tailwind, appels API

1. ✅ Page d'accueil
    - Hero section
    - **Carrousel de matchs** (composant clé)
        - Derniers résultats + prochains matchs (toutes catégories)
        - Navigation flèches gauche/droite (visible au survol)
        - Cartes modernes avec logos, scores, dates, statut
        - Framer Motion pour les transitions
    - Section dernières actus
    - Design style TFC (moderne, épuré)
2. ✅ Page Actualités
    - Liste des articles
    - Page détail article
    - Responsive
3. ✅ Page Résultats
    - Liste des matchs
    - Filtres par équipe (U14, U17, Seniors...)
    - Affichage scores
    - Dernier match / Prochain match
    - Calendrier complet
4. ✅ Page Équipes
    - Liste des équipes (cliquables)
    - Présentation de chaque équipe
    - Photo d'équipe et description
    - **Pas d'affichage des joueurs** (uniquement visible admin)
5. ✅ **Page Détail Équipe** (NOUVELLE)
    - **Onglet DATA** : Statistiques (buts, victoires, forme)
    - **Onglet RÉSULTATS/CALENDRIER** : Matchs par mois (passés/à venir)
    - **Onglet CLASSEMENT** : Tableau du championnat
    - Design avec onglets interactifs
6. ✅ Page Horaires d'entraînement
    - Horaires par équipe
    - Jours, heures, lieux
    - Organisation claire et lisible
7. ✅ Formulaire Contact
    - Champs (nom, email, message)
    - Validation frontend
    - Appel API Django
    - Email envoyé automatiquement
    - Confirmation visuelle

---

### 🎨 Phase 3 : Fonctionnalités V1 (Jour 13-17)

**Pédagogie** : Relations entre modèles, optimisations

1. ✅ Section Sponsors
    - Affichage logos en footer
    - Liens cliquables
    - Admin pour gérer (ordre, activer/désactiver)
2. ✅ Améliorations Admin - Gestion joueurs & licences
    - Interface optimisée pour suivi des licences
    - Filtres : équipe, statut paiement
    - Vue d'ensemble des licences payées/non payées
    - Export possible (futur)
3. ✅ Améliorations Admin - Horaires entraînement
    - Gestion simple des créneaux
    - Organisation par équipe
    - Activation/désactivation
4. ✅ Liens externes
    - Boutique (lien externe)
    - Réseaux sociaux (footer/header)
    - Configuration via SiteSettings

---

### 🎨 Phase 4 : Polish & Déploiement (Jour 18-21)

**Pédagogie** : Optimisations, SEO, mise en production

1. ✅ Optimisations
    - Images (Next Image)
    - Cache API
    - SEO (meta tags)
2. ✅ Animations
    - Framer Motion
    - Transitions pages
3. ✅ Tests
    - Tests fonctionnels
    - Validation responsive
4. ✅ Déploiement
    - Backend (Railway/Render)
    - Frontend (Vercel)
    - Configuration domaine

---

## 🔒 8. Points Critiques

### RGPD & Légal

✅ Mentions légales  
✅ Politique de confidentialité  
✅ Consentement cookies (si analytics)  
✅ Gestion données contact (conservation limitée)

### Scraping FFF - Stratégie intelligente

**📅 En semaine (Lundi-Vendredi)**

- ✅ 1 scraping quotidien à **6h00** du matin
- ✅ Mise à jour des résultats du week-end précédent

**🏟️ Week-end (Samedi-Dimanche)**

- ✅ 6 scrapings par jour - **2h30 après chaque créneau de match**
    - **13h30** → Récupère matchs de 11h
    - **15h30** → Récupère matchs de 13h
    - **17h30** → Récupère matchs de 15h
    - **18h30** → Récupère matchs de 16h
    - **20h30** → Récupère matchs de 18h
    - **22h30** → Récupère matchs de 20h

**Logique** : Match (90 min) + Mi-temps (15 min) + Publication FFF (~45 min) = 2h30

**Bonnes pratiques** : ⚠️ Ne pas surcharger le serveur FFF  
✅ Logs détaillés de chaque scraping  
✅ Gestion des erreurs et retry (max 3 tentatives)  
✅ Fallback si FFF indisponible (affichage dernières données en cache)  
✅ Calcul automatique TeamStats après chaque scraping  
✅ Notification admin si échec > 2 scrapings consécutifs

### Performance

✅ Images optimisées (WebP, compression)  
✅ API rapide (pagination, cache)  
✅ Lazy loading  
✅ Lighthouse score > 90

### Sécurité

✅ Django Admin protégé (HTTPS)  
✅ Variables d'environnement (secrets)  
✅ CORS configuré  
✅ Rate limiting API

---

## 💰 9. Estimation Coûts

### Développement

- **Temps estimé** : 20-25 jours (apprentissage inclus)
- **Coût** : Votre temps 😊

### Hébergement mensuel

|Service|Coût|
|---|---|
|Backend (Railway/Render)|5-10€|
|Frontend (Vercel)|0€ (gratuit)|
|Base de données (incluse)|0€|
|Domaine (.fr)|~1€|
|**TOTAL**|**6-12€/mois**|

---

## 🎓 10. Apprentissage Pédagogique

### Compétences acquises

- ✅ **Docker** : Containerisation, docker-compose
- ✅ **Django** : Modèles, Admin, ORM, API REST
- ✅ **Next.js** : React, App Router, SSR, API calls
- ✅ **PostgreSQL** : Base de données relationnelle
- ✅ **Tailwind CSS** : Design moderne
- ✅ **Scraping** : BeautifulSoup, parsing HTML
- ✅ **Déploiement** : Production, environnements

### Méthode

Chaque étape sera expliquée avec :

- 📖 **Théorie** : Pourquoi on fait ça ?
- 💻 **Code** : Comment on le fait ?
- 🧪 **Test** : Vérifier que ça marche
- 🔍 **Debug** : Comprendre les erreurs

---

## 🚀 11. Prêt à Commencer ?

### Checklist avant de coder

- ✅ Docker installé
- ✅ VSCode (ou IDE)
- ✅ Git installé
- ✅ Compte GitHub
- ✅ Motivation à bloc ! 💪

### Premier pas

👉 **On commence par le setup Docker !**

---

## 📝 Notes

- Documentation vivante : à mettre à jour au fur et à mesure
- Chaque phase = checkpoint (commit Git)
- Possibilité d'adapter selon avancement
- Objectif = apprendre ET livrer un produit de qualité

**Let's build! 🏗️⚽**

---

## 📍 Checkpoint de progression

### Dernière session : 22 avril 2026

### ✅ Phase 0 : Setup Docker — TERMINÉE
- docker-compose.yml (3 services : db, backend, frontend)
- Dockerfile backend (Python 3.12-slim)
- Dockerfile frontend (Node 20-alpine)
- Projet Django initialisé (`jet`)
- Projet Next.js 14 initialisé (TypeScript + Tailwind)
- .env et .gitignore configurés

### ✅ Phase 1 : Backend — TERMINÉE

- settings.py configuré (PostgreSQL, CORS, DRF, variables d'env)
- App Django `club` créée et enregistrée
- Tous les modèles créés et migrés en base :
  Article, Team, Player, TrainingSchedule, Match, TeamStats, Sponsor, SiteSettings
- Django Admin configuré en français avec filtres et recherche
- Superutilisateur `admin` créé
- API REST complète (serializers, views, urls)
- Scraping FFF : `backend/club/management/commands/scrape_fff.py`
  - cl_no JET = 11641
  - Pagination sur 9 pages (243 matchs)
  - Toutes équipes : Seniors, Seniors 2, U19, U17, U16, U15, U14, Féminines, U15F, U18F, Futsal
  - Détection U16/U14 via nom de compétition (FFF code U17/U15 pour ces tranches)
  - Lancer : `docker compose exec backend python manage.py scrape_fff`

### 🔲 Phase 2 : Frontend Next.js — À DÉMARRER

- Page d'accueil (hero + carrousel matchs + actus + sponsors)
- Page Actualités (liste + détail)
- Page Résultats (matchs filtrés par équipe)
- Page Équipes (liste + détail avec onglets DATA/RÉSULTATS/CLASSEMENT)
- Page Horaires d'entraînement
- Formulaire Contact
