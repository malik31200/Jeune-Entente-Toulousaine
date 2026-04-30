#!/bin/bash
set -e
python manage.py migrate --noinput

python manage.py shell << 'PYEOF'
import os
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
if username and password:
    user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'is_staff': True, 'is_superuser': True})
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print(f'Superuser OK: {username} ({"created" if created else "updated"})')
else:
    print('No superuser env vars set, skipping.')
PYEOF

exec gunicorn jet.wsgi --bind 0.0.0.0:${PORT:-8080} --workers 2 --log-level info
