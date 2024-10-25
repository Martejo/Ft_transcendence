import hashlib
import os
import base64
import jwt
from datetime import datetime, timedelta
from django.conf import settings
import random

def hash_password(password):
    # Générer un sel unique de 16 octets
    salt = os.urandom(16)
    # Hacher le mot de passe avec le sel
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    # Combiner le sel et le haché, puis encoder en base64
    stored_password = base64.b64encode(salt + pwd_hash).decode('utf-8')
    return stored_password


def verify_password(stored_password, provided_password):
    # Décoder le mot de passe stocké depuis base64
    stored_password_bytes = base64.b64decode(stored_password.encode('utf-8'))
    # Extraire le sel et le haché stockés
    salt = stored_password_bytes[:16]
    stored_hash = stored_password_bytes[16:]
    # Hacher le mot de passe fourni avec le sel stocké
    pwd_hash = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
    # Comparer les hachés
    return pwd_hash == stored_hash

def generate_jwt_token(user_id, type='access'):
    expiry = datetime.utcnow() + (
        timedelta(minutes=60) if type == 'access' 
        else timedelta(days=1)
    )
    
    payload = {
        'user_id': user_id,
        'exp': expiry,
        'type': type
    }
    
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm='HS256'
    )

def verify_jwt_token(token):
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=['HS256']
        )
    except:
        return None

def generate_2fa_code():
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])