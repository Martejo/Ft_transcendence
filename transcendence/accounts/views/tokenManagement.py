from datetime import timedelta
from django.http import JsonResponse
from django.views import View
from django.utils.timezone import now  # Remplace datetime.utcnow
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from django.conf import settings
from accounts.models import RefreshToken
import logging
from django.contrib.auth import get_user_model
# ---- Configuration ----
User = get_user_model()
logger = logging.getLogger(__name__)

class RefreshJwtView(View):
    """
    Class-Based View to handle token refresh requests.
    Validates the refresh token and issues a new access token.
    """

    def post(self, request):
        # Récupère le refresh token depuis la requête POST
        refresh_token = request.POST.get('refresh_token')

        if not refresh_token:
            return JsonResponse({'error': 'Refresh token is required'}, status=400)

        try:
            # Décodage du refresh token
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])

            # Vérifie si le refresh token est valide et non expiré dans la base de données
            token_obj = RefreshToken.objects.filter(token=refresh_token).first()
            if not token_obj or token_obj.is_expired():
                return JsonResponse({'error': 'Invalid or expired refresh token'}, status=401)

            # Génère un nouveau access token
            access_payload = {
                'user_id': payload['user_id'],
                'username': payload['username'],
                'exp': now() + timedelta(hours=1),  # Utilise now() pour gérer les fuseaux horaires
            }
            new_access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')

            return JsonResponse({'access_token': new_access_token}, status=200)

        except ExpiredSignatureError:
            return JsonResponse({'error': 'Refresh token expired'}, status=401)
        except InvalidTokenError:
            return JsonResponse({'error': 'Invalid refresh token'}, status=401)