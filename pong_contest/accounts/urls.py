from django.urls import path
from . import views

app_name = 'accounts'  # Nom de l'application pour les noms d'URL

urlpatterns = [
	path('login/', views.login_view, name='login'),
	path('register/', views.register_view, name='register'),
	path('log_guest/', views.login_view, name='log_guest'),
]