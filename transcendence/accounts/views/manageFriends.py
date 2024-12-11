from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from .models import FriendRequest
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class BaseFriendView(View):
    """
    Base class for friend-related views, providing utility methods.
    """

    def validate_friend(self, user, friend_username):
        """
        Validates the friend username and returns the friend user instance.
        """
        if not friend_username:
            return JsonResponse({'status': 'error', 'message': 'Nom d\'utilisateur de l\'ami manquant'}, status=400)

        friend = get_object_or_404(User, username=friend_username)

        if friend == user:
            return JsonResponse({'status': 'error', 'message': 'Vous ne pouvez pas vous envoyer une demande d\'ami à vous-même.'}, status=400)

        return friend

    def create_json_response(self, status, message, status_code=200):
        """
        Utility method to create JSON responses.
        """
        return JsonResponse({'status': status, 'message': message}, status=status_code)


@method_decorator(login_required, name='dispatch')
class AddFriendView(BaseFriendView):
    """
    Handles sending friend requests.
    """

    def post(self, request):
        user = request.user
        friend_username = request.POST.get('friend_username')

        friend = self.validate_friend(user, friend_username)
        if isinstance(friend, JsonResponse):  # If validation failed, return the error response
            return friend

        if friend in user.friends.all():
            return self.create_json_response('error', 'Vous êtes déjà ami avec cet utilisateur.', 400)

        if FriendRequest.objects.filter(from_user=user, to_user=friend).exists():
            return self.create_json_response('error', 'Demande d\'ami déjà envoyée.', 400)

        if FriendRequest.objects.filter(from_user=friend, to_user=user).exists():
            return self.create_json_response('error', 'Cet utilisateur vous a déjà envoyé une demande d\'ami.', 400)

        FriendRequest.objects.create(from_user=user, to_user=friend)
        return self.create_json_response('success', 'Demande d\'ami envoyée.')


@method_decorator(login_required, name='dispatch')
class HandleFriendRequestView(View):
    """
    Handles acceptance or rejection of friend requests.
    """

    def post(self, request):
        user = request.user

        try:
            request_id = request.POST.get('request_id')
            action = request.POST.get('action')

            logger.debug(f"Handling friend request ID: {request_id} for user {user.username}")

            # Retrieve the friend request
            friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=user)

            if action == 'accept':
                # Add both users as friends
                user.friends.add(friend_request.from_user)
                friend_request.from_user.friends.add(user)

                # Delete the friend request
                friend_request.delete()
                return JsonResponse({'status': 'success', 'message': 'Demande d\'ami acceptée'})

            elif action == 'decline':
                # Delete the friend request
                friend_request.delete()
                return JsonResponse({'status': 'success', 'message': 'Demande d\'ami refusée'})

            else:
                return JsonResponse({'status': 'error', 'message': 'Action non valide'}, status=400)

        except Exception as e:
            logger.error(f"Error handling friend request: {e}")
            return JsonResponse({'status': 'error', 'message': 'Erreur lors de la gestion de la demande d\'ami'}, status=500)


@method_decorator(login_required, name='dispatch')
class RemoveFriendView(BaseFriendView):
    """
    Handles the removal of a friend.
    """

    def post(self, request):
        user = request.user
        friend_username = request.POST.get('friend_username')

        # Validate the friend's username
        friend = self.validate_friend(user, friend_username)
        if isinstance(friend, JsonResponse):  # If validation failed, return the error response
            return friend

        if friend not in user.friends.all():
            return self.create_json_response('error', 'Cet utilisateur n\'est pas dans votre liste d\'amis.', 400)

        # Remove the friend from both users' friend lists
        user.friends.remove(friend)
        friend.friends.remove(user)

        logger.info(f"Friendship removed between {user.username} and {friend.username}.")
        return self.create_json_response('success', 'Ami supprimé avec succès.')
