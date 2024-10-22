import os
import time
import psycopg2
from psycopg2 import OperationalError

def wait_for_postgres():
    db_name = os.getenv('DATABASE_NAME')
    db_user = os.getenv('DATABASE_USER')
    db_password = os.getenv('DATABASE_PASSWORD')
    db_host = os.getenv('DATABASE_HOST')
    db_port = os.getenv('DATABASE_PORT')

    while True:
        try:
            print("Tentative de connexion à la base de données PostgreSQL...")
            conn = psycopg2.connect(
                dbname=db_name,
                user=db_user,
                password=db_password,
                host=db_host,
                port=db_port,
            )
            conn.close()
            print("Connexion établie avec succès à la base de données PostgreSQL.")
            break
        except OperationalError as e:
            print(f"La base de données n'est pas encore prête ({e}). Nouvelle tentative dans 1 seconde...")
            time.sleep(1)

if __name__ == '__main__':
    wait_for_postgres()
