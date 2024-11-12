# user/decorators.py
from django.shortcuts import redirect

def login_required(view_func):
    def wrapper(request, *args, **kwargs):
        # Vérifie si l'utilisateur est connecté
        if 'user_id' not in request.session:
            return redirect('accounts:login')
        # Vérifie si l'authentification 2FA est requise mais non terminée
        if request.session.get('auth_partial'):
            return redirect('accounts:verify_2fa_login')
        return view_func(request, *args, **kwargs)
    return wrapper

