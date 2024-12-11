from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Max
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

@method_decorator([csrf_protect, login_required], name='dispatch')
class FriendProfileView(View):
    """
    Display the profile of a friend, including statistics and metadata.
    """

    def get(self, request, friend_username):
        logger.debug("Entering FriendProfileView.get()")
        logger.debug(f"Friend_username = {friend_username}")
        try:
            # Retrieve the friend by username
            friend = get_object_or_404(CustomUser, username=friend_username)
            logger.info(f"Friend found: {friend.username}")

            # Calculate statistics
            match_count = friend.match_histories.count() if hasattr(friend, 'match_histories') else 0
            victories = friend.match_histories.filter(result='win').count() if hasattr(friend, 'match_histories') else 0
            defeats = friend.match_histories.filter(result='loss').count() if hasattr(friend, 'match_histories') else 0
            best_score = (
                friend.games_as_player1.aggregate(Max('score_player1'))['score_player1__max']
                if hasattr(friend, 'games_as_player1')
                else 0
            )
            best_score = best_score if best_score is not None else 0  # Ensure best_score is always defined

            friends_count = (
                friend.profile.friends.count() if hasattr(friend, 'profile') and hasattr(friend.profile, 'friends') else 0
            )

            logger.info(
                f"Statistics calculated: match_count={match_count}, victories={victories}, "
                f"defeats={defeats}, best_score={best_score}, friends_count={friends_count}"
            )

            # Prepare response data
            default_avatar = '/media/avatars/default_avatar.png'
            response_data = {
                'username': friend.username,
                'avatar_url': friend.profile.avatar.url if friend.profile.avatar else default_avatar,
                'match_count': match_count,
                'victories': victories,
                'defeats': defeats,
                'best_score': best_score,
                'friends_count': friends_count,
            }

            return JsonResponse({'status': 'success', 'data': response_data})

        except Exception as e:
            logger.error(f"Error loading friend profile: {e}")
            return JsonResponse({'status': 'error', 'message': 'Erreur lors du chargement du profil de l\'ami.'}, status=500)
