# core/views.py
from django.shortcuts import render
from django.template.loader import get_template
from django.http import HttpResponse, HttpResponseNotFound
from django.template import TemplateDoesNotExist


def landing_view(request):
    user_id = request.session.get('user_id')
    is_authenticated = bool(user_id)
    return render(request, 'landing.html', {'is_authenticated': is_authenticated})

def load_view(request, app, view_name):
    try:
        # Vous pouvez ajouter une logique pour vérifier si l'utilisateur est autorisé à voir cette vue
        template = get_template(f'{app}/{view_name}.html')
        return HttpResponse(template.render({}, request))
    except TemplateDoesNotExist:
        return HttpResponseNotFound("Vue non trouvée")


def home_view(request):
    return render(request, 'core/home.html')

