# User/urls.py
from django.urls import path
from . import views

app_name = 'User'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('profile/<str:username>/', views.profile_view, name='profile'),
    path('update-avatar/', views.update_avatar_view, name='update_avatar'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('update-profile/', views.update_profile_view, name='update_profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    path('match-history/', views.match_history_view, name='match_history'),
    path('send-friend-request/<int:to_user_id>/', views.send_friend_request, name='send_friend_request'),
    path('accept-friend-request/<int:request_id>/', views.accept_friend_request, name='accept_friend_request'),
    path('reject-friend-request/<int:request_id>/', views.reject_friend_request, name='reject_friend_request'),
    path('update-avatar/', views.update_avatar_view, name='update_avatar'),
	path('enable-2fa/', views.enable_2fa, name='enable_2fa'),
	path('qr-code/', views.enable_2fa, name='show_qr'),
	path('verify-2fa/', views.verify_2fa, name='verify_2fa'),
    path('log-guest/', views.log_guest_view, name='log_guest'),
	path('verify-2fa-login/', views.verify_2fa_login, name='verify_2fa_login'),
    path('disable-2fa/', views.disable_2fa, name='disable_2fa'),

]