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
            return render(request, 'game/invite_game.html', {'friends':friends})
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
            return render(request, 'game/invite_tournament.html', {'friends':friends})
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des données de invite game: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)