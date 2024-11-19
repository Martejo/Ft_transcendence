# accounts/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse  # Vérifier que HttpResponse est bien importé
from django.contrib import messages
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.db.models import Max  # Remplacer models.Max par l'import direct de Max
from .models import CustomUser, CustomUserProfile, FriendRequest, Game, MatchHistory
from .forms import RegistrationForm, LoginForm, ProfileForm, AvatarUpdateForm, PasswordChangeForm, Two_factor_login_Form
from .utils import hash_password, verify_password
from .decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_POST
import logging
import pyotp
import jwt
import base64
from datetime import datetime, timedelta
from io import BytesIO
import qrcode
import logging
from transcendence.settings import SECRET_KEY

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)





@csrf_protect
@require_POST
def submit_registration(request):
    form = RegistrationForm(request.POST)
    if form.is_valid():
        user = form.save(commit=False)
        user.password_hash = hash_password(form.cleaned_data['password'])
        user.save()
        CustomUserProfile.objects.create(user=user)
        return JsonResponse({'status': 'success', 'message': 'Inscription réussie.'})
    return JsonResponse({'status': 'error', 'errors': form.errors})

@csrf_protect
def register_view(request):
    form = RegistrationForm() # genere un form vide et le donne au html
    return render(request, 'accounts/register.html', {'form': form})


@csrf_protect
def login_view(request):
    logger.debug("Entre dans login_view")
    if request.method == 'GET':
        form = LoginForm()
        return render(request, 'accounts/login.html', {'form': form})
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@csrf_protect
@require_POST
def submit_login(request):
    logger.debug("Entre dans submit_login_view")

    form = LoginForm(request.POST)
    if form.is_valid():
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        try:
            user = CustomUser.objects.get(username=username)
            if verify_password(user.password_hash, password):
                request.session['user_id'] = user.id
                
                # Mise à jour de l'état `is_logged_in`
                user.profile.is_logged_in = True
                user.profile.save()

                # Mise à jour de la session pour `is_authenticated`
                request.session['is_authenticated'] = True

                if user.is_2fa_enabled:
                    request.session['auth_partial'] = True
                    return JsonResponse({'status': 'success', 'requires_2fa': True})
                
                return JsonResponse({'status': 'success', 'requires_2fa': False})
            return JsonResponse({'status': 'error', 'message': 'Mot de passe incorrect'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Identifiants incorrects'})
    return JsonResponse({'status': 'error', 'errors': form.errors})


@login_required
@require_POST
@csrf_protect
def logout_view(request):
    logger.debug("Entre dans logout_view")
    if 'user_id' in request.session:
        user_id = request.session['user_id']
        CustomUserProfile.objects.filter(user_id=user_id).update(is_online=False, is_logged_in=False)
        del request.session['user_id']
        request.session['is_authenticated'] = False
    return JsonResponse({'status': 'success', 'message': 'Déconnexion réussie.'})




# @login_required
# def get_burger_menu_data(request):
#     user_id = request.session.get('user_id')
#     user = get_object_or_404(CustomUser, id=user_id)  # Assurez-vous que c'est un objet CustomUser
#     logger.debug("Coucou je suis dans get_burger-menu_data")
#     try:
#         friends = [
#             {
#                 'username': friend.username,
#                 'avatar_url': friend.profile.avatar.url if hasattr(friend, 'profile') and friend.profile.avatar else '/static/main/images/default_avatar.png',
#                 'status': 'online' if hasattr(friend, 'profile') and friend.profile.is_online else 'offline'
#             }
#             for friend in user.profile.friends.all()
# ]


#         # response_data = {
#         #     'username': user.username,
#         #     'email': user.email,
#         #     'avatar_url': user.profile.avatar if user.profile.avatar else '/static/main/images/default_avatar.png',
#         #     'is_online': user.profile.is_online,  # Ajoute le statut en ligne de l'utilisateur
#         #     'bio': user.profile.bio,  # Ajoute la bio de l'utilisateur
#         #     'friends': friends,
#         # }
#         logger.debug("Coucou j'ai passé la collecte de friends")
#         return render(request, {
#             'username': user.username,
#             'email': user.email,
#             'avatar_url': user.profile.avatar.url if user.profile.avatar.url else '/static/main/images/default_avatar.png',
#             'is_online': user.profile.is_online,  # Ajoute le statut en ligne de l'utilisateur
#             'bio': user.profile.bio,  # Ajoute la bio de l'utilisateur
#             'friends': friends,
#             }
#         )
#         # return JsonResponse(response_data)

#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)

#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)
    

@login_required
def get_burger_menu_data(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)
    logger.debug(f"User ID: {user_id}")
    logger.debug(f"User avatar in DB: {CustomUserProfile.objects.get(user=user).avatar}")
    logger.debug(f"User avatar from relation: {user.profile.avatar}")
    try:
        default_avatar = '/media/avatars/default_avatar.png'
        friends = [
            {
                'username': friend.username,
                'avatar_url': friend.profile.avatar.url if hasattr(friend, 'profile') and friend.profile.avatar else default_avatar,
                'status': 'online' if hasattr(friend, 'profile') and friend.profile.is_online else 'offline'
            }
            for friend in user.profile.friends.all()
        ]

        response_data = {
            'username': user.username,
            'email': user.email,
            'avatar_url': user.profile.avatar.url if user.profile.avatar else default_avatar,
            'is_online': user.profile.is_online,
            'bio': user.profile.bio,
            'friends': friends,
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



def get_user_profile_data(request):
    user = request.user
    if user.is_authenticated:
        profile_data = {
            'username': user.username,
            'avatar_url': user.profile.avatar.url if user.profile.avatar else '/media/avatars/default_avatar.png',
            'is_online': user.profile.is_online
        }
        return JsonResponse(profile_data)
    else:
        return JsonResponse({'error': 'Utilisateur non authentifié'}, status=403)

############ Gestion de profil #############

@csrf_protect
@login_required
def manage_profile_view(request):
    logger.debug("Entre dans manage_profile_view")
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)
    if request.method == 'GET':
        profile_form = ProfileForm(instance=user)
        password_form = PasswordChangeForm()
        avatar_form = AvatarUpdateForm(instance=user)
        
        return render(request, 'accounts/gestion_profil.html', {
            'profile_form': profile_form,
            'password_form': password_form,
            'avatar_form': avatar_form,
            'profile_user': user,
            'is_authenticated': True
        })
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@csrf_protect
@login_required
def update_profile_view(request):
    logger.debug("Entre dans update_profile_view")
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)

    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Profil mis à jour avec succès.'})
        return JsonResponse({'status': 'error', 'errors': form.errors})

    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@csrf_protect
@login_required
def change_password_view(request):
    logger.debug("Entre dans change_password_view")
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)

    if request.method == 'POST':
        form = PasswordChangeForm(request.POST)
        if form.is_valid():
            old_password = form.cleaned_data['old_password']
            new_password = form.cleaned_data['new_password']

            if verify_password(user.password_hash, old_password):
                user.password_hash = hash_password(new_password)
                user.save()
                return JsonResponse({'status': 'success', 'message': 'Mot de passe mis à jour avec succès.'})
            return JsonResponse({'status': 'error', 'message': 'Ancien mot de passe incorrect.'})
        return JsonResponse({'status': 'error', 'errors': form.errors})

    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)


