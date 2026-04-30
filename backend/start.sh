#!/bin/bash
set -e
python manage.py migrate --noinput

echo "DEBUG: DJANGO_SUPERUSER_USERNAME='$DJANGO_SUPERUSER_USERNAME'"
echo "DEBUG: PASSWORD_LEN=${#DJANGO_SUPERUSER_PASSWORD}"

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
user, created = User.objects.get_or_create(username='$DJANGO_SUPERUSER_USERNAME', defaults={'email': '$DJANGO_SUPERUSER_EMAIL', 'is_staff': True, 'is_superuser': True})
user.set_password('$DJANGO_SUPERUSER_PASSWORD')
user.is_staff = True
user.is_superuser = True
user.save()
print('Superuser OK:', '$DJANGO_SUPERUSER_USERNAME', '(created)' if created else '(updated)')
"
else
    echo "SKIP: superuser env vars not set."
fi

exec gunicorn jet.wsgi --bind 0.0.0.0:${PORT:-8080} --workers 2 --log-level info
