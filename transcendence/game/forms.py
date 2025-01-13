# game/forms.py

from django import forms
from game.models import GameParameters

class GameParametersForm(forms.ModelForm):
    """
    Formulaire permettant de personnaliser les paramètres de jeu.
    """
    class Meta:
        model = GameParameters
        fields = ['ball_speed', 'racket_size', 'bonus_malus_activation', 'bumpers_activation']
    
    # Optionnel : personnaliser les labels ou widgets
    # def __init__(self, *args, **kwargs):
    #     super().__init__(*args, **kwargs)
    #     self.fields['ball_speed'].label = "Vitesse de la Balle"
    #     self.fields['racket_size'].label = "Taille de la Raquette"
    #     self.fields['bonus_malus_activation'].label = "Activer Bonus/Malus"
    #     self.fields['bumpers_activation'].label = "Activer Obstacle (Bumpers)"



