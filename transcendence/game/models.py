from django.db import models
from accounts.models import CustomUser
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta
import uuid

def default_expiration_time():
    """Retourne l'heure actuelle + 5 minutes."""
    return now() + timedelta(minutes=5)


class GameInvitation(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='invitations_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='invitations_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expiration_time)  # Utilisation de la fonction définie
    status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected'), ('expired', 'Expired')],
        default='pending',
    )

    def is_expired(self):
        """Retourne True si l'invitation a expiré."""
        return now() > self.expires_at

    def __str__(self):
        if self.status == 'expired':
            return f"Invitation expirée de {self.from_user.username} à {self.to_user.username}"
        return f"Invitation de {self.from_user.username} à {self.to_user.username} - {self.status}"

class GameInvitationParameters(models.Model):
    """
    Permet de stocker les paramètres de jeu pour une invitation en ligne
    (avant que la session ne soit créée).
    """
    invitation = models.OneToOneField(
        GameInvitation,
        on_delete=models.CASCADE,
        related_name='parameters'
    )

    BALL_SPEED_CHOICES = [(1, 'Slow'), (2, 'Medium'), (3, 'Fast')]
    ball_speed = models.PositiveSmallIntegerField(choices=BALL_SPEED_CHOICES, default=2)

    RACKET_SIZE_CHOICES = [(1, 'Small'), (2, 'Medium'), (3, 'Large')]
    racket_size = models.PositiveSmallIntegerField(choices=RACKET_SIZE_CHOICES, default=2)

    bonus_malus_activation = models.BooleanField(default=True)
    bumpers_activation = models.BooleanField(default=False)

    def __str__(self):
        return f"(Invitation={self.invitation.id}) " \
               f"BallSpeed={self.get_ball_speed_display()}, " \
               f"RacketSize={self.get_racket_size_display()}, " \
               f"Bonus={self.bonus_malus_activation}, Bumpers={self.bumpers_activation}"


    

class GameSession(models.Model):
    """
    Un enregistrement pour représenter une partie (en cours ou terminée).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player_left = models.CharField(max_length=50, null=True, blank=True)
    player_right = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # ex: "running", "finished"
    status = models.CharField(max_length=10, default='running')

    def __str__(self):
        return f"GameSession {self.id} (status={self.status})"

class GameResult(models.Model):
    """
    Enregistre le score final d'une partie terminée.
    """
    game = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    winner = models.CharField(max_length=10)  # "left" ou "right"
    looser = models.CharField(max_length=10)  # "left" ou "right"
    score_left = models.IntegerField()
    score_right = models.IntegerField()
    ended_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.game.id}] winner={self.winner} looser={self.looser} => {self.score_left}-{self.score_right}"




class GameParameters(models.Model):
    game_session = models.OneToOneField(GameSession, related_name='parameters', on_delete=models.CASCADE)
    BALL_SPEED_CHOICES = [(1, 'Slow'), (2, 'Medium'), (3, 'Fast'),]
    ball_speed = models.PositiveSmallIntegerField(choices=BALL_SPEED_CHOICES, default=2)

    RACKET_SIZE_CHOICES = [(1, 'Small'), (2, 'Medium'), (3, 'Large'),]
    racket_size = models.PositiveSmallIntegerField(choices=RACKET_SIZE_CHOICES, default=2)

    bonus_malus_activation = models.BooleanField(default=True)
    bumpers_activation = models.BooleanField(default=False)


    def __str__(self):
        return (f"Ball speed: {self.get_ball_speed_display()}, "
                f"Racket size: {self.get_racket_size_display()}, "
                f"Bonus/Malus: {'On' if self.bonus_malus_activation else 'Off'}, "
                f"Bumpers: {'On' if self.bumpers_activation else 'Off'}")


