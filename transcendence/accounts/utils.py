# accounts/utils.py

# ---- Imports standard ----
from datetime import timedelta

# ---- Imports tiers ----
import jwt
from django.conf import settings
from django.utils import timezone

# ---- Imports locaux ----
from .models import RefreshToken



def generate_jwt_token(user):
    """
    Génère un Access Token et un Refresh Token pour l'utilisateur.
    """
    current_time = timezone.now()  # Utilise timezone.now() pour un datetime avec fuseau horaire

    access_payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': current_time + timedelta(hours=1),  # Durée courte pour l'Access Token
    }
    refresh_payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': current_time + timedelta(days=7),  # Durée longue pour le Refresh Token
    }

    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

    # Stocker le Refresh Token dans la base de données
    RefreshToken.objects.create(
        user=user,
        token=refresh_token,
        expires_at=current_time + timedelta(days=7)  # Utilise un datetime avec fuseau horaire
    )

    return {
        'access_token': access_token.decode('utf-8') if isinstance(access_token, bytes) else access_token,
        'refresh_token': refresh_token.decode('utf-8') if isinstance(refresh_token, bytes) else refresh_token,
    }