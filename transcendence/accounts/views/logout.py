from django.views import View
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
import logging
from django.contrib.auth import logout

logger = logging.getLogger(__name__)

@method_decorator(csrf_protect, name='dispatch')  # Applique la protection CSRF à toutes les méthodes de la classe
@method_decorator(login_required, name='dispatch')  # Restreint l'accès à la vue aux utilisateurs connectés
class LogoutView(View):
    """
    Class-Based View (CBV) pour gérer la déconnexion utilisateur.
    - POST : Déconnecte l'utilisateur en mettant à jour son état et en supprimant sa session.
    """

    def post(self, request):
        """
        Gère une requête HTTP POST.
        Déconnecte l'utilisateur, met à jour son état et supprime les données de session.
        """
        logger.debug("Processing logout request")
        
        user = request.user
        user.is_online = False
        user.save()
        logout(request)
        return JsonResponse({'status': 'success', 'message': 'Déconnexion réussie.'})
