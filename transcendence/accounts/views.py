from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from django.db.models import Max
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from .models import CustomUser, CustomUserProfile, FriendRequest, Game, MatchHistory
from .forms import RegistrationForm, LoginForm, ProfileForm, AvatarUpdateForm, PasswordChangeForm, TwoFactorLoginForm
from .utils import hash_password, verify_password

import pyotp
import jwt
import base64
from datetime import datetime, timedelta
from io import BytesIO
import qrcode
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

# Vue pour l'inscription
@csrf_protect
def submit_registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.password_hash = hash_password(form.cleaned_data['password'])
            user.save()
            CustomUserProfile.objects.create(user=user)
            return JsonResponse({'status': 'success', 'message': 'Inscription réussie.'})
        return JsonResponse({'status': 'error', 'errors': form.errors})
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@csrf_protect
def register_view(request):
    form = RegistrationForm()
    return render(request, 'accounts/register.html', {'form': form})

# Vue pour la connexion
@csrf_protect
def login_view(request):
    logger.debug("Entre dans login_view")
    if request.method == 'GET':
        form = LoginForm()
        return render(request, 'accounts/login.html', {'form': form})
    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@csrf_protect
def submit_login(request):
    logger.debug("Entrée dans submit_login")
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            try:
                user = CustomUser.objects.get(username=username)
                if verify_password(user.password_hash, password):
                    if user.is_2fa_enabled:
                        # Stocker l'utilisateur dans la session pour le 2FA
                        request.session['user_id'] = user.id
                        request.session['auth_partial'] = True
                        return JsonResponse({'status': 'success', 'requires_2fa': True})

                    # Générer le jeton JWT
                    payload = {
                        'user_id': user.id,
                        'exp': datetime.utcnow() + timedelta(hours=1),  # Durée de validité du jeton
                    }
                    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                    if isinstance(token, bytes):
                        token = token.decode('utf-8')

                    # Mettre à jour le profil de l'utilisateur
                    user.profile.is_online = True
                    user.profile.is_logged_in = True
                    user.profile.save()

                    response = JsonResponse({
                        'status': 'success',
                        'access': token,
                        'requires_2fa': False
                    })
                    # Ajouter le jeton dans les cookies (optionnel)
                    response.set_cookie('access_token', token, httponly=True)
                    return response

                return JsonResponse({'status': 'error', 'message': 'Mot de passe incorrect'})
            except CustomUser.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Identifiants incorrects'})
        return JsonResponse({'status': 'error', 'errors': form.errors})
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

# Vue pour la déconnexion
@login_required
def logout_view(request):
    logger.debug("Entrée dans logout_view")
    user = request.user
    # Mettre à jour l'état de l'utilisateur
    user.profile.is_online = False
    user.profile.is_logged_in = False
    user.profile.save()
    logout(request)
    response = JsonResponse({'status': 'success', 'message': 'Déconnexion réussie.'})
    # Supprimer le cookie du jeton (si utilisé)
    response.delete_cookie('access_token')
    return response

