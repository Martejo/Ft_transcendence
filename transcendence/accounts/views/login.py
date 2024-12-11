# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.views import View
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, login

# ---- Imports locaux ----
from .utils import generate_jwt_token
from .forms import LoginForm

# ---- Configuration ----
logger = logging.getLogger(__name__)


@method_decorator(csrf_protect, name='dispatch')  # Applique la protection CSRF à toute la classe
class LoginView(View):
    """
    Class-Based View (CBV) pour gérer la connexion utilisateur.
    - GET : Affiche le formulaire de connexion.
    - POST : Traite les données du formulaire et connecte l'utilisateur.
    """

    def get(self, request):
        """
        Gère une requête HTTP GET.
        Retourne un formulaire de connexion sous forme de HTML encapsulé dans une réponse JSON.
        """
        form = LoginForm()  # Initialise un formulaire de connexion vide
        rendered_form = render_to_string('accounts/login_form.html', {'form': form})  # Génère le HTML du formulaire
        return JsonResponse({
            'status': 'success',
            'form_html': rendered_form,  # Renommé pour être plus explicite
        })

    @method_decorator(require_POST)  # Restreint cette méthode aux requêtes POST uniquement
    def post(self, request):
        logger.debug("Entering SubmitLoginView POST")

        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            # Authenticate the user
            user = authenticate(request, username=username, password=password)

            if user is not None:
                if user.is_active:
                    request.session['user_id'] = user.id

                    # Check if 2FA is enabled
                    if user.is_2fa_enabled:
                        request.session['auth_partial'] = True
                        return JsonResponse({'status': 'success', 'requires_2fa': True})

                    # Generate JWT token
                    token_jwt = generate_jwt_token(user)

                    # Update user status and login
                    user.is_online = True
                    user.save()
                    login(request, user)

                    return JsonResponse({
                        'status': 'success',
                        'jwtToken': token_jwt,
                        'requires_2fa': False
                    })
                else:
                    return JsonResponse({'status': 'error', 'message': 'Compte désactivé'})

            # Invalid credentials
            return JsonResponse({'status': 'error', 'message': 'Identifiants incorrects'})

        # Return form validation errors
        return JsonResponse({'status': 'error', 'errors': form.errors})