from django.views import View
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.template.loader import render_to_string
from django.db.models import Max
import logging
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

@method_decorator(csrf_protect, name='dispatch')
class ProfileView(View):
    """
    Class-Based View (CBV) for displaying the user's profile.
    Returns both JSON data and rendered HTML.
    """
    def get(self, request):
        """
        Handle GET request to fetch and return the user's profile information.
        """
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
            best_score = best_score if best_score is not None else 0  # Ensure best_score is always defined
            friends_count = (
                user.profile.friends.count() if hasattr(user, 'profile') and hasattr(user.profile, 'friends') else 0
            )

            logger.info(
                f"Statistics calculated: match_count={match_count}, victories={victories}, "
                f"defeats={defeats}, best_score={best_score}, friends_count={friends_count}"
            )

            # Prepare data for rendering the HTML
            default_avatar = '/media/avatars/default_avatar.png'
        

            # Render HTML from template
            rendered_html = render_to_string('accounts/profile.html')

            # Prepare the response JSON
            response_data = {
                'username': user.username,
                'email': user.email,
                'avatar_url': user.profile.avatar.url if user.profile.avatar else default_avatar,
                'is_2fa_enabled': user.is_2fa_enabled,
                'match_count': match_count,
                'victories': victories,
                'defeats': defeats,
                'best_score': best_score,
                'friends_count': friends_count,
            }

            return JsonResponse({
                'status': 'success',
                'data': response_data,
                'html': rendered_html,  # Include rendered HTML
            }, status=200)

        except Exception as e:
            # Log the error and return a generic error message
            logger.error(f"Error loading user profile: {e}")
            return JsonResponse({'status': 'error', 'message': 'An error occurred while loading the profile.'}, status=500)
