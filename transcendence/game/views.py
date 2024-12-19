from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse  # Vérifier que HttpResponse est bien importé
from django.contrib import messages
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_POST
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging
from .models import GameInvitation
from accounts.models import CustomUser
from django.contrib.auth.decorators import login_required

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

def play_view(request):
    if request.method == 'GET':
        return render(request, 'game/play.html')
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

def game_menu_view(request):
    if request.method == 'GET':
        return render(request, 'game/game_menu.html')
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

def remote_menu_view(request):
    if request.method == 'GET':
        return render(request, 'game/remote_menu.html')
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)


def loading_view(request):
    if request.method == 'GET':
        return render(request, 'game/loading.html')
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)


def select_tournament_view(request):
    if request.method == 'GET':
        return render(request, 'game/select_tournament.html')
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def invite_tournament_view(request):
    if request.method == 'GET':
        try:
            user = request.user
            default_avatar = '/media/avatars/default_avatar.png'
            friends = [
                {
                    'username': friend.username,
                    'avatar_url': friend.profile.avatar.url if hasattr(friend, 'profile') and friend.profile.avatar else default_avatar,
                    'status': 'online' if hasattr(friend, 'profile') and friend.profile.is_online else 'offline'
                }
                for friend in user.profile.friends.all()
            ]

            # Construction des données de la réponse
            return render(request, 'game/invite_tournament.html', {'friends':friends})
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données de invite game: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def invite_game_view(request):
    if request.method == 'GET':
        try:
            user = request.user
            default_avatar = '/media/avatars/default_avatar.png'
            friends = [
                {
                    'username': friend.username,
                    'avatar_url': friend.profile.avatar.url if hasattr(friend, 'profile') and friend.profile.avatar else default_avatar,
                    'status': 'online' if hasattr(friend, 'profile') and friend.profile.is_online else 'offline'
                }
                for friend in user.profile.friends.all()
            ]

            # Construction des données de la réponse
            return render(request, 'game/invite_game.html', {'friends':friends})
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données de invite game: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def send_invitation_view(request):
    if request.method == 'POST':
        friend_username = request.POST.get('friend_username')
        try:
            friend = CustomUser.objects.get(username=friend_username)
            # Ici, vous pouvez créer un modèle d'invitation et l'enregistrer
            # Par exemple : Invitation.objects.create(from_user=request.user, to_user=friend)
            return JsonResponse({'status': 'success', 'message': f'Invitation envoyée à {friend_username}.'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Utilisateur introuvable.'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Requête non autorisée.'}, status=400)

def accept_invitation_view(request):
    if request.method == 'POST':
        invitation_id = request.POST.get('invitation_id')
        try:
            # Récupérer l'invitation spécifique
            invitation = GameInvitation.objects.get(id=invitation_id, to_user=request.user, status='pending')

            # Accepter l'invitation
            invitation.status = 'accepted'
            invitation.save()

            # Rechercher et bloquer toutes les autres invitations en attente pour ce joueur
            # Invitations envoyées par l'utilisateur vers d'autres joueurs ou reçues par lui
            # Bloquer toutes les invitations en attente reçues par l'utilisateur qui accepte
            GameInvitation.objects.filter(
                to_user=request.user,
                status='pending'
            ).exclude(id=invitation.id).delete()

            # Bloquer toutes les invitations en attente envoyées par l'utilisateur qui accepte
            GameInvitation.objects.filter(
                from_user=request.user,
                status='pending'
            ).exclude(id=invitation.id).delete()

            return JsonResponse({'status': 'success', 'message': 'Invitation acceptée et autres invitations bloquées.'})
        except GameInvitation.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invitation non trouvée.'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Requête non autorisée.'}, status=400)

@csrf_exempt
def cancel_invitation_view(request):
    if request.method == 'POST':
        friend_username = request.POST.get('friend_username')
        try:
            friend = CustomUser.objects.get(username=friend_username)
            # Ici, vous pouvez supprimer l'invitation correspondante
            # Par exemple : Invitation.objects.filter(from_user=request.user, to_user=friend).delete()
            return JsonResponse({'status': 'success', 'message': f'Invitation annulée à {friend_username}.'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Utilisateur introuvable.'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Requête non autorisée.'}, status=400)
