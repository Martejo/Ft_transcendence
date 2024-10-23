from django.db import models


# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=256)  # Ajustez la longueur si nécessaire

    def __str__(self):
        return self.username

        
