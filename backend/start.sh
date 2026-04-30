#!/bin/bash
set -e
python manage.py migrate --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    python manage.py createsuperuser --noinput || true
fi

exec gunicorn jet.wsgi --bind 0.0.0.0:${PORT:-8080} --workers 2 --log-level info
