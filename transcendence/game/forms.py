# game/forms.py

from django import forms
from game.models import GameParameters, GameInvitationParameters

class GameParametersForm(forms.ModelForm):
    class Meta:
        model = GameParameters
        fields = ['ball_speed', 'racket_size', 'bonus_malus_activation', 'bumpers_activation']
        widgets = {
            'ball_speed': forms.Select(attrs={'class': 'form-control'}),
            'racket_size': forms.Select(attrs={'class': 'form-control'}),
            'bonus_malus_activation': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'bumpers_activation': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
        labels = {
            'ball_speed': 'Vitesse de la balle',
            'racket_size': 'Taille de la raquette',
            'bonus_malus_activation': 'Activer les bonus/malus',
            'bumpers_activation': 'Activer les bumpers/obstacles',
        }

class SendInvitationForm(forms.ModelForm):
    """
    Formulaire pour envoyer une invitation et stocker
    les paramètres dans GameInvitationParameters.
    """
    friend_username = forms.CharField(
        required=True,
        label="Nom d'utilisateur de l'ami à inviter"
    )

    class Meta:
        model = GameInvitationParameters
        fields = [
            'ball_speed', 
            'racket_size',
            'bonus_malus_activation',
            'bumpers_activation'
        ]