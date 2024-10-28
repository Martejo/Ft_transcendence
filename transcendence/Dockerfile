# Dockerfile

FROM python:3.11-slim

WORKDIR /code

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copier et rendre exécutable le script wait-for-it.sh
COPY wait_for_postgres.py /wait_for_postgres.py
RUN chmod +x /wait_for_postgres.py

# Copier et rendre exécutable le script entrypoint.sh
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Installer les dépendances Python
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copier le code de l'application
COPY . .

# Exposer le port 8000
EXPOSE 8000

# Définir le script d'entrée
ENTRYPOINT ["/entrypoint.sh"]
