# accounts/urls.py
from django.urls import path
from . import views
import logging
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

logger.debug("Rentre dans urls.py de app accounts")

app_name = 'accounts'

urlpatterns = [
    path('login/', views.login_view, name='login'),  # Vue pour rendre le formulaire de connexion
    path('submit_login/', views.submit_login, name='submit_login'),  # Vue pour traiter la soumission AJAX
    path('profile/', views.profile_view, name='profile'),
    path('submit_registration/', views.submit_registration, name='submit_registration'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('get_burger_menu_data/', views.get_burger_menu_data, name='get_burger_menu_data'),


    ###### Gestion de profil ######
    # path('profile/<str:username>/', views.profile_view, name='profile'),
    path('gestion_profil/', views.manage_profile_view, name='gestion_profil'),
    path('change_password/', views.change_password_view, name='change_password'),
    path('update_avatar/', views.update_avatar_view, name='update_avatar'),
    path('update_profile/', views.update_profile_view, name='update_profile'),
	path('enable_2fa/', views.enable_2fa, name='enable_2fa'),
    path('disable_2fa/', views.disable_2fa, name='disable_2fa'),
	#path('qr-code/', views.enable_2fa, name='show_qr'),
	path('verify_2fa/', views.verify_2fa, name='verify_2fa'),
    path('test_manage_profile/', views.manage_profile_view, name='test_manage_profile'),
	
    path('add_friend/', views.add_friend, name='add_friend'),
    path('handle_friend_request/', views.handle_friend_request, name='handle_friend_request'),
	path('friend_profile/<str:friend_username>/', views.friend_profile_view, name='friend_profile'),
    path('remove_friend/', views.remove_friend_view, name='remove_friend'),
    path('update_status/', views.update_status, name='update_status'),



	path('get_burger_menu_data/', views.get_burger_menu_data, name='get_burger_menu_data'),
    
    path('match-history/', views.match_history_view, name='match_history'),
    path('send-friend-request/<int:to_user_id>/', views.send_friend_request, name='send_friend_request'),
    path('accept-friend-request/<int:request_id>/', views.accept_friend_request, name='accept_friend_request'),
    path('reject-friend-request/<int:request_id>/', views.reject_friend_request, name='reject_friend_request'),
    path('update-avatar/', views.update_avatar_view, name='update_avatar'),
    path('log-guest/', views.log_guest_view, name='log_guest'),
	path('verify_2fa_login/', views.verify_2fa_login, name='verify_2fa_login'),
	


    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]
