# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError('Le nom d\'utilisateur doit être défini')
        if not email:
            raise ValueError('L\'email doit être défini')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # Hache le mot de passe
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    is_2fa_enabled = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=32, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    last_activity = models.DateTimeField(null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

class CustomUserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        default='avatars/default_avatar.png'
    )
    bio = models.TextField(max_length=500, blank=True)
    is_online = models.BooleanField(default=False)
    is_logged_in = models.BooleanField(default=False)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)

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
        return timezone.now() - timezone.timedelta(minutes=10) <= self.created_at
