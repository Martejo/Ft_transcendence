# accounts/views.py
# accounts/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.conf import settings
from django.contrib.auth import (
    authenticate,
    login,
    logout,
    get_user_model,
    update_session_auth_hash,
)
from django.contrib.auth.decorators import login_required
from django.db.models import Max
from .models import FriendRequest
from .forms import (
    RegistrationForm,
    LoginForm,
    ProfileForm,
    AvatarUpdateForm,
    PasswordChangeForm,
    TwoFactorLoginForm,
)
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_POST
import logging
import pyotp
import jwt
import base64
from datetime import datetime, timedelta
from io import BytesIO
import qrcode
from .utils import generate_jwt_token

User = get_user_model()


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


User = get_user_model()

@csrf_protect
@require_POST
def submit_registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            # Connecter l'utilisateur après l'inscription (facultatif)
            login(request, user)
            return JsonResponse({'status': 'success', 'message': 'Inscription réussie.'})
        return JsonResponse({'status': 'error', 'errors': form.errors})
    else:
        form = RegistrationForm()
    return render(request, 'accounts/register.html', {'form': form})

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
@csrf_protect
@require_POST
def submit_login(request):
    logger.debug("Entre dans submit_login")

    form = LoginForm(request.POST)
    if form.is_valid():
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_active:
                request.session['user_id'] = user.id

                if user.is_2fa_enabled:
                    request.session['auth_partial'] = True
                    return JsonResponse({'status': 'success', 'requires_2fa': True})

                # Générer le jeton JWT en utilisant la fonction utilitaire
                token_jwt = generate_jwt_token(user)

                # Mettre à jour le statut de l'utilisateur
                user.is_online = True
                user.save()
                # Connecter l'utilisateur
                login(request, user)

                return JsonResponse({
                    'status': 'success',
                    'jwtToken': token_jwt,
                    'requires_2fa': False
                })
            else:
                return JsonResponse({'status': 'error', 'message': 'Compte désactivé'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Identifiants incorrects'})

    return JsonResponse({'status': 'error', 'errors': form.errors})



@login_required
@require_POST
@csrf_protect
def logout_view(request):
    user = request.user
    user.is_online = False
    user.save()
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Déconnexion réussie.'})


def get_burger_menu_data(request):
    user = request.user
    user.refresh_from_db()
    try:
        default_avatar = '/media/avatars/default_avatar.png'

        # Construction de la liste des amis
        friends = [
            {
                'username': friend.username,
                'avatar_url': friend.avatar.url if friend.avatar else default_avatar,
                'status': 'online' if friend.is_online else 'offline'
            }
            for friend in user.friends.all()
        ]

        # Construction de la liste des invitations d'amis
        friend_requests = [
            {
                'id': friend_request.id,
                'from_user': friend_request.from_user.username,
                'avatar_url': friend_request.from_user.avatar.url if friend_request.from_user.avatar else default_avatar
            }
            for friend_request in FriendRequest.objects.filter(to_user=user)
        ]

        # Construction des données de la réponse
        response_data = {
            'username': user.username,
            'email': user.email,
            'avatar_url': user.avatar.url if user.avatar else default_avatar,
            'is_online': user.is_online,
            'bio': user.bio,
            'friends': friends,
            'friend_requests': friend_requests,
        }

        response = JsonResponse({'status': 'success', 'data': response_data})
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        return response

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des données du menu burger: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_protect
@login_required
def update_status(request):
    if request.method == 'POST':
        user = request.user
        status = request.POST.get('status')
        if status == 'online':
            user.is_online = True
        elif status == 'offline':
            user.is_online = False
        else:
            return JsonResponse({'status': 'error', 'message': 'Statut non valide'}, status=400)
        user.save()
        logger.info(f"Statut mis à jour pour {user.username}: {user.is_online}")
        return JsonResponse({'status': 'success', 'message': 'Statut mis à jour avec succès', 'is_online': user.is_online})
    else:
        return JsonResponse({'status': 'error', 'message': 'Requête non autorisée'}, status=405)

@csrf_protect
def friend_profile_view(request, friend_username):
    logger.debug("Entre dans friend_profile_view")
    logger.debug(f"Friend_username = {friend_username}")
    try:
        # Rechercher l'ami par son nom d'utilisateur
        friend = get_object_or_404(CustomUser, username=friend_username)
        logger.info(f"Ami trouvé: {friend.username}")

        # Calculer les statistiques de l'ami
        match_count = friend.match_histories.count() if hasattr(friend, 'match_histories') else 0
        victories = friend.match_histories.filter(result='win').count() if hasattr(friend, 'match_histories') else 0
        defeats = friend.match_histories.filter(result='loss').count() if hasattr(friend, 'match_histories') else 0
        best_score = (
            friend.games_as_player1.aggregate(Max('score_player1'))['score_player1__max']
            if hasattr(friend, 'games_as_player1')
            else 0
        )

        if best_score is None:
            best_score = 0  # S'assurer que best_score est toujours défini

        friends_count = (
            friend.profile.friends.count() if hasattr(friend, 'profile') and hasattr(friend.profile, 'friends') else 0
        )

        logger.info(f"Statistiques calculées: match_count={match_count}, victories={victories}, defeats={defeats}, best_score={best_score}, friends_count={friends_count}")
        default_avatar = '/media/avatars/default_avatar.png'
        context = {
            'profile_user': friend,
            'avatar_url': friend.profile.avatar.url if friend.profile.avatar else default_avatar,
            'match_count': match_count,
            'victories': victories,
            'defeats': defeats,
            'best_score': best_score,
            'friends_count': friends_count,
        }

        return render(request, 'accounts/friend_profile.html', context)

    except Exception as e:
        # Log l'erreur et retourne un message d'erreur plus clair
        logger.error(f"Erreur lors du chargement du profil de l'ami: {e}")
        return HttpResponse("Erreur lors du chargement du profil de l'ami.", status=500)


@csrf_protect
@login_required
def remove_friend_view(request):
    if request.method == 'POST':
        user = request.user
        friend_username = request.POST.get('friend_username')
        if not friend_username:
            return JsonResponse({'status': 'error', 'message': 'Nom d\'utilisateur de l\'ami manquant'}, status=400)
        friend = get_object_or_404(User, username=friend_username)
        user.friends.remove(friend)
        friend.friends.remove(user)
        return JsonResponse({'status': 'success', 'message': 'Ami supprimé avec succès'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Requête non autorisée'}, status=405)


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
    user = request.user
    if request.method == 'GET':
        profile_form = ProfileForm(instance=user)
        password_form = PasswordChangeForm(user)
        avatar_form = AvatarUpdateForm(instance=user)
        return render(request, 'accounts/gestion_profil.html', {
            'profile_form': profile_form,
            'password_form': password_form,
            'avatar_form': avatar_form,
            'profile_user': user
        })
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)


@csrf_protect
@login_required
def update_profile_view(request):
    user = request.user
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Profil mis à jour avec succès.'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)



@csrf_protect  # VOir si faire requete DELETE
@login_required
def delete_account(request):
    if request.method == 'POST':
        user = request.user
        user.delete()
        logout(request)
        return JsonResponse({'status': 'success', 'message': 'Votre compte a été supprimé avec succès.'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Requête invalide.'}, status=400)


@csrf_protect
@login_required
def change_password_view(request):
    user = request.user
    if request.method == 'POST':
        form = PasswordChangeForm(user, request.POST)
        if form.is_valid():
            form.save()
            # Mettre à jour la session pour éviter la déconnexion
            update_session_auth_hash(request, user)
            return JsonResponse({'status': 'success', 'message': 'Mot de passe mis à jour avec succès.'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})
    else:
        form = PasswordChangeForm(user)
    return render(request, 'accounts/change_password.html', {'form': form})



@csrf_protect
@login_required
def update_avatar_view(request):
    user = request.user
    if request.method == 'POST':
        form = AvatarUpdateForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Avatar mis à jour avec succès.'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@csrf_protect
def profile_view(request):
    logger.debug("Entre dans profile_view")
    #user_id = request.session.get('user_id')
    #logger.info(f"Tentative de chargement du profil de l'utilisateur avec user_id: {user_id}")
    try:
        user = request.user
        logger.info(f"Utilisateur trouvé: {user.username}")

        # Calculer des données supplémentaires pour l'utilisateur
        match_count = user.match_histories.count()
        victories = user.match_histories.filter(result='win').count()
        defeats = user.match_histories.filter(result='loss').count()
        best_score = user.games_as_player1.aggregate(Max('score_player1'))['score_player1__max'] or 0

        friends_count = user.friends.count()

        logger.info(f"Statistiques calculées: match_count={match_count}, victories={victories}, defeats={defeats}, best_score={best_score}, friends_count={friends_count}")

        default_avatar = '/media/avatars/default_avatar.png'
        avatar_url = user.avatar.url if user.avatar else default_avatar

        context = {
            'profile_user': user,
            'avatar_url': avatar_url,
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


############## Gestion ami #############

@csrf_protect
@login_required
def add_friend(request):
    if request.method == 'POST':
        user = request.user
        friend_username = request.POST.get('friend_username')

        if not friend_username:
            return JsonResponse({'status': 'error', 'message': 'Nom d\'utilisateur de l\'ami manquant'}, status=400)

        friend = get_object_or_404(User, username=friend_username)

        if friend == user:
            return JsonResponse({'status': 'error', 'message': 'Vous ne pouvez pas vous envoyer une demande d\'ami à vous-même.'}, status=400)

        if friend in user.friends.all():
            return JsonResponse({'status': 'error', 'message': 'Vous êtes déjà ami avec cet utilisateur.'}, status=400)

        if FriendRequest.objects.filter(from_user=user, to_user=friend).exists():
            return JsonResponse({'status': 'error', 'message': 'Demande d\'ami déjà envoyée.'}, status=400)

        if FriendRequest.objects.filter(from_user=friend, to_user=user).exists():
            return JsonResponse({'status': 'error', 'message': 'Cet utilisateur vous a déjà envoyé une demande d\'ami.'}, status=400)

        FriendRequest.objects.create(from_user=user, to_user=friend)
        return JsonResponse({'status': 'success', 'message': 'Demande d\'ami envoyée.'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée.'}, status=405)


    
@csrf_protect
@login_required
def handle_friend_request(request):
    if request.method == 'POST':
        user = request.user  # Utiliser l'utilisateur actuellement connecté

        try:
            request_id = request.POST.get('request_id')
            action = request.POST.get('action')
            logger.debug(f"Request ID reçu : {request_id}")
            logger.debug(f"Utilisateur {user.username} avec ID : {user.id}")

            # Récupérer la demande d'ami
            friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=user)

            if action == 'accept':
                # Ajouter les deux utilisateurs comme amis
                user.friends.add(friend_request.from_user)
                friend_request.from_user.friends.add(user)

                # Supprimer la demande d'ami
                friend_request.delete()

                return JsonResponse({'status': 'success', 'message': 'Demande d\'ami acceptée'})

            elif action == 'decline':
                # Supprimer la demande
                friend_request.delete()
                return JsonResponse({'status': 'success', 'message': 'Demande d\'ami refusée'})

            else:
                return JsonResponse({'status': 'error', 'message': 'Action non valide'}, status=400)

        except Exception as e:
            logger.error(f"Erreur lors de la gestion de la demande d'ami: {e}")
            return JsonResponse({'status': 'error', 'message': 'Erreur lors de la gestion de la demande d\'ami'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Requête non autorisée'}, status=405)


@login_required
def send_friend_request(request, to_user_id):
    from_user = request.user
    to_user = get_object_or_404(User, id=to_user_id)

    if from_user == to_user:
        return JsonResponse({'status': 'error', 'message': 'Vous ne pouvez pas vous envoyer une demande d\'ami à vous-même.'}, status=400)

    if FriendRequest.objects.filter(from_user=from_user, to_user=to_user).exists():
        return JsonResponse({'status': 'error', 'message': 'Demande d\'ami déjà envoyée.'}, status=400)

    if to_user in from_user.friends.all():
        return JsonResponse({'status': 'error', 'message': 'Vous êtes déjà amis avec cet utilisateur.'}, status=400)

    FriendRequest.objects.create(from_user=from_user, to_user=to_user)
    return redirect('accounts:profile', friend_username=to_user.username)



@login_required
def accept_friend_request(request, request_id):
    user = request.user
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=user)

    # Ajouter les deux utilisateurs comme amis
    from_user = friend_request.from_user
    user.friends.add(from_user)
    from_user.friends.add(user)

    # Supprimer la demande d'ami
    friend_request.delete()

    return redirect('accounts:profile', friend_username=from_user.username)


@login_required
def reject_friend_request(request, request_id):
    user = request.user
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=user)

    # Supprimer la demande d'ami
    friend_request.delete()

    return redirect('accounts:profile', friend_username=friend_request.from_user.username)

################ FIN GESTION AMI ##############


# ///////////////////////////----2FA----///////////////////////////////////
@csrf_protect
@login_required
def enable_2fa(request):
    logger.debug("Entre dans enable2FA_view")
    if request.method == 'GET':
        if request.user.is_2fa_enabled:
            return JsonResponse({'status': 'error', 'message': '2FA est déjà activé sur votre compte.'}, status=400)
        # Générer le secret TOTP
        logger.debug("Génération du QR Code et du secret TOTP")
        totp_secret = pyotp.random_base32()
        totp = pyotp.TOTP(totp_secret)

        # Stocker le secret dans la session
        request.session['totp_secret'] = totp_secret
        request.session.set_expiry(300)  # Expiration dans 5 minutes

        # Générer l'URI de provisioning pour le QR code
        provisioning_uri = totp.provisioning_uri(name="Transcendence", issuer_name="ggwp")

        # Générer le QR code
        img = qrcode.make(provisioning_uri)
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_code = base64.b64encode(buffered.getvalue()).decode()

        # Créer un formulaire vide
        form = TwoFactorLoginForm()  # Assurez-vous que le nom du formulaire est cohérent

        context = {
            'qr_code': qr_code,
            'secret': totp_secret,
            '2FA_form': form,
        }

        return render(request, 'accounts/enable_2fa.html', context)

    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)


@csrf_protect
@login_required
def check_2fa(request):
    logger.debug("Entre dans check_2fa")

    if request.user.is_2fa_enabled:
        return JsonResponse({'status': 'error', 'message': 'Le 2FA est déjà activé sur votre compte.'}, status=400)
    if request.method == 'POST':
        totp_secret = request.session.get('totp_secret')
        if not totp_secret:
            logger.warning("Aucun secret TOTP trouvé dans la session.")
            return JsonResponse({'status': 'error', 'message': 'Aucune configuration 2FA en cours.'}, status=400)

        form = TwoFactorLoginForm(request.POST)
        if form.is_valid():
            entered_code = form.cleaned_data['code']
            logger.debug(f"Code saisi par l'utilisateur : {entered_code}")

            # Vérifier le code TOTP
            totp = pyotp.TOTP(totp_secret)
            if totp.verify(entered_code):
                logger.debug("Code TOTP vérifié avec succès.")
                user = request.user

                user.totp_secret = totp_secret
                user.is_2fa_enabled = True
                user.save()

                # Supprimer le secret de la session
                del request.session['totp_secret']
                return JsonResponse({'status': 'success', 'message': '2FA configuré avec succès.'})
            else:
                logger.warning("Code TOTP invalide.")
                return JsonResponse({'status': 'error', 'message': 'Code invalide.'}, status=400)
        else:
            logger.warning("Formulaire invalide.")
            return JsonResponse({'status': 'error', 'message': 'Entrée invalide.'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée.'}, status=405)



@csrf_protect
def verify_2fa_login(request):
    logger.debug("Entre dans verify_2fa_login")

    user_id = request.session.get('user_id')
    auth_partial = request.session.get('auth_partial')

    if not user_id or not auth_partial:
        logger.warning("Utilisateur non authentifié ou session partielle manquante.")
        return redirect('accounts:login')

    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        form = TwoFactorLoginForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                # Supprimer l'indicateur d'authentification partielle
                del request.session['auth_partial']

                # Générer le jeton JWT en utilisant la fonction utilitaire
                token_jwt = generate_jwt_token(user)

                # Mettre à jour le statut de l'utilisateur
                user.is_online = True
                user.save()

                # Connecter l'utilisateur
                login(request, user)

                return JsonResponse({
                    'status': 'success',
                    'access': token_jwt,
                    'message': '2FA vérifié avec succès. Connexion réussie.'
                })
            else:
                form.add_error('code', "Code 2FA invalide.")
        else:
            logger.warning("Formulaire 2FA non valide.")

        return render(request, 'accounts/verify_2fa_login.html', {'login_2fa_form': form})
    else:
        form = TwoFactorLoginForm()
        return render(request, 'accounts/verify_2fa_login.html', {'login_2fa_form': form})

@csrf_protect
@login_required
def disable_2fa(request):
    logger.debug("Entre dans disable_2fa")

    user = request.user
    if not user.is_2fa_enabled:
        return JsonResponse({'status': 'error', 'message': "Le 2FA n'est pas activé sur votre compte."}, status=400)

    if request.method == 'GET':
        form = TwoFactorLoginForm()
        return render(request, 'accounts/disable_2fa.html', {'disable_form': form})
    elif request.method == 'POST':
        form = TwoFactorLoginForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                user.totp_secret = ''
                user.is_2fa_enabled = False
                user.save()
                return JsonResponse({'status': 'success', 'message': 'Le 2FA a été désactivé.'})
            else:
                logger.warning("Code 2FA invalide.")
                form.add_error('code', "Code 2FA invalide.")
        else:
            logger.warning("Formulaire invalide.")

        return render(request, 'accounts/disable_2fa.html', {'disable_form': form})

    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée.'}, status=405)
# ///////////////////////////----FIN 2FA----///////////////////////////////////