@csrf_protect
@login_required
def update_avatar_view(request):
    logger.debug("Entre dans update_avatar_view")
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)

    if request.method == 'POST':
        form = AvatarUpdateForm(request.POST, request.FILES, instance=user.profile)
        if form.is_valid():
            form.save()
            logger.debug(f"Avatar after save: {user.profile.avatar}")  # Debug print
            logger.debug(f"Avatar URL: {user.profile.avatar.url}")
            return JsonResponse({'status': 'success', 'message': 'Avatar mis à jour avec succès.'})
        return JsonResponse({'status': 'error', 'errors': form.errors})

    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@csrf_protect
@login_required
def profile_view(request):
    logger.debug("Entre dans profile_view")
    user_id = request.session.get('user_id')
    logger.info(f"Tentative de chargement du profil de l'utilisateur avec user_id: {user_id}")
    try:
        user = get_object_or_404(CustomUser, id=user_id)
        logger.info(f"Utilisateur trouvé: {user.username}")

        # Calculer des données supplémentaires pour l'utilisateur
        match_count = user.match_histories.count() if hasattr(user, 'match_histories') else 0
        victories = user.match_histories.filter(result='win').count() if hasattr(user, 'match_histories') else 0
        defeats = user.match_histories.filter(result='loss').count() if hasattr(user, 'match_histories') else 0
        best_score = (
            user.games_as_player1.aggregate(Max('score_player1'))['score_player1__max']
            if hasattr(user, 'games_as_player1')
            else 0
        )

        if best_score is None:
            best_score = 0  # S'assurer que best_score est toujours défini

        friends_count = (
            user.profile.friends.count() if hasattr(user, 'profile') and hasattr(user.profile, 'friends') else 0
        )

        logger.info(f"Statistiques calculées: match_count={match_count}, victories={victories}, defeats={defeats}, best_score={best_score}, friends_count={friends_count}")

        context = {
            'profile_user': user,
            'avatar_url': user.profile.avatar.url,
            'is_2fa_enabled': user.is_2fa_enabled,
            'match_count': match_count,
            'victories': victories,
            'defeats': defeats,
            'best_score': best_score,
            'friends_count': friends_count,
        }

        return render(request, 'accounts/profile.html', context)

    except Exception as e:
        # Log l'erreur et retourne un message d'erreur plus clair
        logger.error(f"Erreur lors du chargement du profil: {e}")
        return HttpResponse("Erreur lors du chargement du profil utilisateur.", status=500)



