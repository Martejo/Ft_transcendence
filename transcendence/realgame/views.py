from django.shortcuts import render
from django.http import JsonResponse
import uuid

def game_view(request, game_id):
    return render(request, 'realgame/game.html', {
        'game_id': game_id
    })

def create_game(request):
    """Create a new game session"""
    game_id = str(uuid.uuid4())
    return JsonResponse({
        'game_id': game_id,
        'status': 'created'
    })

def join_game(request, game_id):
    """Join an existing game"""
    return JsonResponse({
        'game_id': game_id,
        'status': 'joined'
    })