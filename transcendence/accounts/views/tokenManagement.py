import jwt
from datetime import datetime, timedelta
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from django.conf import settings
from django.http import JsonResponse
from .models import RefreshToken
import logging
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

def refresh_token_view(request):
    """
    Endpoint to handle token refresh requests. Validates the refresh token and issues a new access token.
    """
    refresh_token = request.POST.get('refresh_token')  # Use POST to improve security.

    if not refresh_token:
        return JsonResponse({'error': 'Refresh token is required'}, status=400)

    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])

        # Verify the refresh token exists and is not expired in the database
        token_obj = RefreshToken.objects.filter(token=refresh_token).first()
        if not token_obj or token_obj.is_expired():
            return JsonResponse({'error': 'Invalid or expired refresh token'}, status=401)

        # Generate a new Access Token
        access_payload = {
            'user_id': payload['user_id'],
            'username': payload['username'],
            'exp': datetime.utcnow() + timedelta(hours=1),  # Access token validity
        }
        new_access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')

        return JsonResponse({'access_token': new_access_token}, status=200)

    except ExpiredSignatureError:
        return JsonResponse({'error': 'Refresh token expired'}, status=401)
    except InvalidTokenError:
        return JsonResponse({'error': 'Invalid refresh token'}, status=401)