############## Fin de gestion de profil ###############


@login_required
def match_history_view(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)
    match_histories = user.match_histories.all().order_by('-played_at')

    return render(request, 'accounts/match_history.html', {'match_histories': match_histories})


# Vues supplémentaires pour la gestion des amis
@login_required
def send_friend_request(request, to_user_id):
    user_id = request.session.get('user_id')
    from_user = get_object_or_404(CustomUser, id=user_id)
    to_user = get_object_or_404(CustomUser, id=to_user_id)

    FriendRequest.objects.create(from_user=from_user, to_user=to_user)
    return redirect('accounts:profile', username=to_user.username)


@login_required
def accept_friend_request(request, request_id):
    user_id = request.session.get('user_id')
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user_id=user_id)

    friend_request.status = 'accepted'
    friend_request.save()

    from_user = friend_request.from_user
    to_user = friend_request.to_user
    from_user.profile.friends.add(to_user)
    to_user.profile.friends.add(from_user)

    return redirect('accounts:profile', username=from_user.username)


@login_required
def reject_friend_request(request, request_id):
    user_id = request.session.get('user_id')
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user_id=user_id)

    friend_request.status = 'rejected'
    friend_request.save()

    return redirect('accounts:profile', username=friend_request.from_user.username)



def log_guest_view(request):
    if request.method == 'POST':
        guest_user, created = CustomUser.objects.get_or_create(
            username='guest',
            defaults={
                'email': 'guest@example.com',
                'password_hash': hash_password('guestpassword'),
            }
        )
        request.session['user_id'] = guest_user.id
        return redirect('home')
    return render(request, 'accounts/login.html')


# ///////////////////////////----2FA----///////////////////////////////////

@csrf_protect
@login_required
def enable_2fa(request):
    logger.debug("Entre dans enable2FA_view")
    """
    Handle the 2FA enablement process, generating a TOTP secret and QR code.
    """
    if request.method == 'GET':
        # Generate TOTP secret and JWT token
        logger.debug("Génération du QR Code et du secret TOTP")
        totp_secret = pyotp.random_base32()
        totp = pyotp.TOTP(totp_secret)
        token = jwt.encode(
            {'user_id': request.session.get('user_id'), 'totp_secret': totp_secret, 'exp': datetime.utcnow() + timedelta(minutes=5)},
            settings.SECRET_KEY, algorithm='HS256'
        )
        request.session['setup_token'] = token

        # Generate provisioning URI for QR code
        provisioning_uri = totp.provisioning_uri(name="Transcendence", issuer_name="ggwp")

        # Generate QR code
        img = qrcode.make(provisioning_uri)
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_code = base64.b64encode(buffered.getvalue()).decode()

        # Create an empty form to enter the OTP code
        form = Two_factor_login_Form()

        context = {
            'qr_code': qr_code,  # Base64 encoded QR code
            'secret': totp_secret,
            'is_authenticated': True,
            '2FA_form': form,
        }

        return render(request, 'accounts/enable_2fa.html', context)

    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)



