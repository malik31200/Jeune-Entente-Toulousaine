# Phase 0 : Setup Environnement

## Objectif
Mettre en place l'infrastructure Docker avec Django et Next.js sans rien installer localement (hors Docker et Node.js).

---

## Ce qu'on a créé

### Structure du projet
```
Jeune-Entente-Toulousaine/
├── backend/          ← Django (Python)
├── frontend/         ← Next.js (TypeScript)
├── docs/             ← Documentation
├── docker-compose.yml
├── .env
└── .gitignore
```

---

## Les fichiers clés

### `backend/Dockerfile`
Recette pour construire le container Django.
- Base : `python:3.12-slim` (image Python légère)
- `WORKDIR /app` : dossier de travail dans le container
- `PYTHONUNBUFFERED=1` : affiche les logs en temps réel
- Installe les dépendances via `requirements.txt`

### `backend/requirements.txt`
Liste des bibliothèques Python installées dans le container :
- `Django==5.1` : le framework web
- `djangorestframework` : pour créer l'API REST
- `django-cors-headers` : autorise Next.js à appeler l'API
- `psycopg2-binary` : connecteur PostgreSQL
- `Pillow` : gestion des images uploadées
- `requests` + `beautifulsoup4` : scraping FFF
- `python-dotenv` : lecture du fichier .env

### `frontend/Dockerfile`
Recette pour construire le container Next.js.
- Base : `node:20-alpine` (image Node légère)
- Build en 2 étapes : installation des dépendances puis copie du code
- Lance `npm run dev` au démarrage

### `docker-compose.yml`
Le chef d'orchestre — lance les 3 services ensemble :

| Service | Rôle | Port |
|---|---|---|
| `db` | PostgreSQL (base de données) | 5432 |
| `backend` | Django (API) | 8000 |
| `frontend` | Next.js (interface) | 3000 |

Commandes utiles :
```bash
docker compose up          # démarre tous les containers
docker compose up --build  # reconstruit et démarre
docker compose down        # arrête tout
docker compose restart backend  # redémarre un service
```

### `.env`
Variables d'environnement (jamais committé sur Git) :
```
POSTGRES_DB=jet_db
POSTGRES_USER=jet_user
POSTGRES_PASSWORD=jet_password
SECRET_KEY=...
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1,backend
```

### `.gitignore`
Fichiers que Git doit ignorer :
- `__pycache__/`, `*.pyc` : fichiers Python compilés
- `frontend/node_modules/` : dépendances npm (trop lourd)
- `frontend/.next/` : build Next.js
- `.env` : secrets

---

## Concepts appris

### Docker vs venv
On utilise Docker à la place d'un environnement virtuel Python (venv) :
- Docker isole à la fois les dépendances ET le système
- L'environnement est identique sur toutes les machines
- Pas besoin d'installer Python ou Node localement

### Commande clé
```bash
# Créer le projet Django depuis un container Docker temporaire
docker run --rm -v $(pwd)/backend:/app -w /app python:3.12-slim \
  bash -c "pip install django==5.1 -q && django-admin startproject jet ."
```

### Problème de permissions
Les fichiers créés par Docker appartiennent à `root`. Solution :
```bash
sudo chown -R $USER:$USER backend/
```

---

## Résultat final
- `http://localhost:8000` → page Django ✅
- `http://localhost:3000` → page Next.js ✅
- PostgreSQL opérationnel ✅
