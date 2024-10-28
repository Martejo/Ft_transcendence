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
        model = UserProfile
        fields = ['avatar', 'bio']

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