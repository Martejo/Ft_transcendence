# urls.py

from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

import logging

from core.views import landing_view  # Import direct de la view

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

logger.debug("Entrée dans urls.py de l'app Transcendence")

urlpatterns = [
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('game/', include('game.urls', namespace='game')),
    path('core/', include('core.urls', namespace='core')),
    # Supprimez ou commentez cette ligne si elle interfère avec la route de fallback
    # path('', include(('core.urls', 'core'), namespace='landing')),
]

if settings.DEBUG:
    # Servir les fichiers statiques en développement
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Servir les fichiers média en développement
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Route de fallback pour servir landing.html pour toutes les autres URLs
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='landing.html')),
]
