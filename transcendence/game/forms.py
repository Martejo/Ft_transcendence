# game/forms.py

from django import forms
from game.models import GameParameters

class GameParametersForm(forms.ModelForm):
    """
    Formulaire permettant de personnaliser les paramètres de jeu.
    """
    class Meta:
        model = GameParameters
        fields = [
            'ball_speed',
            'racket_size',
            'bonus_obstacle',
            'bonus_speed',
            'bonus_shrink',
            'bonus_frost',
            'bonus_flash',
            'bonus_mind',
            'bonus_canon',
        ]

    def __init__(self, *args, **kwargs):
        """
        Personnalisation des labels et widgets des champs.
        """
        super().__init__(*args, **kwargs)
        self.fields['ball_speed'].label = "Vitesse de la balle"
        self.fields['ball_speed'].widget.attrs.update({
            'min': GameParameters.BALL_SPEED_MIN,
            'max': GameParameters.BALL_SPEED_MAX,
            'step': 0.1,
        })
        self.fields['racket_size'].label = "Taille de la raquette"
        self.fields['bonus_obstacle'].label = "Activer bonus obstacle"
        self.fields['bonus_speed'].label = "Activer bonus vitesse"
        self.fields['bonus_shrink'].label = "Activer bonus rétrécissement"
        self.fields['bonus_frost'].label = "Activer bonus gel"
        self.fields['bonus_flash'].label = "Activer bonus éclair"
        self.fields['bonus_mind'].label = "Activer bonus réflexion"
        self.fields['bonus_canon'].label = "Activer bonus canon"
