from django.urls import path
from . import views

app_name = 'accounts'  # Nom de l'application pour les noms d'URL

urlpatterns = [
	path('login/', views.login, name='login'),
	path('register/', views.register, name='register'),
	path('log_guest/', views.logAsguest, name='log_guest'),
]