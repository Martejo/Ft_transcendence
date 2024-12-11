# User/models.py
# ---- Imports standard ----
import random
from datetime import datetime, timedelta
from pathlib import Path

# ---- Imports tiers ----
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.timezone import now


#[DOCUMENTATION] <Django - User & Abstract User>
class CustomUser(AbstractUser):
    # Champs supplémentaires
    is_2fa_enabled = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=32, null=True, blank=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        default='avatars/default_avatar.png'
    )
    bio = models.TextField(max_length=500, blank=True)
    is_online = models.BooleanField(default=False)
    def __str__(self):
        return self.username

# Il faudra le passer dans l'app game par la suite
class Game(models.Model):
    player1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='games_as_player2', on_delete=models.CASCADE)
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=[('ongoing', 'Ongoing'), ('finished', 'Finished')], default='ongoing')
    
    def __str__(self):
        return f"Game {self.id} - {self.player1} vs {self.player2}"

class MatchHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='match_histories')
    game = models.ForeignKey(Game, related_name='match_histories', on_delete=models.CASCADE)
    result = models.CharField(max_length=10, choices=[('win', 'Win'), ('loss', 'Loss'), ('draw', 'Draw')])
    played_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} - {self.game} - {self.result}"


class FriendRequest(models.Model):
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='friend_requests_sent',
        on_delete=models.CASCADE
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='friend_requests_received',
        on_delete=models.CASCADE
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='pending'
    )

    def __str__(self):
        return f"{self.from_user} to {self.to_user} - {self.status}"


class TwoFactorCode(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate_code(cls, user):
        # Supprimer les anciens codes
        cls.objects.filter(user=user).delete()
        # Générer un nouveau code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        return cls.objects.create(user=user, code=code)

    def is_valid(self):
        # Le code expire après 10 minutes
        return datetime.now() - timedelta(minutes=10) <= self.created_at.replace(tzinfo=None)


# Stocker les refresh tokens en base de donnee 
# pour pouvoir les comparer a ceux que l' utilisateur nous envoie
# la validite des access tokens est elle geree par PyJWT
class RefreshToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='refresh_tokens')
    token = models.CharField(max_length=255, unique=True)  # Le token JWT
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        """Vérifie si le token a expiré"""
        return now() > self.expires_at

    def __str__(self):
        return f"RefreshToken(user={self.user}, expires_at={self.expires_at})"