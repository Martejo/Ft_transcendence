# game/urls.py
from django.urls import path
from . import views
import logging
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

logger.debug("Rentre dans urls.py de app game")

app_name = 'game'

urlpatterns = [
    path('play/', views.play_view, name='play'),
    path('game_menu/', views.game_menu_view, name='game_menu'),
    path('invite_game/', views.invite_game_view, name='invite_game'),

]
