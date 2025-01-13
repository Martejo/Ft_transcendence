# game/views.py

import logging
from django.views import View
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect

from game.forms import GameParametersForm
from game.models import Game

logger = logging.getLogger(__name__)

@method_decorator(csrf_protect, name='dispatch')
class GameMenuView(View):

    def get(self, request):
        logger.debug("Handling GET request for GameMenuView")

        rendered_html = render_to_string('game/gameMenu.html')
        return JsonResponse({
            'status': 'success',
            'html': rendered_html
        })

    def post(self, request, *args, **kwargs):
        logger.debug("Handling POST request for GameMenuView")

        # 1) Récupérer le type de partie (par défaut, "local" si rien n'est fourni)
        game_type = request.POST.get('game_type', 'local')  

        # 2) Gérer un éventuel 2e joueur (user2) si "online"
        user2 = None
        if game_type == 'online':
            friend_id = request.POST.get('friend_id')
            if friend_id:
                from accounts.models import CustomUser
                try:
                    user2 = CustomUser.objects.get(pk=friend_id)
                except CustomUser.DoesNotExist:
                    logger.warning(f"Le joueur avec l'ID={friend_id} n'existe pas.")
                    user2 = None

        # 3) Construire le formulaire pour récupérer/valider les paramètres
        form = GameParametersForm(request.POST)
        if form.is_valid():
            parameters = form.save()  # Sauvegarde en DB, renvoie l'instance GameParameters

            # 4) Créer le Game avec ces paramètres, que le joueur ait changé ou pas
            game = Game.objects.create(
                user1=request.user,
                user2=user2,
                parameters=parameters,
                game_type=game_type
            )

            return JsonResponse({
                'status': 'success',
                'message': f'Partie {game_type} créée avec succès !',
                'game_id': game.id,
            })

        else:
            logger.error(f"Erreurs de validation du formulaire: {form.errors}")
            return JsonResponse({
                'status': 'error',
                'errors': form.errors,
            }, status=400)

    def http_method_not_allowed(self, request, *args, **kwargs):
        logger.warning(f"Méthode non autorisée : {request.method} pour GameMenuView")
        return JsonResponse({
            'status': 'error',
            'message': 'Méthode non autorisée'
        }, status=405)
