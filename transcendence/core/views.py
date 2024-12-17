from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
import logging
from transcendence.decorators import user_not_authenticated



logger = logging.getLogger(__name__)

def get_navbar(request):
    """
    Génère et retourne le contenu de la barre de navigation sous forme de JSON.
    """
    logger.debug("Entre dans get_navbar_view")
    is_authenticated = request.user.is_authenticated

    if is_authenticated:
        # Génère le HTML du burger-menu
        burger_menu_html = render_to_string('accounts/burger_menu.html', {'user': request.user})
        # Génère le HTML de la navbar pour un utilisateur connecté
        navbar_html = render_to_string('core/navbar_logged_in.html', {'burger_menu': burger_menu_html})
    else:
        # Génère le HTML de la navbar publique
        navbar_html = render_to_string('core/navbar_public.html')

    return JsonResponse({
        'status': 'success',
        'is_authenticated': is_authenticated,
        'navbar_html': navbar_html
    })


@user_not_authenticated
def home_view(request):
    """
    Retourne la page d'accueil sous forme de JSON avec son contenu HTML.
    """
    logger.debug("Entre dans home_view")
    home_html = render_to_string('core/home.html')
    return JsonResponse({
        'status': 'success',
        'home_html': home_html
    })


def landing_view(request):
    """
    Retourne la page de destination avec un état d'authentification dans une réponse JSON.
    """
    logger.debug("Entre dans landing_view")
    return render(request, 'landing.html')