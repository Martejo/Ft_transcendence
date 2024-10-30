# User/forms.py
from django import forms
from .models import User, UserProfile
from django.core.exceptions import ValidationError

class RegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, label='Mot de passe')
    confirm_password = forms.CharField(widget=forms.PasswordInput, label='Confirmer le mot de passe')
    
    class Meta:
        model = User
        fields = ['username', 'email']
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")
        
        if password != confirm_password:
            raise ValidationError("Les mots de passe ne correspondent pas.")
        
        return cleaned_data

class LoginForm(forms.Form):
    username = forms.CharField(max_length=150, label='Nom d\'utilisateur')
    password = forms.CharField(widget=forms.PasswordInput, label='Mot de passe')

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nom d\'utilisateur'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
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


# User/forms.py

class PasswordChangeForm(forms.Form):
    old_password = forms.CharField(
        label="Ancien Mot de Passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Ancien Mot de Passe'}),
        required=True
    )
    new_password = forms.CharField(
        label="Nouveau Mot de Passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Nouveau Mot de Passe'}),
        required=True
    )
    confirm_new_password = forms.CharField(
        label="Confirmer le Nouveau Mot de Passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirmer le Nouveau Mot de Passe'}),
        required=True
    )

    def clean(self):
        cleaned_data = super().clean()
        new_password = cleaned_data.get("new_password")
        confirm_new_password = cleaned_data.get("confirm_new_password")

        if new_password and confirm_new_password and new_password != confirm_new_password:
            self.add_error('confirm_new_password', "Les mots de passe ne correspondent pas.")

        return cleaned_data


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
            if not avatar.content_type in ["image/jpeg", "image/png", "image/gif"]:
                raise forms.ValidationError("Seules les images JPEG, PNG et GIF sont autorisées.")
        return avatar