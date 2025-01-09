# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Max
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string

# ---- Imports locaux ----

# ---- Configuration ----
logger = logging.getLogger(__name__)
User = get_user_model()



@method_decorator([csrf_protect, login_required], name='dispatch')
class FriendProfileView(View):
    """
    Display the profile of a friend, including statistics and metadata.
    """

    def get(self, request, friend_username):
        logger.debug("Entering FriendProfileView.get()")
        logger.debug(f"Friend_username = {friend_username}")
        try:
            # Récupérer l'ami par son nom d'utilisateur
            friend = get_object_or_404(User, username=friend_username)
            logger.info(f"User found: {friend.username}")

            # Calcul des statistiques supplémentaires pour l'ami
            match_count = friend.match_histories.count() if hasattr(friend, 'match_histories') else 0
            victories = friend.match_histories.filter(result='win').count() if hasattr(friend, 'match_histories') else 0
            defeats = friend.match_histories.filter(result='loss').count() if hasattr(friend, 'match_histories') else 0
            best_score = (
                friend.games_as_player1.aggregate(Max('score_player1'))['score_player1__max']
                if hasattr(friend, 'games_as_player1')
                else 0
            )
            best_score = best_score or 0  # Valeur par défaut pour le meilleur score
            friends_count = friend.friends.count()

            logger.info(
                f"Statistics calculated: match_count={match_count}, victories={victories}, "
                f"defeats={defeats}, best_score={best_score}, friends_count={friends_count}"
            )

            # Préparer le contexte pour rendre le template
            default_avatar = '/media/avatars/default_avatar.png'
            context = {
                'friend': friend,
                'avatar_url': friend.avatar.url if friend.avatar else default_avatar,
                'match_count': match_count,
                'victories': victories,
                'defeats': defeats,
                'best_score': best_score,
                'friends_count': friends_count,
            }

            # Rendre le template en HTML
            rendered_html = render_to_string('accounts/friend_profile.html', context)

            return JsonResponse({
                'status': 'success',
                'html': rendered_html,
            }, status=200)

        except Exception as e:
            logger.error(f"Error loading friend profile: {e}")
            return JsonResponse({'status': 'error', 'message': 'Erreur lors du chargement du profil de l\'ami.'}, status=500)


