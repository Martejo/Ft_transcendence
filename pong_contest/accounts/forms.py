# accounts/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm
from users.models import CustomUser

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = CustomUser  # Utilisez le modèle personnalisé
        fields = ('username', 'email', 'password1', 'password2')
