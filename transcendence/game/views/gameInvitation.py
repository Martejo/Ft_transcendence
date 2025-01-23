# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.views import View
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.utils.timezone import now

# ---- Imports internes ----
from game.models import GameInvitation, GameSession
from game.models import GameParameters  # si besoin explicite
from accounts.models import CustomUser
from game.forms import SendInvitationForm

logger = logging.getLogger(__name__)

# --------- InviteGameView et SendInvitationView inchangés, sauf si tu veux y faire des retouches ---------

@method_decorator(csrf_protect, name='dispatch')
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
        rendered_html = render_to_string('game/invite_game.html', {'friends': friends}, request=request)
        return JsonResponse({'status': 'success', 'html': rendered_html}, status=200)

    def clean_expired_invitations():
        expired_invitations = GameInvitation.objects.filter(status='pending', expires_at__lt=now())
        expired_invitations.update(status='expired')
        logger.info(f"Nettoyage des invitations expirées: {expired_invitations.count()} invitations marquées comme expirées.")


@method_decorator(login_required, name='dispatch')
class SendInvitationView(View):
    """
    Handles sending game invitations + game params en ligne.
    """
    def post(self, request):
        form = SendInvitationForm(request.POST)
        if not form.is_valid():
            logger.warning("Formulaire d'invitation invalide: %s", form.errors)
            return JsonResponse({
                'status': 'error',
                'errors': form.errors,
                'message': "Les paramètres de l'invitation sont invalides."
            }, status=400)

        user = request.user
        friend_username = form.cleaned_data['friend_username']

        # 1) Vérifier que l'ami existe et n'est pas l'utilisateur lui-même
        try:
            friend = self.validate_friend(user, friend_username)
        except ValueError as e:
            return self.create_json_response('error', str(e), 400)

        # 2) Vérifier s'il y a déjà une invitation en attente
        existing_invitation = GameInvitation.objects.filter(
            from_user=user, to_user=friend, status='pending'
        ).first()
        if existing_invitation:
            if existing_invitation.is_expired():
                # On la marque comme expirée
                existing_invitation.status = 'expired'
                existing_invitation.save()
            else:
                return self.create_json_response('error', 'Une invitation est déjà en attente pour ce joueur.', 400)

        # 3) Créer la nouvelle invitation
        invitation = GameInvitation.objects.create(from_user=user, to_user=friend)
        invitation_id = invitation.id

        # 4) Créer l’objet de paramètres associé
        invitation_params = form.save(commit=False)
        invitation_params.invitation = invitation
        invitation_params.save()

        # 5) Réponse
        logger.info(f"Invitation {invitation_id} créée avec paramètres pour {friend_username}.")
        return self.create_json_response('success', 'Invitation envoyée avec succès.', 201)

    def validate_friend(self, user, friend_username):
        """
        Vérifie que friend_username désigne un ami valide.
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
        return JsonResponse({'status': status, 'message': message}, status=http_status)


@method_decorator(login_required, name='dispatch')
class CancelInvitationView(View):
    """
    Handles the cancellation of game invitations.
    """

    def post(self, request):
        user = request.user
        friend_username = request.POST.get('friend_username')

        if not friend_username:
            return JsonResponse({'status': 'error', 'message': 'Nom d\'utilisateur cible manquant.'}, status=400)

        try:
            friend = CustomUser.objects.get(username=friend_username)
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Utilisateur cible introuvable.'}, status=404)

        invitation = GameInvitation.objects.filter(from_user=user, to_user=friend, status='pending').first()
        if not invitation:
            return JsonResponse({'status': 'error', 'message': 'Aucune invitation en attente à annuler.'}, status=404)

        # Supprimer l'invitation
        invitation.delete()
        return JsonResponse({'status': 'success', 'message': 'Invitation annulée avec succès.'})

# -----------------------------------------------------------------------------
#                GESTION DES INVITATIONS BURGER MENU
# -----------------------------------------------------------------------------

@method_decorator(login_required, name='dispatch')
class RespondToInvitationView(View):
    """
    Gère les autres actions sur une invitation (ici, on ne fait plus l'acceptation).
    On autorise "decline", éventuellement d'autres actions, mais pas "accept".
    """
    def post(self, request):
        invitation_id = request.POST.get('invitation_id')
        action = request.POST.get('action')

        if not invitation_id or not action:
            return JsonResponse({'status': 'error', 'message': 'Données manquantes.'}, status=400)

        # Récupérer l'invitation destinée à l'utilisateur
        invitation = get_object_or_404(GameInvitation, id=invitation_id, to_user=request.user)

        try:
            if action == 'decline':
                invitation.status = 'rejected'
                invitation.save()
                return JsonResponse({'status': 'success', 'message': 'Invitation refusée.'})

            else:
                # Si l'action est "accept" => on lève une erreur ou un message explicite
                # car on veut forcer le front à appeler AcceptGameInvitationView
                return JsonResponse({
                    'status': 'error',
                    'message': 'Action non valide. Utilisez /accept_invitation/<id>/ pour accepter.'
                }, status=400)

        except Exception as e:
            logger.exception("Erreur lors de la mise à jour de l'invitation")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@method_decorator([csrf_protect, login_required], name='dispatch')
class AcceptGameInvitationView(View):
    """
    Handles the acceptance of a game invitation and starts a game session.
    URL attendu : /game/accept_invitation/<invitation_id>/
    """
    def post(self, request, invitation_id):
        user = request.user

        invitation = get_object_or_404(GameInvitation, id=invitation_id, to_user=user, status='pending')

        try:
            with transaction.atomic():
                # Marquer l'invitation comme acceptée
                invitation.status = 'accepted'
                invitation.save()

                # Supprimer les autres invitations
                # (c'est ta logique si tu veux pas d'autres invites en parallèle, à toi de choisir)
                # ex: GameInvitation.objects.filter(
                #       Q(from_user=invitation.from_user) | Q(to_user=invitation.to_user)
                #     ).exclude(id=invitation.id).delete()

                # Créer la session de jeu
                session = GameSession.objects.create(
                    player_left=invitation.from_user.username,
                    player_right=user.username,
                    created_at=now(),
                    status="running"
                )

                # Récupérer les paramètres
                invitation_params = getattr(invitation, 'parameters', None)
                if invitation_params:
                    from game.models import GameParameters
                    GameParameters.objects.create(
                        game_session=session,
                        ball_speed=invitation_params.ball_speed,
                        racket_size=invitation_params.racket_size,
                        bonus_malus_activation=invitation_params.bonus_malus_activation,
                        bumpers_activation=invitation_params.bumpers_activation
                    )
                else:
                    logger.warning(f"Invitation {invitation_id} acceptée mais aucun paramètre n'a été trouvé.")

        except Exception as e:
            logger.exception("Erreur lors de l'acceptation de l'invitation")
            return JsonResponse({
                'status': 'error',
                'message': f'Une erreur est survenue : {str(e)}'
            }, status=500)

        # Réponse : session créée
        return JsonResponse({
            'status': 'success',
            'message': 'Invitation acceptée. Session de jeu créée.',
            'session': {
                'id': str(session.id),
                'player_left': session.player_left,
                'player_right': session.player_right,
                'created_at': session.created_at,
                'status': session.status,
            },
        })


@method_decorator(login_required, name='dispatch')
class ListInvitationsView(View):
    """
    Liste les invitations envoyées et reçues par l'utilisateur
    """
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


class GetGameSessionView(View):
    def get(self, request, session_id):
        # Récupérer la session
        session = get_object_or_404(GameSession, id=session_id)
        # Récupérer les paramètres
        params = session.parameters  # OneToOne -> GameParameters
        
        return JsonResponse({
            'status': 'success',
            'session': {
                'id': str(session.id),
                'status': session.status,
                'player_left': session.player_left,
                'player_right': session.player_right,
                'created_at': session.created_at.isoformat()
            },
            'parameters': {
                'ball_speed': params.ball_speed,
                'racket_size': params.racket_size,
                'bonus_malus_activation': params.bonus_malus_activation,
                'bumpers_activation': params.bumpers_activation,
            }
        })
