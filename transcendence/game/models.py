from django.db import models
from accounts.models import CustomUser
from django.conf import settings
from django.utils.timezone import now

class GameInvitation(models.Model):
    from_user = models.ForeignKey(CustomUser, related_name='invitations_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(CustomUser, related_name='invitations_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='pending'
    )
    
    def __str__(self):
        return f"Invitation de {self.from_user.username} à {self.to_user.username} - {self.status}"

class GameResult(models.Model):
    """Modèle représentant le résultat d'une partie."""
    player1 = models.ForeignKey(
        CustomUser,
        related_name='games_as_player1',
        on_delete=models.CASCADE,
    )
    player2 = models.ForeignKey(
        CustomUser,
        related_name='games_as_player2',
        on_delete=models.CASCADE,
    )
    score_player1 = models.PositiveIntegerField(default=0)
    score_player2 = models.PositiveIntegerField(default=0)
    winner = models.ForeignKey(
        CustomUser,
        related_name='games_won',
        on_delete=models.CASCADE,
        null=True,  # Null en cas de match nul
        blank=True,
    )
    is_draw = models.BooleanField(default=False)  # Indique si le match est nul
    date = models.DateTimeField(auto_now_add=True)
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('finished', 'Finished'),
    ]
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ongoing',
    )

    def save(self, *args, **kwargs):
        """Détermine le vainqueur ou si le match est nul avant de sauvegarder."""
        if self.score_player1 == self.score_player2:
            self.is_draw = True
            self.winner = None
        else:
            self.is_draw = False
            self.winner = self.player1 if self.score_player1 > self.score_player2 else self.player2
        super().save(*args, **kwargs)

    def get_opponent(self, user):
        """Retourne l'adversaire d'un utilisateur dans ce match."""
        return self.player2 if self.player1 == user else self.player1

    def __str__(self):
        if self.is_draw:
            return f"Match nul entre {self.player1.username} et {self.player2.username}"
        return f"Victoire de {self.winner.username} ({self.player1.username} vs {self.player2.username})"

    class Meta:
        verbose_name = "Game Result"
        verbose_name_plural = "Game Results"
        ordering = ['-date']




class GameParameters(models.Model):
    """Modèle représentant les paramètres personnalisés d'une partie."""
    BALL_SPEED_MIN = 1.0
    BALL_SPEED_MAX = 2.0

    ball_speed = models.FloatField(
        default=1.0,
        help_text="Ball speed (range: 1.0 to 2.0).",
    )

    RACKET_SIZE_CHOICES = [
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
    ]
    racket_size = models.CharField(
        max_length=10,
        choices=RACKET_SIZE_CHOICES,
        default='medium',
    )

    # Bonus options
    bonus_obstacle = models.BooleanField(default=False)
    bonus_speed = models.BooleanField(default=False)
    bonus_shrink = models.BooleanField(default=False)
    bonus_frost = models.BooleanField(default=False)
    bonus_flash = models.BooleanField(default=False)
    bonus_mind = models.BooleanField(default=False)
    bonus_canon = models.BooleanField(default=False)

    def __str__(self):
        return (
            f"Ball speed: {self.ball_speed}, "
            f"Racket size: {self.get_racket_size_display()}, "
            f"Active bonuses: {self.get_active_bonuses()}"
        )

    def get_active_bonuses(self):
        """Retourne une liste des bonus activés."""
        bonuses = [
            ('Obstacle', self.bonus_obstacle),
            ('Speed', self.bonus_speed),
            ('Shrink', self.bonus_shrink),
            ('Frost', self.bonus_frost),
            ('Flash', self.bonus_flash),
            ('Mind', self.bonus_mind),
            ('Canon', self.bonus_canon),
        ]
        return ", ".join(name for name, active in bonuses if active) or "None"

    class Meta:
        verbose_name = "Game Parameter"
        verbose_name_plural = "Game Parameters"

class Game(models.Model):
    """Modèle représentant une session de jeu."""
    player1 = models.ForeignKey(
        CustomUser,
        related_name='game_sessions_as_player1',
        on_delete=models.CASCADE,
    )
    player2 = models.ForeignKey(
        CustomUser,
        related_name='game_sessions_as_player2',
        on_delete=models.CASCADE,
    )
    parameters = models.ForeignKey(
        'GameParameters',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    STATE_CHOICES = [
        ('pending', 'Pending'),
        ('ongoing', 'Ongoing'),
        ('finished', 'Finished'),
    ]
    state = models.CharField(
        max_length=10,
        choices=STATE_CHOICES,
        default='pending',
    )
    result = models.OneToOneField(
        'game.GameResult',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    start_time = models.DateTimeField(default=now)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"GameSession {self.id}: {self.player1.username} vs {self.player2.username} ({self.state})"

    class Meta:
        verbose_name = "Game"
        verbose_name_plural = "Games"
        ordering = ['-start_time']




    # cette base de donnee sera sauvegardee sur redis pour une utilisation plus rapide
    class GameState(models.Model):
        raquette_gauche_y = models.FloatField(default=50.0)  # Position verticale en pourcentage
        raquette_droite_y = models.FloatField(default=50.0)
        score_gauche = models.IntegerField(default=0)
        score_droite = models.IntegerField(default=0)
        balle_x = models.FloatField(default=50.0)
        balle_y = models.FloatField(default=50.0)
        balle_speed_x = models.FloatField(default=0.5)
        balle_speed_y = models.FloatField(default=0.5)

        def reset(self):
            self.raquette_gauche_y = 50.0
            self.raquette_droite_y = 50.0
            self.balle_x = 50.0
            self.balle_y = 50.0
            self.balle_speed_x = 0.5
            self.balle_speed_y = 0.5
            self.save()
