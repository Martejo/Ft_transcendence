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


class GameParameters(models.Model):
    BALL_SPEED_CHOICES = [
        (1, 'Slow'),
        (2, 'Medium'),
        (3, 'Fast'),
    ]
    ball_speed = models.PositiveSmallIntegerField(choices=BALL_SPEED_CHOICES, default=2)

    RACKET_SIZE_CHOICES = [
        (1, 'Small'),
        (2, 'Medium'),
        (3, 'Large'),
    ]
    racket_size = models.PositiveSmallIntegerField(choices=RACKET_SIZE_CHOICES, default=2)

    bonus_malus_activation = models.BooleanField(default=False)
    bumpers_activation = models.BooleanField(default=False)

    def __str__(self):
        return f"Ball speed: {self.get_ball_speed_display()}, Racket size: {self.get_racket_size_display()}"


class Game(models.Model):
    user1 = models.ForeignKey(
        CustomUser,
        related_name='games_as_user1',
        on_delete=models.CASCADE
    )
    user2 = models.ForeignKey(
        CustomUser,
        related_name='games_as_user2',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    # Paramètres associés à la partie, toujours présents
    parameters = models.OneToOneField(
        'GameParameters',
        related_name='game',
        on_delete=models.PROTECT,
    )
    score_user1 = models.PositiveIntegerField(default=0)
    score_user2 = models.PositiveIntegerField(default=0)
    game_type = models.CharField(
        max_length=20,
        choices=[
            ('local', 'Local'),
            ('online', 'Online'),
        ],
        default='local'
    )
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('canceled', 'Canceled'),
        ],
        default='pending'
    )
    def __str__(self):
        user2_display = self.user2.username if self.user2 else 'Local (Shared Keyboard)'
        return f"Game: {self.user1.username} vs {user2_display}"

    def save(self, *args, **kwargs):
        # Si le jeu est standard, assure que les paramètres par défaut sont utilisés
        if not self.parameters:
            self.parameters = GameParameters.objects.create()
        super().save(*args, **kwargs)

    def get_scores(self):
        return {
            "user1": self.score_user1,
            "user2": self.score_user2,
        }

    def end_game(self):
        self.status = 'completed'
        self.end_time = now()
        self.save()




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
