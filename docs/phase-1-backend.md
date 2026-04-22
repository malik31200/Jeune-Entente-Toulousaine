# Phase 1 : Backend MVP

## Objectif
Créer le backend Django complet : modèles de données, interface admin, et API REST.

---

## Architecture de l'app Django

```
backend/
├── jet/              ← Configuration du projet
│   ├── settings.py   ← Paramètres (BDD, CORS, apps...)
│   ├── urls.py       ← URLs principales
│   └── wsgi.py       ← Point d'entrée serveur
└── club/             ← Notre application
    ├── models.py     ← Modèles de données (tables BDD)
    ├── admin.py      ← Configuration interface admin
    ├── serializers.py← Conversion Python ↔ JSON
    ├── views.py      ← Logique des endpoints API
    └── urls.py       ← Routes de l'API
```

---

## Étape 1 : settings.py

Configuré pour lire les secrets depuis les variables d'environnement Docker :
```python
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-fallback-key')
DEBUG = os.environ.get('DEBUG', '0') == '1'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')
```

Apps installées :
- `rest_framework` : Django REST Framework (API)
- `corsheaders` : autorise les appels depuis Next.js (localhost:3000)
- `club` : notre application

Base de données PostgreSQL :
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': 'db',  # nom du service Docker
        ...
    }
}
```

---

## Étape 2 : Les modèles (models.py)

Un modèle = une table en base de données. Django crée le SQL automatiquement.

### Article
Gestion des actualités du club. Génère automatiquement un `slug` depuis le titre.

### Team
Les équipes du club (Seniors A, U17, U14...).

### Player ⚠️
Joueurs et gestion des licences. **Jamais exposé dans l'API** — uniquement visible dans l'admin.

Champs licence : `license_paid`, `payment_method`, `payment_date`, `license_amount`

### TrainingSchedule
Horaires d'entraînement par équipe, jour et lieu.

### Match
Résultats et calendrier. Statuts : `TERMINE`, `A_VENIR`, `EN_COURS`.

### TeamStats
Statistiques de saison : victoires, buts, classement, forme (ex: "VVNDV").

### Sponsor
Partenaires du club avec logo et lien.

### SiteSettings
Configuration globale : réseaux sociaux, boutique, email de contact.

---

## Étape 3 : Les migrations

Les migrations = traduction des modèles Python en tables SQL.

```bash
# Génère le fichier de migration (le "plan")
docker compose exec backend python manage.py makemigrations

# Exécute les migrations (crée les tables en BDD)
docker compose exec backend python manage.py migrate
```

---

## Étape 4 : L'interface Admin

Configurée dans `admin.py` avec des filtres et recherches pour chaque modèle.

Fonctionnalités clés :
- **Articles** : filtre publié/brouillon, recherche titre/contenu, slug auto
- **Joueurs** : filtre par équipe et statut licence
- **Matchs** : filtre par équipe et statut
- **TeamStats** : champs `updated_at` en lecture seule

Accès : `http://localhost:8000/admin`

Créer un superutilisateur :
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## Étape 5 : Les serializers (serializers.py)

Transforment les objets Python en JSON pour l'API.

```python
class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'category', 'description', 'image', 'order']
```

Astuce `SerializerMethodField` : permet d'ajouter des champs calculés (ex: `author_name`).
Astuce `source='team.name'` : accède aux champs d'un modèle lié.

---

## Étape 6 : Les vues (views.py)

Utilisent des `ReadOnlyModelViewSet` : génèrent automatiquement les endpoints GET.

Filtres dynamiques via `query_params` :
```
GET /api/matches/?team=1&status=TERMINE
```

Vue spéciale pour le formulaire contact (`@api_view(['POST']`)) :
- Reçoit nom, email, message
- Envoie un email directement (pas de stockage en BDD)
- Retourne succès ou erreur

---

## Étape 7 : Les URLs

### `club/urls.py`
Le Router DRF génère automatiquement toutes les URLs :

| URL | Description |
|---|---|
| `GET /api/articles/` | Liste des articles publiés |
| `GET /api/articles/{slug}/` | Détail d'un article |
| `GET /api/teams/` | Liste des équipes |
| `GET /api/teams/{id}/` | Détail d'une équipe |
| `GET /api/matches/` | Liste des matchs |
| `GET /api/matches/?team=1` | Matchs filtrés par équipe |
| `GET /api/training-schedules/` | Horaires d'entraînement |
| `GET /api/team-stats/` | Statistiques équipes |
| `GET /api/sponsors/` | Sponsors actifs |
| `POST /api/contact/` | Formulaire de contact |

### `jet/urls.py`
Connecte l'app `club` au projet principal :
```python
path('api/', include('club.urls')),
```

---

## Concepts appris

### ORM Django
On n'écrit jamais de SQL. Django traduit Python en SQL :
```python
Match.objects.filter(team_id=1, status='TERMINE')
# → SELECT * FROM match WHERE team_id=1 AND status='TERMINE'
```

### ForeignKey
Relation entre deux tables :
```python
team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches')
```
`related_name='matches'` permet d'accéder aux matchs depuis une équipe : `team.matches.all()`

### ReadOnlyModelViewSet vs ModelViewSet
- `ReadOnlyModelViewSet` : GET uniquement (liste + détail) — pour l'API publique
- `ModelViewSet` : GET + POST + PUT + DELETE — pour une API admin (non utilisé ici)

