# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.views import View
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect

# ---- Configuration ----
logger = logging.getLogger(__name__)

@method_decorator(csrf_protect, name='dispatch')  # Applique la protection CSRF à toute la classe
class GameMenuView(View):
    """
    Class-Based View (CBV) pour gérer le menu du jeu.
    - GET : Retourne la page du menu du jeu sous forme de HTML encapsulé dans une réponse JSON.
    - Autres méthodes : Retourne une erreur 405 (Méthode non autorisée).
    """

    def get(self, request):
        """
        Gère une requête HTTP GET.
        Retourne le contenu HTML du menu du jeu.
        """
        logger.debug("Handling GET request for GameMenuView")
        game_personalization_form = GamePersonnalizationForm();
        # initialiser un form vide ici 
        # Envoyer un form pour personnalisation de jeu dans le cas d'une partie locale
        # Utiliser balises django dans le html 
        # recevoir le formulaire remplie dans un post et examiner les valeurs recue (les valeurs impossibles ne sont pas acceptees) avant d'enregistrer en db
        # rendered_html = render_to_string('game/gameMenu.html', form)  # Charge et rend le HTML
        rendered_html = render_to_string('game/gameMenu.html', {
            'game_personalization_form': game_personalization_form,
        })
        return JsonResponse({
            'status': 'success',
            'html': rendered_html
        })
    
    def post

    def http_method_not_allowed(self, request, *args, **kwargs):
        """
        Gère les méthodes HTTP non autorisées.
        Retourne une réponse JSON avec le statut 405.
        """
        logger.warning(f"Méthode non autorisée : {request.method} pour GameMenuView")
        return JsonResponse({
            'status': 'error',
            'message': 'Méthode non autorisée'
        }, status=405)
