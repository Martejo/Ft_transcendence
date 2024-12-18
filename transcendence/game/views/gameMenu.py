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
        rendered_html = render_to_string('game/gameMenu.html')  # Charge et rend le HTML
        return JsonResponse({
            'status': 'success',
            'html': rendered_html
        })

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
