# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.views import View
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from game.models import GameInvitation
from accounts.models import CustomUser
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404

# ---- Configuration ----
logger = logging.getLogger(__name__)
@method_decorator(csrf_protect, name='dispatch')  # Applique la protection CSRF à toute la classe
class InviteGameView(View):
    
    def get(self, request):
        logger.debug("Handling GET request for InviteGameView")

        # Récupérer les amis de l'utilisateur
        user = request.user
        friends = user.friends.all()

        if not friends.exists():  # Si l'utilisateur n'a pas d'amis
            logger.info(f"{user.username} n'a pas d'amis à inviter.")
            return JsonResponse({
                'status': 'error',
                'message': "Vous n'avez pas encore ajouté d'amis. Ajoutez des amis pour les inviter à jouer."
            })

         # Préparer la liste des amis pour le template
        rendered_html = render_to_string('game/invite_game.html', {'friends': friends})
        return JsonResponse({
            'status': 'success',
            'html': rendered_html,
        }, status=200)
    

@method_decorator(login_required, name='dispatch')
class SendInvitationView(View):
    """
    Handles sending game invitations.
    """

    def post(self, request):
        user = request.user
        friend_username = request.POST.get('friend_username')

        # Validate the target user
        try:
            friend = self.validate_friend(user, friend_username)
        except ValueError as e:
            return self.create_json_response('error', str(e), 400)

        # Check if an invitation already exists
        if GameInvitation.objects.filter(from_user=user, to_user=friend, status='pending').exists():
            return self.create_json_response('error', 'Une invitation est déjà en attente.', 400)

        # Create a new game invitation
        GameInvitation.objects.create(from_user=user, to_user=friend)
        logger.info(f"Invitation de jeu envoyée de {user.username} à {friend.username}.")
        return self.create_json_response('success', 'Invitation envoyée avec succès.')

    def validate_friend(self, user, friend_username):
        """
        Validates the friend username and ensures the user can send an invitation.
        """
        if not friend_username:
            logger.error("Nom d'utilisateur cible manquant.")
            raise ValueError('Nom d\'utilisateur cible manquant.')

        try:
            friend = CustomUser.objects.get(username=friend_username)
        except CustomUser.DoesNotExist:
            logger.error(f"Utilisateur {friend_username} introuvable.")
            raise ValueError('Utilisateur introuvable.')

        if friend == user:
            logger.error("Un utilisateur ne peut pas s'inviter lui-même.")
            raise ValueError('Vous ne pouvez pas vous inviter vous-même.')

        return friend

    def create_json_response(self, status, message, http_status=200):
        """
        Helper function to create consistent JSON responses.
        """
        return JsonResponse({'status': status, 'message': message}, status=http_status)

@method_decorator(login_required, name='dispatch')
class CancelInvitationView(View):
    def post(self, request):
        to_user_id = request.POST.get('to_user_id')
        if not to_user_id:
            return JsonResponse({'status': 'error', 'message': 'Utilisateur cible manquant.'}, status=400)
        
        invitation = GameInvitation.objects.filter(from_user=request.user, to_user_id=to_user_id, status='pending').first()
        if not invitation:
            return JsonResponse({'status': 'error', 'message': 'Aucune invitation en attente à annuler.'}, status=404)
        
        invitation.delete()
        return JsonResponse({'status': 'success', 'message': 'Invitation annulée.'})

@method_decorator(login_required, name='dispatch')
class RespondToInvitationView(View):
    def post(self, request):
        invitation_id = request.POST.get('invitation_id')
        response = request.POST.get('response')  # 'accepted' ou 'rejected'
        
        if not invitation_id or response not in ['accepted', 'rejected']:
            return JsonResponse({'status': 'error', 'message': 'Données invalides.'}, status=400)
        
        invitation = get_object_or_404(GameInvitation, id=invitation_id, to_user=request.user, status='pending')
        
        invitation.status = response
        invitation.save()
        
        return JsonResponse({'status': 'success', 'message': f'Invitation {response}.'})

@method_decorator(login_required, name='dispatch')
class ListInvitationsView(View):
    def get(self, request):
        sent_invitations = GameInvitation.objects.filter(from_user=request.user).values(
            'id', 'to_user__username', 'status', 'created_at'
        )
        received_invitations = GameInvitation.objects.filter(to_user=request.user).values(
            'id', 'from_user__username', 'status', 'created_at'
        )
        
        return JsonResponse({
            'status': 'success',
            'data': {
                'sent_invitations': list(sent_invitations),
                'received_invitations': list(received_invitations)
            }
        })
