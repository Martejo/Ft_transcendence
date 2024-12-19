from django.urls import path
from . import views

app_name = 'realgame'

urlpatterns = [
    path('game/<str:game_id>/', views.game_view, name = 'game'),
    path('api/game/create/', views.create_game, name='create_game'),
    path('api/game/<str:game_id>/join/', views.join_game, name='join_game'),
]