---

## Résultat final
- `http://localhost:8000/admin` → interface admin ✅
- `http://localhost:8000/api/` → liste des endpoints ✅
- Tous les endpoints API fonctionnels ✅

---

## Étape 8 : Le scraping de l'API FFF

### Pourquoi l'API FFF et pas du scraping HTML ?

La FFF expose une API REST officielle (`api-dofa.fff.fr`) qui retourne du JSON propre. C'est bien plus fiable que de parser du HTML qui peut changer à tout moment.

### Trouver l'identifiant du club

Chaque club a un identifiant unique `cl_no` dans la base FFF. Pour JET :
```
cl_no = 11641
```

URL des matchs :
```
https://api-dofa.fff.fr/api/clubs/11641/matchs?sa_no=2025
```
(`sa_no` = numéro de saison, 2025 = saison 2025/2026)

### Structure de l'API (Hydra/JSON-LD)

L'API utilise le format **Hydra** (JSON-LD), reconnaissable à ses clés préfixées `hydra:` :

```json
{
  "hydra:totalItems": 243,
  "hydra:member": [ ...liste des matchs... ],
  "hydra:view": {
    "hydra:next": "/api/clubs/11641/matchs?sa_no=2025&page=2",
    "hydra:last": "/api/clubs/11641/matchs?sa_no=2025&page=9"
  }
}
```

- `hydra:member` → les matchs de la page courante (30 par page)
- `hydra:totalItems` → nombre total de matchs (243 pour JET)
- `hydra:view.hydra:next` → URL de la page suivante (absent sur la dernière page)

### Pagination

L'API retourne **30 matchs par page**. JET a 243 matchs sur 9 pages. Notre scraper boucle tant qu'il y a une page suivante :

```python
while next_url:
    response = requests.get(base_url + next_url)
    data = response.json()
    # traiter les matchs...
    next_url = data.get('hydra:view', {}).get('hydra:next')
```

### Structure d'un match

Chaque match contient :
```json
{
  "ma_no": 53561981,
  "competition": { "name": "U16 Régional 1 M", ... },
  "home": {
    "club": { "cl_no": 11641 },
    "category_code": "U17",
    "code": 21,
    "short_name": "JEUNE ENTENTE TOULOU"
  },
  "away": { "club": { "cl_no": 21594 }, ... },
  "date": "2025-09-13T00:00:00+00:00",
  "time": "18H00",
  "home_score": 1,
  "away_score": 1
}
```

### Piège : les category_code FFF

Le FFF utilise des codes par **tranche d'âge**, pas par catégorie exacte :

| Compétition réelle | category_code FFF | Explication |
|---|---|---|
| U17 Régional 1 | `U17` | ✅ correct |
| **U16 Régional 1** | `U17` | ⚠️ U16 est dans la tranche U17 |
| U15 Régional 1 | `U15` | ✅ correct |
| **U14 Régional 1** | `U15` | ⚠️ U14 est dans la tranche U15 |
| Seniors 1 | `SEM` + `code: 1` | ✅ correct |
| **Seniors 2** | `SEM` + `code: 2` | ⚠️ même code, champ `code` différent |

**Solution** : utiliser le nom de la compétition pour détecter U16/U14, et le champ `code` pour Seniors 2 :

```python
def get_or_create_team(self, category_code, competition_name, team_code):
    comp = competition_name.upper()
    if 'U16' in comp:
        team_name = 'U16'
    elif 'U14' in comp:
        team_name = 'U14'
    elif category_code == 'SEM' and team_code == 2:
        team_name = 'Seniors 2'
    else:
        team_name = CATEGORY_TO_TEAM.get(category_code)
```

### Déterminer si JET joue à domicile

```python
is_home = home_club.get('cl_no') == FFF_CLUB_ID
our_team_data = home if is_home else away
```

Si `cl_no` de l'équipe à domicile = 11641 → JET joue à domicile. Sinon → JET joue à l'extérieur.

### Parser la date

La date est au format ISO 8601 avec timezone (`T00:00:00+00:00`), et l'heure est dans un champ séparé (`"18H00"`). On les combine :

```python
def parse_date(self, date_str, time_str='00H00'):
    dt = datetime.fromisoformat(date_str)   # "2025-09-13T00:00:00+00:00"
    parts = time_str.replace('H', ':').split(':')  # "18H00" → [18, 0]
    dt = dt.replace(hour=int(parts[0]), minute=int(parts[1]))
    return dt
```

### update_or_create

Au lieu d'insérer ou vérifier manuellement, Django a une méthode puissante :

```python
match, was_created = Match.objects.update_or_create(
    home_team=home_name,   # clé unique : ces 3 champs
    away_team=away_name,
    date=match_date,
    defaults={ ... }       # champs à mettre à jour si le match existe déjà
)
```

Si le match n'existe pas → il est **créé**. S'il existe → il est **mis à jour**. Parfait pour un scraping récurrent.

### Lancer le scraping

```bash
docker compose exec backend python manage.py scrape_fff
```

### Résultat

- 243 matchs récupérés sur 9 pages
- Toutes les équipes détectées : Seniors, Seniors 2, U19, U17, U16, U15, U14, Féminines, U15 Féminines, U18 Féminines, Futsal
- Visible dans l'admin : `http://localhost:8000/admin/club/match/`
