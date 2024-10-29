# User/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from .models import User, UserProfile, FriendRequest, Game, MatchHistory
from .forms import RegistrationForm, LoginForm, ProfileForm, AvatarUpdateForm, PasswordChangeForm  # Ajoutez PasswordChangeForm ici
from .utils import hash_password, verify_password
from .decorators import login_required

def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.password_hash = hash_password(form.cleaned_data['password'])
            user.save()
            UserProfile.objects.create(user=user)  # Crée un profil vide par défaut
            return redirect('User:login')
    else:
        form = RegistrationForm()
    return render(request, 'User/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            try:
                user = User.objects.get(username=username)
                if verify_password(user.password_hash, password):
                    request.session['user_id'] = user.id
                    messages.success(request, 'Vous êtes connecté avec succès.')
                    return redirect('User:profile', username=user.username)  # Correction ici
                else:
                    form.add_error('password', 'Mot de passe incorrect.')
            except User.DoesNotExist:
                form.add_error('username', 'Utilisateur non trouvé.')
    else:
        form = LoginForm()
    return render(request, 'User/login.html', {'form': form})

@login_required
def logout_view(request):
    if request.method == 'POST':
        try:
            del request.session['user_id']
            messages.success(request, 'Vous êtes déconnecté avec succès.')
        except KeyError:
            messages.error(request, 'Vous n\'êtes pas connecté.')
        return redirect('landing')
    else:
        # Si la requête n'est pas POST, redirigez ou retournez une erreur
        return redirect('User:profile', username=request.user.username)

@login_required
def update_profile_view(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Votre profil a été mis à jour avec succès.')
            return redirect('User:profile', username=user.username)
        else:
            messages.error(request, 'Veuillez corriger les erreurs ci-dessous.')
    else:
        form = ProfileForm(instance=user)

    return render(request, 'User/update_profile.html', {'form': form, 'profile_user': user})


@login_required
def change_password_view(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        form = PasswordChangeForm(request.POST)
        if form.is_valid():
            old_password = form.cleaned_data['old_password']
            new_password = form.cleaned_data['new_password']

            if verify_password(user.password_hash, old_password):
                user.password_hash = hash_password(new_password)
                user.save()
                messages.success(request, 'Votre mot de passe a été mis à jour avec succès.')
                return redirect('User:profile', username=user.username)
            else:
                form.add_error('old_password', 'L\'ancien mot de passe est incorrect.')
                messages.error(request, 'Veuillez corriger les erreurs ci-dessous.')
        else:
            messages.error(request, 'Veuillez corriger les erreurs ci-dessous.')
    else:
        form = PasswordChangeForm()

    return render(request, 'User/change_password.html', {'form': form, 'profile_user': user})


@login_required
def profile_view(request, username):
    user = get_object_or_404(User, username=username)
    return render(request, 'User/profile.html', {'profile_user': user})

@login_required
def match_history_view(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('User:login')
    
    user = get_object_or_404(User, id=user_id)
    match_histories = user.match_histories.all().order_by('-played_at')
    
    return render(request, 'User/match_history.html', {'match_histories': match_histories})

# Vues supplémentaires pour la gestion des amis
@login_required
def send_friend_request(request, to_user_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('User:login')
    
    from_user = get_object_or_404(User, id=user_id)
    to_user = get_object_or_404(User, id=to_user_id)
    
    FriendRequest.objects.create(from_user=from_user, to_user=to_user)
    return redirect('User:profile', username=to_user.username)

@login_required
def accept_friend_request(request, request_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('User:login')
    
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user_id=user_id)
    friend_request.status = 'accepted'
    friend_request.save()
    
    from_user = friend_request.from_user
    to_user = friend_request.to_user
    from_user.profile.friends.add(to_user)
    to_user.profile.friends.add(from_user)
    
    return redirect('User:profile', username=from_user.username)

@login_required
def reject_friend_request(request, request_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('User:login')
    
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user_id=user_id)
    friend_request.status = 'rejected'
    friend_request.save()
    
    return redirect('User:profile', username=friend_request.from_user.username)

@login_required
def update_avatar_view(request):
    user_id = request.session.get('user_id')
    user = get_object_or_404(User, id=user_id)
    
    if request.method == 'POST':
        form = AvatarUpdateForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Votre avatar a été mis à jour avec succès.')
            return redirect('User:profile', username=user.username)
        else:
            messages.error(request, 'Il y a eu une erreur lors de la mise à jour de votre avatar.')
    else:
        form = AvatarUpdateForm(instance=user)
    
    return render(request, 'User/update_avatar.html', {'form': form, 'profile_user': user})


def log_guest_view(request):
    # Logique pour connecter un utilisateur en tant qu'invité
    if request.method == 'POST':
        # Par exemple, créer un utilisateur temporaire ou utiliser un compte invité prédéfini
        guest_user, created = User.objects.get_or_create(username='guest', defaults={
            'email': 'guest@example.com',
            'password_hash': hash_password('guestpassword'),
        })
        request.session['user_id'] = guest_user.id
        return redirect('home')  # Rediriger vers la page d'accueil ou autre
    return render(request, 'User/login.html')  # Ou une autre page si nécessaire