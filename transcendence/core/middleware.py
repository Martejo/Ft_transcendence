from django.utils.translation import activate
from django.utils.deprecation import MiddlewareMixin

class SetLanguageRedirectMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path == "/i18n/setlang/" and request.method in ["POST", "GET"]:
            # Récupérer la langue demandée
            language = request.POST.get('language') or request.GET.get('language')
            if language:
                # Appliquer immédiatement la langue pour cette requête
                activate(language)
                request.session["django_language"] = language  # Utilisez la clé correcte

            # Ajouter le paramètre 'next' pour rediriger après le changement de langue
            if request.method == "POST":
                mutable_post = request.POST.copy()
                mutable_post['next'] = '/#game-play'
                request.POST = mutable_post
            elif request.method == "GET":
                mutable_get = request.GET.copy()
                mutable_get['next'] = '/#game-play'
                request.GET = mutable_get
