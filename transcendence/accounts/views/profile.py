# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.views import View
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.template.loader import render_to_string
from django.db.models import Max
from django.contrib.auth import get_user_model

# ---- Configuration ----
logger = logging.getLogger(__name__)
User = get_user_model()


from django.shortcuts import render

@method_decorator(csrf_protect, name='dispatch')
class ProfileView(View):
    """
    Class-Based View (CBV) for displaying the user's profile.
    Returns both JSON data and rendered HTML.
    """
    def get(self, request):
        logger.debug("Entering ProfileView.get()")
        try:
            user = request.user  # Retrieve user directly from JWT token
            logger.info(f"User found: {user.username}")

            # Calculate additional user statistics
            match_count = user.match_histories.count() if hasattr(user, 'match_histories') else 0
            victories = user.match_histories.filter(result='win').count() if hasattr(user, 'match_histories') else 0
            defeats = user.match_histories.filter(result='loss').count() if hasattr(user, 'match_histories') else 0
            best_score = (
                user.games_as_player1.aggregate(Max('score_player1'))['score_player1__max']
                if hasattr(user, 'games_as_player1')
                else 0
            )
            best_score = best_score or 0
            friends_count = user.friends.count()

            logger.info(
                f"Statistics calculated: match_count={match_count}, victories={victories}, "
                f"defeats={defeats}, best_score={best_score}, friends_count={friends_count}"
            )

            context = {
                'user': user,
                'match_count': match_count,
                'victories': victories,
                'defeats': defeats,
                'best_score': best_score,
                'friends_count': friends_count,
            }

            rendered_html = render_to_string('accounts/profile.html', context)

            return JsonResponse({
                'status': 'success',
                'html': rendered_html,
            }, status=200)

        except Exception as e:
            logger.error(f"Error loading user profile: {e}")
            return JsonResponse({'status': 'error', 'message': 'An error occurred while loading the profile.'}, status=500)
