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
