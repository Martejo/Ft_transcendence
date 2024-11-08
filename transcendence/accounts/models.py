# User/models.py
from django.db import models
from django.utils import timezone
from pathlib import Path
import random
from datetime import datetime, timedelta


class CustomUser(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=256)  # Hachage du mot de passe
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_2fa_enabled = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=32, null=True, blank=True)
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        default='avatars/default_avatar.png'  # Chemin vers l'image par défaut
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Nécessaire pour l'administration
    is_superuser = models.BooleanField(default=False)  # Nécessaire pour les permissions

    USERNAME_FIELD = 'username'  # Champ utilisé comme identifiant unique
    REQUIRED_FIELDS = ['email']  # Attribut obligatoire
    
    def __str__(self):
        return self.username

    @property
    def is_anonymous(self):
        return False

    @property
    def is_authenticated(self):
        return True

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username

class CustomUserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    is_online = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Profile de {self.user.username}"

class FriendRequest(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='friend_requests_received', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='pending'
    )
    
    def __str__(self):
        return f"{self.from_user} to {self.to_user} - {self.status}"

class Game(models.Model):
    player1 = models.ForeignKey(CustomUser, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(CustomUser, related_name='games_as_player2', on_delete=models.CASCADE)
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=[('ongoing', 'Ongoing'), ('finished', 'Finished')], default='ongoing')
    
    def __str__(self):
        return f"Game {self.id} - {self.player1} vs {self.player2}"

class MatchHistory(models.Model):
    user = models.ForeignKey(CustomUser, related_name='match_histories', on_delete=models.CASCADE)
    game = models.ForeignKey(Game, related_name='match_histories', on_delete=models.CASCADE)
    result = models.CharField(max_length=10, choices=[('win', 'Win'), ('loss', 'Loss'), ('draw', 'Draw')])
    played_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} - {self.game} - {self.result}"


class TwoFactorCode(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def generate_code(cls, user):
        # Delete old codes
        cls.objects.filter(user=user).delete()
        # Generate new code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        return cls.objects.create(user=user, code=code)
    
    def is_valid(self):
        # Code expires after 10 minutes
        return datetime.now() - timedelta(minutes=10) <= self.created_at.replace(tzinfo=None)