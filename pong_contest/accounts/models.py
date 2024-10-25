from django.db import models


# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=256)  # Ajustez la longueur si nécessaire
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_code = models.CharField(max_length=6, null=True, blank=True)
    two_factor_code_timestamp = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.username

        
