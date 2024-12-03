import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from accounts.models import CustomUser

# [IMPROVE] un utilisateur non authentifie est il bien gere ? 
class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization', None)
        if auth_header:
            try:
                # Extrait le jeton
                token = auth_header.split(' ')[1]
                # Décode le jeton
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                # Récupère l'utilisateur
                user = CustomUser.objects.get(id=user_id)
                # Définit l'utilisateur dans la requête
                request.user = user
            except (IndexError, jwt.DecodeError, jwt.ExpiredSignatureError, CustomUser.DoesNotExist):
                request.user = AnonymousUser()
        else:
            request.user = AnonymousUser()

        response = self.get_response(request)
        return response
