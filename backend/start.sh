#!/bin/bash
set -e
python manage.py migrate --noinput
exec gunicorn jet.wsgi --bind 0.0.0.0:${PORT:-8080} --workers 2 --log-level info
