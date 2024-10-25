from django.shortcuts import render, redirect
from .forms import RegistrationForm
from .models import User
from .forms import LoginForm

from .utils import hash_password
from .utils import verify_password

# Create your views here.

def logingMenu(request):
        return render(request, 'accounts/login.html')

def logout_view(request):
    try:
        del request.session['user_id']
    except KeyError:
        pass
    return redirect('home')


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            try:
                user = User.objects.get(username=username)
                if verify_password(user.password_hash, password):
                    # Enregistrer la session utilisateur
                    request.session['user_id'] = user.id
                    return redirect('home')
                else:
                    form.add_error('password', 'Mot de passe incorrect.')
            except User.DoesNotExist:
                form.add_error('username', 'Utilisateur non trouvé.')
    else:
        form = LoginForm()
    return render(request, 'accounts/log_guest.html', {'form': form})

def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            # Hacher le mot de passe
            password_hash = hash_password(password)
            # Créer l'utilisateur
            User.objects.create(
                username=username,
                email=email,
                password_hash=password_hash
            )
            # Rediriger vers la page de connexion ou autre
            return redirect('accounts:login')
    else:
        form = RegistrationForm()
    return render(request, 'accounts/register.html', {'form': form})

def protected_view(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')
    # Récupérer l'utilisateur
    user = User.objects.get(id=user_id)
    # Votre logique ici
    return render(request, 'protected.html', {'user': user})
