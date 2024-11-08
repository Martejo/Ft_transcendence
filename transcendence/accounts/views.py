# accounts/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import authenticate, login
from .models import CustomUser, CustomUserProfile, FriendRequest, Game, MatchHistory
from .forms import RegistrationForm, LoginForm, ProfileForm, AvatarUpdateForm, PasswordChangeForm, Two_factor_login_Form  # Ajoutez PasswordChangeForm ici
from .utils import hash_password, verify_password
from .decorators import login_required
from io import BytesIO
from datetime import datetime, timedelta
import hashlib
import pyotp
import jwt
import qrcode
import base64
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_POST



@csrf_protect
@require_POST
def submit_registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.password_hash = hash_password(form.cleaned_data['password'])
            user.save()
            CustomUserProfile.objects.create(user=user)  # Crée un profil vide par défaut
            return JsonResponse({'success': True})
        else:
            # Renvoyer les erreurs du formulaire
            return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = RegistrationForm()
    return render(request, 'accounts/register.html', {'form': form})

@csrf_protect
def register_view(request):
    form = RegistrationForm() # genere un form vide et le donne au html
    return render(request, 'accounts/register.html', {'form': form})


@csrf_protect
def login_view(request):
    if request.method == 'GET':
        form = LoginForm()
        return render(request, 'accounts/login.html', {'form': form})
    else:
        return JsonResponse({'success': False, 'error': 'Méthode non autorisée'}, status=405)

@csrf_protect
@require_POST
def submit_login(request):
    form = LoginForm(request.POST)
    if form.is_valid():
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        try:
            user = CustomUser.objects.get(username=username)
            if verify_password(user.password_hash, password):
                request.session['user_id'] = user.id
                if user.is_2fa_enabled:
                    request.session['auth_partial'] = True
                    return JsonResponse({'success': True, 'requires_2fa': True})
                else:
                    return JsonResponse({'success': True, 'requires_2fa': False})
            else:
                return JsonResponse({'success': False, 'error': 'Mot de passe incorrect'})
        except CustomUser.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Identifiants incorrects'})
    else:
        # Renvoyer les erreurs du formulaire
        return JsonResponse({'success': False, 'errors': form.errors})

@login_required
def logout_view(request):
    if 'user_id' in request.session:
        del request.session['user_id']
    return JsonResponse({'success': True})

############ Gestion de profil #############

#Renvoie la page gestion de profil + formulaire
@csrf_protect
@login_required
def manage_profile_view(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)
    
    if request.method == 'GET':
        profile_form = ProfileForm(instance=user)
        password_form = PasswordChangeForm()
        avatar_form = AvatarUpdateForm(instance=user)
        context = {
            'profile_form': profile_form,
            'password_form': password_form,
            'avatar_form': avatar_form,
            'profile_user': user,
            #Rajouter form pour changement de pseudo
        }
        print("Profile Form:", profile_form)
        print("Password Form:", password_form)

        return render(request, 'accounts/gestion_profil.html', context)
    else:
        return JsonResponse({'success': False, 'error': 'Méthode non autorisée'}, status=405)

# Met à jour le profil
@csrf_protect
@login_required
def update_profile_view(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Votre profil a été mis à jour avec succès.')
            return redirect('accounts:profile', username=user.username)
        else:
            messages.error(request, 'Veuillez corriger les erreurs ci-dessous.')
    else:
        form = ProfileForm(instance=user)

    return render(request, 'accounts/update_profile.html', {'form': form, 'profile_user': user})

# Changer le mot de passe
@csrf_protect
@login_required
def change_password_view(request):
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
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'error': 'L\'ancien mot de passe est incorrect.'})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    else:
        return JsonResponse({'success': False, 'error': 'Méthode non autorisée'}, status=405)

