# core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_view, name='landing'),  # Ajoutez ce pattern pour le chemin vide
    # path('views/<str:view_name>/', views.load_view, name='load_view'),
    # path('<str:view>/<str:app>/', views.load_view, name='load_view'),
    path('<str:app>/<str:view_name>/', views.load_view, name='load_view'),
    path('get_navbar/', views.get_navbar, name='get_navbar'),

    path('home/', views.home_view, name='home_view'),  # Ajouter ceci

    # Autres URL patterns
]
