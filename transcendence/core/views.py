# core/views.py
from django.shortcuts import render
from django.template.loader import get_template
from django.http import HttpResponse, HttpResponseNotFound
from django.template import TemplateDoesNotExist
from accounts.views import manage_profile_view

def landing_view(request):
    user_id = request.session.get('user_id')
    is_authenticated = bool(user_id)
    return render(request, 'landing.html', {'is_authenticated': is_authenticated})


# Attention ! 
# Enorme difference entre rendre un template est vue dynamique 

# Inutile de rendre un template a la con, nous pouvons envoyer les vues directement . 
# Trouver une maniere d' appeller de maniere generic
def load_view(request, app, view_name):
    try:
        if view_name == 'gestion_profil':
            # Rendre une vue Django directement dans le cas
            return manage_profile_view(request)
        else:
            # Autre vue à charger
            template = get_template(f'{app}/{view_name}.html')
            return HttpResponse(template.render({}, request))

    except TemplateDoesNotExist:
        return HttpResponseNotFound("Vue non trouvée")


def home_view(request):
    return render(request, 'core/home.html')

