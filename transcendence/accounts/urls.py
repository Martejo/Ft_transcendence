# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.urls import path

# ---- Imports locaux ----
from .views.register import RegisterView
from .views.manageProfile import (
    ManageProfileView, UpdateProfileView, DeleteAccountView,
    ChangePasswordView, UpdateAvatarView
)
from .views.profile import ProfileView
from .views.logout import LogoutView
from .views.burgerMenu import BurgerMenuView, UpdateStatusView
from .views.friendProfile import FriendProfileView
from .views.login import LoginView
from .views.manageFriends import AddFriendView, HandleFriendRequestView, RemoveFriendView
from .views.login2fa import Enable2FAView, Check2FAView, Login2faView, Disable2FAView
from .views.tokenManagement import RefreshJwtView

# ---- Configuration ----
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)
logger.debug("Rentre dans urls.py de app accounts")

# ---- Application namespace ----
app_name = 'accounts'

# ---- URL patterns ----
urlpatterns = [
    # ---- Manage Profile ----
    path('profile/', ManageProfileView.as_view(), name='manage_profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update_profile'),
    path('profile/delete/', DeleteAccountView.as_view(), name='delete_account'),
    path('profile/change_password/', ChangePasswordView.as_view(), name='change_password'),
    path('profile/update_avatar/', UpdateAvatarView.as_view(), name='update_avatar'),

    # ---- Manage 2FA ----
    path('2fa/enable/', Enable2FAView.as_view(), name='enable_2fa'),
    path('2fa/check/', Check2FAView.as_view(), name='check_2fa'),
    path('2fa/login2fa/', Login2faView.as_view(), name='login_2fa'),
    path('2fa/disable/', Disable2FAView.as_view(), name='disable_2fa'),

    # ---- Manage Friends ----
    path('friends/add/', AddFriendView.as_view(), name='add_friend'),
    path('friends/handle-request/', HandleFriendRequestView.as_view(), name='handle_friend_request'),
    path('friends/remove/', RemoveFriendView.as_view(), name='remove_friend'),

    # ---- Burger Menu ----
    path('burgerMenu/', BurgerMenuView.as_view(), name='burgerMenu'),
    path('burger-menu/update-status/', UpdateStatusView.as_view(), name='update_status'),

    # ---- Friend Profile ----
    path('friend/<str:friend_username>/', FriendProfileView.as_view(), name='friend_profile'),

    # ---- Login ----
    path('login/', LoginView.as_view(), name='login'),
    path('submit_login/', LoginView.as_view(), name='submit_login'),

    # ---- Logout ----
    path('logout/', LogoutView.as_view(), name='logout'),

    # ---- Register ----
    path('register/', RegisterView.as_view(), name='register'),
    path('submit_register/', RegisterView.as_view(), name='submit_register'),

    # ---- User Profile ----
    #path('profile/', ProfileView.as_view(), name='user_profile'),

    # ---- Token Management ---- #
    path('refreshJwt/', RefreshJwtView.as_view(), name='refresh_jwt'),


    # ---- Token Authentication (commented for now) ----
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
