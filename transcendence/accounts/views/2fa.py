# ---- Imports standard ----
import base64
from io import BytesIO
import logging

# ---- Imports tiers ----
import pyotp
import qrcode

from django.http import JsonResponse
from django.views import View
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST
from django.contrib.auth import get_user_model

# ---- Configuration ----
logger = logging.getLogger(__name__)
User = get_user_model()


class Base2FAView(View):
    """
    Base class for 2FA views, providing common utilities.
    """

    def generate_totp_qr(self, user, secret):
        """
        Generate a QR code for TOTP setup.
        """
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(name=user.username, issuer_name="Transcendence")
        
        img = qrcode.make(provisioning_uri)
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_code = base64.b64encode(buffered.getvalue()).decode()
        
        return qr_code

@method_decorator(login_required, name='dispatch')
class Enable2FAView(Base2FAView):
    """
    Enable 2FA for the authenticated user.
    """

    def get(self, request):
        if request.user.is_2fa_enabled:
            return JsonResponse({'status': 'error', 'message': '2FA is already enabled on your account.'}, status=400)

        secret = pyotp.random_base32()
        qr_code = self.generate_totp_qr(request.user, secret)

        # Store the secret in the session (expires in 5 minutes)
        request.session['totp_secret'] = secret
        request.session.set_expiry(300)

        return JsonResponse({
            'status': 'success',
            'qr_code': qr_code,
            'secret': secret
        })

@method_decorator(login_required, name='dispatch')
class Check2FAView(View):
    """
    Verify the TOTP code to enable 2FA.
    """

    def post(self, request):
        totp_secret = request.session.get('totp_secret')
        if not totp_secret:
            return JsonResponse({'status': 'error', 'message': 'No 2FA setup in progress.'}, status=400)

        code = request.POST.get('code')
        if not code:
            return JsonResponse({'status': 'error', 'message': 'Code is required.'}, status=400)

        totp = pyotp.TOTP(totp_secret)
        if totp.verify(code):
            request.user.totp_secret = totp_secret
            request.user.is_2fa_enabled = True
            request.user.save()
            del request.session['totp_secret']
            return JsonResponse({'status': 'success', 'message': '2FA has been successfully enabled.'})

        return JsonResponse({'status': 'error', 'message': 'Invalid 2FA code.'}, status=400)


from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from .utils import generate_jwt_token

class Login2faView(View):
    """
    Verify 2FA code during login.
    """

    def get(self, request):
        """
        Gère une requête HTTP GET.
        Retourne un formulaire de connexion sous forme de HTML encapsulé dans une réponse JSON.
        """
        # [IMPROVE] login2fa.html contient une balise DJANGO alors qu' on en utilise pas
        # Soit ajouter les balises pour tous les form soit modifier le html
        rendered_form = render_to_string('accounts/login2fa.html')
        return JsonResponse({
            'status': 'success',
            'form_html': rendered_form,  # Renommé pour être plus explicite
        })

    def post(self, request):
        user_id = request.session.get('user_id')
        auth_partial = request.session.get('auth_partial')

        if not user_id or not auth_partial:
            return JsonResponse({'status': 'error', 'message': 'Unauthorized access.'}, status=403)

        user = get_object_or_404(User, id=user_id)
        code = request.POST.get('code')

        if not code:
            return JsonResponse({'status': 'error', 'message': 'Code is required.'}, status=400)

        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(code):
            del request.session['auth_partial']

            token_jwt = generate_jwt_token(user)
            user.is_online = True
            user.save()
            login(request, user)

            return JsonResponse({
                'status': 'success',
                'access': token_jwt,
                'message': '2FA verified successfully. Login successful.'
            })

        return JsonResponse({'status': 'error', 'message': 'Invalid 2FA code.'}, status=400)


@method_decorator(login_required, name='dispatch')
class Disable2FAView(View):
    """
    Disable 2FA for the authenticated user.
    """

    def post(self, request):
        if not request.user.is_2fa_enabled:
            return JsonResponse({'status': 'error', 'message': '2FA is not enabled on your account.'}, status=400)

        code = request.POST.get('code')
        if not code:
            return JsonResponse({'status': 'error', 'message': 'Code is required.'}, status=400)

        totp = pyotp.TOTP(request.user.totp_secret)
        if totp.verify(code):
            request.user.totp_secret = ''
            request.user.is_2fa_enabled = False
            request.user.save()
            return JsonResponse({'status': 'success', 'message': '2FA has been disabled.'})

        return JsonResponse({'status': 'error', 'message': 'Invalid 2FA code.'}, status=400)