@csrf_protect
@login_required
def verify_2fa(request):
    logger.debug("Entre dans verify_2fa")

    if request.method == 'POST':
        setup_token = request.session.get('setup_token')
        if not setup_token:
            logger.warning("Aucun token de configuration 2FA trouvé.")
            return JsonResponse({'status': 'error', 'message': 'No 2FA setup in progress.'}, status=400)

        form = Two_factor_login_Form(request.POST)
        if form.is_valid():
            try:
                user_id = request.session.get('user_id')
                payload = jwt.decode(setup_token, settings.SECRET_KEY, algorithms=['HS256'])
                totp_secret = payload['totp_secret']
                # user = User.objects.get(id=user_id)
                #user = get_object_or_404(CustomUser, id=user_id)
                user = get_object_or_404(CustomUser, id=payload['user_id'])


                entered_code = form.cleaned_data['code']
                logger.debug(f"Code saisi par l'utilisateur : {entered_code}")

                # Vérifier le code TOTP
                totp = pyotp.TOTP(totp_secret)
                if totp.verify(entered_code):
                    logger.debug("Code TOTP vérifié avec succès.")
                    user.totp_secret = totp_secret
                    user.is_2fa_enabled = True
                    user.save()

                    # Supprimer le token de configuration de la session
                    del request.session['setup_token']
                    return JsonResponse({'status': 'success', 'message': '2FA setup completed successfully.'})
                else:
                    logger.warning("Code TOTP invalide.")
                    return JsonResponse({'status': 'error', 'message': 'Invalid code entered.'}, status=400)

            except jwt.ExpiredSignatureError:
                logger.error("Le token JWT a expiré.")
                del request.session['setup_token']
                return JsonResponse({'status': 'error', 'message': 'Setup expired. Please try again.'}, status=400)

            except jwt.InvalidTokenError:
                logger.error("Le token JWT est invalide.")
                del request.session['setup_token']
                return JsonResponse({'status': 'error', 'message': 'Invalid session. Please try again.'}, status=400)
        else:
            logger.warning("Formulaire invalide")
            return JsonResponse({'status': 'error', 'message': 'Invalid input.'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)



@csrf_protect
def verify_2fa_login(request):
    logger.debug("Entre dans verify_2fa_login")

    """
    Handle 2FA verification on login.
    """
    user_id = request.session.get('user_id')
    auth_partial = request.session.get('auth_partial')

    # Redirection vers la page de connexion si les informations de session sont absentes
    if not user_id or not auth_partial:
        logger.warning("Utilisateur non authentifié ou session partielle manquante. Redirection vers la page de connexion.")
        return redirect('accounts:login')

    user = get_object_or_404(CustomUser, id=user_id)
    if not user.totp_secret:
        logger.error("Utilisateur n'a pas configuré 2FA correctement.")
        return JsonResponse({'status': 'error', 'message': '2FA not properly configured.'}, status=400)

    # Générer le formulaire lors d'une requête GET
    if request.method == 'GET':
        form = Two_factor_login_Form()
        return render(request, 'accounts/verify_2fa_login.html', {'login_2fa_form': form})

    # Valider le formulaire lors d'une requête POST
    if request.method == 'POST':
        form = Two_factor_login_Form(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']  # Utiliser cleaned_data pour obtenir le code validé
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                logger.debug("2FA vérifié avec succès pour l'utilisateur ID: %d", user.id)
                del request.session['auth_partial']
                return JsonResponse({'status': 'success', 'message': '2FA verified. Login successful.'})
            else:
                logger.warning("Code 2FA invalide pour l'utilisateur ID: %d", user.id)
                form.add_error('code', "Invalid 2FA code entered.")
        else:
            logger.warning("Formulaire 2FA non valide pour l'utilisateur ID: %d", user.id)

        # Rendre le formulaire avec les erreurs
        return render(request, 'accounts/verify_2fa_login.html', {'login_2fa_form': form})

    # Redirection par défaut si la requête n'est ni GET ni POST
    logger.warning("Méthode HTTP non prise en charge : %s", request.method)
    return redirect('accounts:login')


@csrf_protect
@login_required
def disable_2fa(request):
    logger.debug("Entre dans disable_2fa")

    """
    Disable 2FA after verifying the user-provided code.
    """
    user_id = request.session.get('user_id')

    user = get_object_or_404(CustomUser, id=user_id)
    if not user.is_2fa_enabled:
        return JsonResponse({'status': 'error', 'message': "2FA isn't enabled on your account."}, status=400)

    if request.method == 'GET':
        form = Two_factor_login_Form()
        return render(request, 'accounts/disable_2fa.html', {'disable_form': form})
    if request.method == 'POST':
        code = request.POST.get('code')
        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(code):
            user.totp_secret = ''
            user.is_2fa_enabled = False
            user.save()
            return JsonResponse({'status': 'success', 'message': '2FA has been disabled.'})

        return JsonResponse({'status': 'error', 'message': 'Invalid 2FA code entered.'}, status=400)

    return render(request, 'accounts/disable_2fa.html', {'username': user.username})

# ///////////////////////////----FIN 2FA----///////////////////////////////////