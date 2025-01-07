# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model

# ---- Imports locaux ----
from accounts.models import FriendRequest

# ---- Configuration ----
logger = logging.getLogger(__name__)
User = get_user_model()


class BurgerMenuView(View):
    """
    Handle retrieval of user data for the burger menu.
    """

    @method_decorator(login_required)
    def get(self, request):
        """
        Fetch user data, friends list, and friend requests for the burger menu.
        """
        user = request.user  # Retrieve the user from the JWT
        #[IMPROVE] Utilite de refresh_from_db() ?
        user.refresh_from_db()  # Refresh the user profile from the database
        try:
            default_avatar = '/media/avatars/default_avatar.png'

            # Build the friends list
            friends = [
                {
                    'username': friend.username,
                    'avatar_url': friend.avatar.url if friend.avatar else default_avatar,
                    'status': 'online' if friend.is_online else 'offline'
                }
                for friend in user.friends.all()
            ]

            # Build the friend requests list
            friend_requests = [
                {
                    'id': friend_request.id,
                    'from_user': friend_request.from_user.username,
                    'avatar_url': friend_request.from_user.avatar.url if friend_request.from_user.avatar else default_avatar
                }
                for friend_request in FriendRequest.objects.filter(to_user=user)
            ]

            # Build the response data
            response_data = {
                'username': user.username,
                'avatar_url': user.avatar.url if user.avatar else default_avatar,
                'is_online': user.is_online,
                'friends': friends,
                'friend_requests': friend_requests,
            }

            return JsonResponse({'status': 'success', 'data': response_data})
            # [IMPROVE] A quoi servent ces lignes ?
            # response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            # response['Pragma'] = 'no-cache'
            

        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données du menu burger: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@method_decorator([csrf_protect, login_required], name='dispatch')
class UpdateStatusView(View):
    """
    Handle updating the user's online/offline status.
    """

    def post(self, request):
        """
        Update the user's online/offline status.
        """
        user = request.user
        status = request.POST.get('status')

        if status not in ['online', 'offline']:
            return JsonResponse({'status': 'error', 'message': 'Statut non valide'}, status=400)

        # Update the user's status
        user.is_online = (status == 'online')
        user.save()

        logger.info(f"Statut mis à jour pour {user.username}: {user.is_online}")
        return JsonResponse({'status': 'success', 'message': 'Statut mis à jour avec succès', 'is_online': user.is_online})
