import hashlib
import os
import base64

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

