from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('verify-2fa/', views.verify_2fa, name='verify_2fa'),
    path('enable-2fa/', views.enable_2fa, name='enable_2fa'),
    path('disable-2fa/', views.disable_2fa, name='disable_2fa'),
]