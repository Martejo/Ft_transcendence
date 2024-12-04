# accounts/utils.py

import jwt
from datetime import datetime, timedelta
from django.conf import settings

def generate_jwt_token(user):
    """
    Génère un jeton JWT pour un utilisateur donné.

    Args:
        user (User): L'instance de l'utilisateur pour lequel générer le jeton.

    Returns:
        str: Le jeton JWT sous forme de chaîne de caractères.
    """
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.utcnow() + timedelta(hours=1),  # Durée de validité du jeton
    }
    token_jwt = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    # Si jwt.encode retourne un objet bytes, le décoder en chaîne de caractères
    if isinstance(token_jwt, bytes):
        token_jwt = token_jwt.decode('utf-8')

    return token_jwt