@csrf_protect
@login_required
def update_avatar_view(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(CustomUser, id=user_id)
    
    if request.method == 'POST':
        form = AvatarUpdateForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    else:
        return JsonResponse({'success': False, 'error': 'Méthode non autorisée'}, status=405)

@csrf_protect
@login_required
def enable_2fa(request):

    user_id = request.session.get('user_id')

    if not user_id:
        messages.error(request, 'No user found')
        return redirect('accounts:login')

    if request.method == 'POST':
        # Generate TOTP secret
        totp_secret = pyotp.random_base32()
        
        # Create TOTP object
        totp = pyotp.TOTP(totp_secret)
        
        # Create JWT with the TOTP secret
        token = jwt.encode({
            'user_id' : user_id,
            'totp_secret': totp_secret,
            'exp': datetime.utcnow() + timedelta(minutes=5)  # Give user 5 minutes to set up
        }, JWT_SECRET, algorithm='HS256')
        
        # Store token in session
        request.session['setup_token'] = token
        
        # Generate QR code
        provisioning_uri = totp.provisioning_uri(
            name="Transcendence",
            issuer_name="ggwp"
        )
        img = qrcode.make(provisioning_uri)
        
        # Convert QR to display in template
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_code = base64.b64encode(buffered.getvalue()).decode()
        
        # Show QR and secret
        return render(request, 'accounts/show_qr.html', {
            'qr_code': qr_code,
            'secret': totp_secret
        })
    
    return render(request, 'accounts/enable_2fa.html')

@csrf_protect
@login_required
def verify_2fa(request):
    setup_token = request.session.get('setup_token')
    
    if not setup_token:
        messages.error(request, 'No 2FA setup in progress')
        return redirect('accounts:register') #redirect vers profile?
    
    try:
        # Get TOTP secret from JWT
        payload = jwt.decode(setup_token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload['user_id']
        totp_secret = payload['totp_secret']

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            messages.error(request, 'User not found')
            return redirect('accounts:register')

        if request.method == 'POST':
            # Get code from form
            entered_code = request.POST.get('code')
            
            # Verify TOTP code
            totp = pyotp.TOTP(totp_secret)
            if totp.verify(entered_code):
                # Success! Here you would normally save the secret for future use
                user.totp_secret = totp_secret
                user.is_2fa_enabled = True
                user.save()

                del request.session['setup_token']
                messages.success(request, '2FA setup successful!')
                return redirect('accounts:profile', username=user.username)
            else:
                messages.error(request, 'Invalid code')
                
    except jwt.ExpiredSignatureError:
        del request.session['setup_token']
        messages.error(request, 'Setup expired. Please try again.')
        return redirect('accounts:register')
    except jwt.InvalidTokenError:
        del request.session['setup_token']
        messages.error(request, 'Invalid session. Please try again.')
        return redirect('accounts:register')
    
    return render(request, 'accounts/verify_2fa.html')

@csrf_protect
def verify_2fa_login(request):
    user_id = request.session.get('user_id')
    auth_partial = request.session.get('auth_partial')

    if not user_id or not auth_partial:
        return redirect('accounts:login')

    try:
        user = CustomUser.objects.get(id=user_id)

        if not user.totp_secret:
            messages.error(request, '2FA not properly set up')
            return redirect('accounts:login')

        # totp = pyotp.TOTP(user.totp_secret)

        if request.method == 'POST':
            code = request.POST.get('code')
            totp = pyotp.TOTP(user.totp_secret)

            if totp.verify(code):
                del request.session['auth_partial']
                return redirect ('accounts:profile', username=user.username)
            else:
                messages.error(request, 'Invalid 2FA code')
    except CustomUser.DoesNotExist:
        request.session.flush()
        return redirect('accounts:login')

    return render(request, 'accounts/verify_2fa_login.html')

@csrf_protect
@login_required
def disable_2fa(request):
    user_id = request.session.get('user_id')
    
    # Fetch the user using user_id
    user = get_object_or_404(CustomUser, id=user_id)
    
    is_2fa_enabled = user.is_2fa_enabled

    if not is_2fa_enabled:
        messages.error(request, 'Le 2FA n\'est pas activé sur votre compte')
        return redirect('accounts:profile', username=user.username)
    
    if request.method == 'POST':
        code = request.POST.get('code')
        totp = pyotp.TOTP(user.totp_secret)
        
        if totp.verify(code):
            user.totp_secret = ''  # Clear the TOTP secret to disable 2FA
            user.is_2fa_enabled = False  # Also set is_2fa_enabled to False
            user.save()
            messages.success(request, 'Le 2FA a été désactivé')
            return redirect('accounts:profile', username=user.username)
        else:
            messages.error(request, 'Code 2FA invalide')

    return render(request, 'accounts/disable_2fa.html', {'username': user.username})

############## Fin de gestion de profil ###############
@login_required
def profile_view(request, username):
    user = get_object_or_404(CustomUser, username=username)
    is_2fa_enabled = user.is_2fa_enabled
    return render(request, 'accounts/profile.html', {'profile_user': user, 'is_2fa_enabled' : is_2fa_enabled})

@login_required
def match_history_view(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('accounts:login')
    
    user = get_object_or_404(CustomUser, id=user_id)
    match_histories = user.match_histories.all().order_by('-played_at')
    
    return render(request, 'accounts/match_history.html', {'match_histories': match_histories})

# Vues supplémentaires pour la gestion des amis
@login_required
def send_friend_request(request, to_user_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('accounts:login')
    
    from_user = get_object_or_404(CustomUser, id=user_id)
    to_user = get_object_or_404(CustomUser, id=to_user_id)
    
    FriendRequest.objects.create(from_user=from_user, to_user=to_user)
    return redirect('accounts:profile', username=to_user.username)

@login_required
def accept_friend_request(request, request_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('accounts:login')
    
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
    if not user_id:
        return redirect('accounts:login')
    
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user_id=user_id)
    friend_request.status = 'rejected'
    friend_request.save()
    
    return redirect('accounts:profile', username=friend_request.from_user.username)


def log_guest_view(request):
    # Logique pour connecter un utilisateur en tant qu'invité
    if request.method == 'POST':
        # Par exemple, créer un utilisateur temporaire ou utiliser un compte invité prédéfini
        guest_user, created = CustomUser.objects.get_or_create(username='guest', defaults={
            'email': 'guest@example.com',
            'password_hash': hash_password('guestpassword'),
        })
        request.session['user_id'] = guest_user.id
        return redirect('home')  # Rediriger vers la page d'accueil ou autre
    return render(request, 'accounts/login.html')  # Ou une autre page si nécessaire
