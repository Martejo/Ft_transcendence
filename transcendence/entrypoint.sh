#!/bin/sh

# Attendre que la base de données PostgreSQL soit prête
python wait_for_postgres.py

python manage.py makemigrations

python manage.py migrate

# Démarrer le serveur Django
exec python manage.py runserver 0.0.0.0:8000 --noreload --verbosity 3