# Vue pour obtenir les données du menu burger
@login_required
def get_burger_menu_data(request):
    user = request.user
    user.profile.refresh_from_db()
    logger.debug(f"User avatar from relation: {user.profile.avatar}")
    logger.debug(f"Statut après refresh_from_db pour {user.username}: {user.profile.is_online}")

    try:
        default_avatar = '/media/avatars/default_avatar.png'

        # Construction de la liste des amis
        friends = [
            {
                'username': friend.username,
                'avatar_url': friend.profile.avatar.url if hasattr(friend, 'profile') and friend.profile.avatar else default_avatar,
                'status': 'online' if hasattr(friend, 'profile') and friend.profile.is_online else 'offline'
            }
            for friend in user.profile.friends.all()
        ]

        # Construction de la liste des invitations d'amis
        friend_requests = [
            {
                'id': friend_request.id,
                'from_user': friend_request.from_user.username,
                'avatar_url': friend_request.from_user.profile.avatar.url if hasattr(friend_request.from_user, 'profile') and friend_request.from_user.profile.avatar else default_avatar
            }
            for friend_request in FriendRequest.objects.filter(to_user=user)
        ]

        # Construction des données de la réponse
        response_data = {
            'username': user.username,
            'email': user.email,
            'avatar_url': user.profile.avatar.url if user.profile.avatar else default_avatar,
            'is_online': user.profile.is_online,
            'bio': user.profile.bio,
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

# Vue pour mettre à jour le statut en ligne/hors ligne
@login_required
def update_status(request):
    if request.method == 'POST':
        try:
            user = request.user
            status = request.POST.get('status')

            if status == 'online':
                user.profile.is_online = True
            elif status == 'offline':
                user.profile.is_online = False
            else:
                return JsonResponse({'status': 'error', 'message': 'Statut non valide'}, status=400)

            user.profile.save()
            user.profile.refresh_from_db()

            logger.info(f"Statut mis à jour pour {user.username}: {user.profile.is_online}")
            return JsonResponse({'status': 'success', 'message': 'Statut mis à jour avec succès', 'is_online': user.profile.is_online})

        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du statut : {e}")
            return JsonResponse({'status': 'error', 'message': 'Erreur lors de la mise à jour du statut'}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

# Vue pour afficher le profil d'un ami
@login_required
def friend_profile_view(request, friend_username):
    logger.debug("Entre dans friend_profile_view")
    logger.debug(f"Friend_username = {friend_username}")
    try:
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
            best_score = 0

        friends_count = (
            friend.profile.friends.count() if hasattr(friend, 'profile') and hasattr(friend.profile, 'friends') else 0
        )

        logger.info(f"Statistiques calculées pour {friend.username}")
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
        logger.error(f"Erreur lors du chargement du profil de l'ami: {e}")
        return HttpResponse("Erreur lors du chargement du profil de l'ami.", status=500)

# Vue pour supprimer un ami
@login_required
def remove_friend_view(request):
    if request.method == 'POST':
        try:
            user = request.user
            friend_username = request.POST.get('friend_username')
            logger.debug(f"friend_username = {friend_username}")
            if not friend_username:
                return JsonResponse({'status': 'error', 'message': 'Nom d\'utilisateur de l\'ami manquant'}, status=400)

            friend = get_object_or_404(CustomUser, username=friend_username)

            # Supprimer l'ami des listes d'amis de chaque utilisateur
            if hasattr(user, 'profile') and hasattr(friend, 'profile'):
                user.profile.friends.remove(friend)
                friend.profile.friends.remove(user)

            return JsonResponse({'status': 'success', 'message': 'Ami supprimé avec succès'})

        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'ami: {e}")
            return JsonResponse({'status': 'error', 'message': 'Erreur lors de la suppression de l\'ami'}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

# Vue pour obtenir les données du profil utilisateur
@login_required
def get_user_profile_data(request):
    user = request.user
    profile_data = {
        'username': user.username,
        'avatar_url': user.profile.avatar.url if user.profile.avatar else '/media/avatars/default_avatar.png',
        'is_online': user.profile.is_online
    }
    return JsonResponse(profile_data)

############ Gestion de profil #############

@login_required
def manage_profile_view(request):
    logger.debug("Entre dans manage_profile_view")
    user = request.user
    if request.method == 'GET':
        profile_form = ProfileForm(instance=user)
        password_form = PasswordChangeForm()
        avatar_form = AvatarUpdateForm(instance=user.profile)

        return render(request, 'accounts/gestion_profil.html', {
            'profile_form': profile_form,
            'password_form': password_form,
            'avatar_form': avatar_form,
            'profile_user': user,
            'is_authenticated': True
        })
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@login_required
def update_profile_view(request):
    logger.debug("Entre dans update_profile_view")
    user = request.user
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Profil mis à jour avec succès.'})
        return JsonResponse({'status': 'error', 'errors': form.errors})
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@login_required
def delete_account(request):
    logger.debug("Entre dans delete_account")
    if request.method == 'DELETE':
        user = request.user
        user.delete()
        return JsonResponse({'status': 'success', 'message': 'Votre compte a été supprimé avec succès.'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Requête invalide.'}, status=400)

@login_required
def change_password_view(request):
    logger.debug("Entre dans change_password_view")
    user = request.user
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
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@login_required
def update_avatar_view(request):
    logger.debug("Entre dans update_avatar_view")
    user = request.user
    if request.method == 'POST':
        form = AvatarUpdateForm(request.POST, request.FILES, instance=user.profile)
        if form.is_valid():
            form.save()
            logger.debug(f"Avatar after save: {user.profile.avatar}")
            logger.debug(f"Avatar URL: {user.profile.avatar.url}")
            return JsonResponse({'status': 'success', 'message': 'Avatar mis à jour avec succès.'})
        return JsonResponse({'status': 'error', 'errors': form.errors})
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

@login_required
def profile_view(request):
    logger.debug("Entre dans profile_view")
    try:
        user = request.user
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
            best_score = 0

        friends_count = (
            user.profile.friends.count() if hasattr(user, 'profile') and hasattr(user.profile, 'friends') else 0
        )

        logger.info(f"Statistiques calculées: match_count={match_count}, victories={victories}, defeats={defeats}, best_score={best_score}, friends_count={friends_count}")
        default_avatar = '/media/avatars/default_avatar.png'
        context = {
            'profile_user': user,
            'avatar_url': user.profile.avatar.url if user.profile.avatar else default_avatar,
            'is_2fa_enabled': user.is_2fa_enabled,
            'match_count': match_count,
            'victories': victories,
            'defeats': defeats,
            'best_score': best_score,
            'friends_count': friends_count,
        }

        return render(request, 'accounts/profile.html', context)

    except Exception as e:
        logger.error(f"Erreur lors du chargement du profil: {e}")
        return HttpResponse("Erreur lors du chargement du profil utilisateur.", status=500)

############## Fin de gestion de profil ###############

# Vue pour ajouter un ami
@login_required
def add_friend(request):
    if request.method == 'POST':
        try:
            from_user = request.user
            friend_username = request.POST.get('friend_username')
            if not friend_username:
                return JsonResponse({'status': 'error', 'message': 'Nom d\'utilisateur de l\'ami manquant'}, status=400)

            friend = get_object_or_404(CustomUser, username=friend_username)

            # Vérifier s'il existe déjà une demande d'ami
            if FriendRequest.objects.filter(from_user=from_user, to_user=friend).exists():
                return JsonResponse({'status': 'error', 'message': 'Demande d\'ami déjà envoyée'}, status=400)

            # Créer une demande d'ami
            FriendRequest.objects.create(from_user=from_user, to_user=friend)
            return JsonResponse({'status': 'success', 'message': 'Demande d\'ami envoyée'})

        except Exception as e:
            logger.error(f"Erreur lors de l'envoi d'une demande d'ami: {e}")
            return JsonResponse({'status': 'error', 'message': 'Erreur lors de l\'envoi de la demande d\'ami'}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

# Vue pour gérer les demandes d'amis
@login_required
def handle_friend_request(request):
    if request.method == 'POST':
        try:
            user = request.user

            if not hasattr(user, 'profile'):
                return JsonResponse({'status': 'error', 'message': 'Utilisateur sans profil valide.'}, status=400)

            request_id = request.POST.get('request_id')
            action = request.POST.get('action')
            logger.debug(f"Request ID reçu : {request_id}")
            logger.debug(f"Utilisateur {user.username}")

            # Récupérer la demande d'ami
            friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=user)

            if action == 'accept':
                # Ajouter les deux utilisateurs comme amis
                user.profile.friends.add(friend_request.from_user)
                friend_request.from_user.profile.friends.add(user)

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
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée'}, status=405)

# Vue pour l'historique des matchs
@login_required
def match_history_view(request):
    user = request.user
    match_histories = user.match_histories.all().order_by('-played_at')

    return render(request, 'accounts/match_history.html', {'match_histories': match_histories})

# Vues supplémentaires pour la gestion des amis
@login_required
def send_friend_request(request, to_user_id):
    from_user = request.user
    to_user = get_object_or_404(CustomUser, id=to_user_id)

    # Créer une demande d'ami
    FriendRequest.objects.create(from_user=from_user, to_user=to_user)

    # Redirection vers le profil de l'utilisateur destinataire
    return redirect('accounts:profile', username=to_user.username)

@login_required
def accept_friend_request(request, request_id):
    user = request.user
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=user)

    # Mettre à jour le statut de la demande
    friend_request.status = 'accepted'
    friend_request.save()

    # Ajouter les deux utilisateurs comme amis
    from_user = friend_request.from_user
    to_user = friend_request.to_user
    from_user.profile.friends.add(to_user)
    to_user.profile.friends.add(from_user)

    return redirect('accounts:profile', username=from_user.username)

@login_required
def reject_friend_request(request, request_id):
    user = request.user
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=user)

    # Mettre à jour le statut de la demande
    friend_request.status = 'rejected'
    friend_request.save()

    return redirect('accounts:profile', username=friend_request.from_user.username)

# Vue pour l'authentification en tant qu'invité (si nécessaire)
def log_guest_view(request):
    guest_user, created = CustomUser.objects.get_or_create(
        username='guest',
        defaults={
            'email': 'guest@example.com',
            'password_hash': hash_password('guestpassword'),
        }
    )
    login(request, guest_user)
    return redirect('home')

# ///////////////////////////----2FA----///////////////////////////////////

@login_required
def enable_2fa(request):
    logger.debug("Entre dans enable2FA_view")
    """
    Gérer le processus d'activation du 2FA, générer un secret TOTP et un QR code.
    """
    user = request.user

    # Générer le secret TOTP
    totp_secret = pyotp.random_base32()
    totp = pyotp.TOTP(totp_secret)

    # Générer l'URI de provisioning pour le QR code
    provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name="Transcendence")

    # Générer le QR code
    img = qrcode.make(provisioning_uri)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_code = base64.b64encode(buffered.getvalue()).decode()

    # Stocker le secret temporairement dans la session
    request.session['totp_secret'] = totp_secret

    # Créer un formulaire pour entrer le code OTP
    form = TwoFactorLoginForm()

    context = {
        'qr_code': qr_code,
        'secret': totp_secret,
        'is_authenticated': True,
        'form': form,
    }

    return render(request, 'accounts/enable_2fa.html', context)

@login_required
def verify_2fa(request):
    logger.debug("Entre dans verify_2fa")
    user = request.user
    totp_secret = request.session.get('totp_secret')

    if not totp_secret:
        logger.warning("Aucun secret TOTP trouvé dans la session.")
        return JsonResponse({'status': 'error', 'message': 'No 2FA setup in progress.'}, status=400)

    if request.method == 'POST':
        form = TwoFactorLoginForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            totp = pyotp.TOTP(totp_secret)
            if totp.verify(code):
                logger.debug("Code TOTP vérifié avec succès.")
                user.totp_secret = totp_secret
                user.is_2fa_enabled = True
                user.save()

                # Supprimer le secret de la session
                del request.session['totp_secret']
                return JsonResponse({'status': 'success', 'message': '2FA activé avec succès.'})
            else:
                logger.warning("Code TOTP invalide.")
                return JsonResponse({'status': 'error', 'message': 'Code invalide.'}, status=400)
        else:
            logger.warning("Formulaire invalide.")
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée.'}, status=405)

def verify_2fa_login(request):
    logger.debug("Entre dans verify_2fa_login")

    user_id = request.session.get('user_id')
    auth_partial = request.session.get('auth_partial')

    if not user_id or not auth_partial:
        logger.warning("Utilisateur non authentifié ou session partielle manquante.")
        return redirect('accounts:login')

    user = get_object_or_404(CustomUser, id=user_id)
    if not user.totp_secret:
        logger.error("Utilisateur n'a pas configuré 2FA correctement.")
        return JsonResponse({'status': 'error', 'message': '2FA not properly configured.'}, status=400)

    if request.method == 'GET':
        form = TwoFactorLoginForm()
        return render(request, 'accounts/verify_2fa_login.html', {'form': form})

    if request.method == 'POST':
        form = TwoFactorLoginForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                logger.debug("2FA vérifié avec succès pour l'utilisateur ID: %d", user.id)
                del request.session['auth_partial']

                # Générer le jeton JWT
                payload = {
                    'user_id': user.id,
                    'exp': datetime.utcnow() + timedelta(hours=1),
                }
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                if isinstance(token, bytes):
                    token = token.decode('utf-8')

                # Mettre à jour le profil de l'utilisateur
                user.profile.is_online = True
                user.profile.is_logged_in = True
                user.profile.save()

                response = JsonResponse({
                    'status': 'success',
                    'access': token,
                    'message': '2FA vérifié. Connexion réussie.'
                })
                response.set_cookie('access_token', token, httponly=True)
                return response
            else:
                logger.warning("Code 2FA invalide pour l'utilisateur ID: %d", user.id)
                form.add_error('code', "Code 2FA invalide.")
        else:
            logger.warning("Formulaire 2FA non valide pour l'utilisateur ID: %d", user.id)

        return render(request, 'accounts/verify_2fa_login.html', {'form': form})

    logger.warning("Méthode HTTP non prise en charge : %s", request.method)
    return redirect('accounts:login')

@login_required
def disable_2fa(request):
    logger.debug("Entre dans disable_2fa")
    user = request.user
    if not user.is_2fa_enabled:
        return JsonResponse({'status': 'error', 'message': "Le 2FA n'est pas activé sur votre compte."}, status=400)

    if request.method == 'GET':
        form = TwoFactorLoginForm()
        return render(request, 'accounts/disable_2fa.html', {'form': form})

    if request.method == 'POST':
        form = TwoFactorLoginForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                user.totp_secret = ''
                user.is_2fa_enabled = False
                user.save()
                return JsonResponse({'status': 'success', 'message': '2FA a été désactivé.'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Code 2FA invalide.'}, status=400)
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Méthode non autorisée.'}, status=405)

# ///////////////////////////----FIN 2FA----///////////////////////////////////
