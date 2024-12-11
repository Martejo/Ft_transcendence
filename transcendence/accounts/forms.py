# accounts/forms.py

from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import UserCreationForm  # Gère la création d'un utilisateur
from django.contrib.auth.forms import PasswordChangeForm as DjangoPasswordChangeForm

User = get_user_model()

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

class LoginForm(forms.Form):
    username = forms.CharField(max_length=150, label="Nom d'utilisateur")
    password = forms.CharField(widget=forms.PasswordInput, label='Mot de passe')

class TwoFactorLoginForm(forms.Form):
    code = forms.CharField(max_length=6, min_length=6, label='Code 2FA')

    def clean_code(self):
        code = self.cleaned_data['code']
        if not code.isdigit():
            raise forms.ValidationError("Le code doit contenir uniquement des chiffres")
        return code

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'avatar', 'bio']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': "Nom d'utilisateur"}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'bio': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Bio'}),
            'avatar': forms.ClearableFileInput(attrs={'class': 'form-control-file'}),
        }

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.exclude(id=self.instance.id).filter(username=username).exists():
            raise forms.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.exclude(id=self.instance.id).filter(email=email).exists():
            raise forms.ValidationError("Cet email est déjà utilisé.")
        return email

    def clean_avatar(self):
        avatar = self.cleaned_data.get('avatar')
        if avatar:
            if avatar.size > 4 * 1024 * 1024:
                raise forms.ValidationError("L'image ne doit pas dépasser 4 Mo.")
            if avatar.content_type not in ["image/jpeg", "image/png", "image/gif"]:
                raise forms.ValidationError("Seules les images JPEG, PNG et GIF sont autorisées.")
        return avatar

class PasswordChangeForm(DjangoPasswordChangeForm):
    class Meta:
        model = User
        fields = ['old_password', 'new_password1', 'new_password2']

class AvatarUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['avatar']
        widgets = {
            'avatar': forms.ClearableFileInput(attrs={'class': 'form-control-file'}),
        }

    def clean_avatar(self):
        avatar = self.cleaned_data.get('avatar', False)
        if avatar:
            if avatar.size > 4 * 1024 * 1024:
                raise forms.ValidationError("L'image ne doit pas dépasser 4 Mo.")
            if avatar.content_type not in ["image/jpeg", "image/png", "image/gif"]:
                raise forms.ValidationError("Seules les images JPEG, PNG et GIF sont autorisées.")
        return avatar