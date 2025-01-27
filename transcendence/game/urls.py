from django.urls import path

from .views.gameHome import GameHomeView
from .views.gameMenu import GameMenuView, CreateGameLocalView
from .views.gameLoading import LoadingView
from .views.gameSelectTournament import SelectTournamentView
from .views.gameInvitation import InviteGameView
from .views.gameInvitation import SendInvitationView, CancelInvitationView, RespondToInvitationView, ListInvitationsView, AcceptGameInvitationView

import logging


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

logger.debug("Rentre dans urls.py de l'app game")

app_name = 'game'

urlpatterns = [
    path('home/', GameHomeView.as_view(), name='home'),  # Mise à jour pour CBV
    path('menu/', GameMenuView.as_view(), name='game_menu'),  # Mise à jour pour CBV
    path('loading/', LoadingView.as_view(), name='loading'),  # Mise à jour pour CBV
    path('select_tournament/', SelectTournamentView.as_view(), name='select_tournament'),  # Mise à jour pour CBV
    path('invite_game/', InviteGameView.as_view(), name='invite_game'),  # Vue fonctionnelle
    # path('invite_tournament/', invite_tournament_view, name='invite_tournament'),  # Vue fonctionnelle
    path('send_invitation/', SendInvitationView.as_view(), name='send_invitation'),
    path('cancel_invitation/', CancelInvitationView.as_view(), name='cancel_invitation'),  # Vue fonctionnelle
    path('respond_to_invitation/', RespondToInvitationView.as_view(), name='respond_to_invitation'),
    path('create_local_game/', CreateGameLocalView.as_view(), name='create_local_game'),
    path('accept_invitation/<int:invitation_id>/', AcceptGameInvitationView.as_view(), name='accept_invitation'),
    path('respond_to_invitation/', RespondToInvitationView.as_view(), name='respond_to_invitation'),
    path('list_invitations/', ListInvitationsView.as_view(), name='list_invitations'),



]
