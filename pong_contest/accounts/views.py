from django.shortcuts import render, redirect
from django.http import JsonResponse
from .forms import RegistrationForm, LoginForm
from .models import User
from .utils import (
    hash_password, verify_password, 
    generate_jwt_token, verify_jwt_token,
    generate_2fa_code
)
from django.core.mail import send_mail
from datetime import datetime, timedelta
import json

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
                    if user.two_factor_enabled:
                        # Generate and send 2FA code
                        code = generate_2fa_code()
                        user.two_factor_code = code
                        user.two_factor_code_timestamp = datetime.now()
                        user.save()
                        
                        # Send code via email
                        send_mail(
                            'Your 2FA Code',
                            f'Your verification code is: {code}',
                            'from@yourdomain.com',
                            [user.email],
                            fail_silently=False,
                        )
                        
                        # Store user_id in session for 2FA verification
                        request.session['pending_user_id'] = user.id
                        return redirect('accounts:verify_2fa')
                    else:
                        # Generate JWT tokens
                        access_token = generate_jwt_token(user.id, 'access')
                        refresh_token = generate_jwt_token(user.id, 'refresh')
                        
                        response = redirect('home')
                        response.set_cookie('access_token', access_token)
                        response.set_cookie('refresh_token', refresh_token)
                        return response
                else:
                    form.add_error('password', 'Mot de passe incorrect.')
            except User.DoesNotExist:
                form.add_error('username', 'Utilisateur non trouvé.')
    else:
        form = LoginForm()
    return render(request, 'accounts/log_guest.html', {'form': form})

def verify_2fa(request):
    if request.method == 'POST':
        code = request.POST.get('code')
        user_id = request.session.get('pending_user_id')
        
        if not user_id:
            return redirect('accounts:login')
            
        try:
            user = User.objects.get(id=user_id)
            code_timestamp = user.two_factor_code_timestamp
            
            if (code == user.two_factor_code and
                datetime.now() - code_timestamp < timedelta(minutes=10)):
                # Generate JWT tokens
                access_token = generate_jwt_token(user.id, 'access')
                refresh_token = generate_jwt_token(user.id, 'refresh')
                
                # Clear 2FA session data
                del request.session['pending_user_id']
                user.two_factor_code = None
                user.save()
                
                response = redirect('home')
                response.set_cookie('access_token', access_token)
                response.set_cookie('refresh_token', refresh_token)
                return response
            else:
                return render(request, 'accounts/verify_2fa.html', 
                            {'error': 'Invalid or expired code'})
                
        except User.DoesNotExist:
            return redirect('accounts:login')
            
    return render(request, 'accounts/verify_2fa.html')

def enable_2fa(request):
    token = request.COOKIES.get('access_token')
    if not token:
        return redirect('accounts:login')
        
    payload = verify_jwt_token(token)
    if not payload:
        return redirect('accounts:login')
        
    user = User.objects.get(id=payload['user_id'])
    user.two_factor_enabled = True
    user.save()
    
    return redirect('home')

def disable_2fa(request):
    token = request.COOKIES.get('access_token')
    if not token:
        return redirect('accounts:login')
        
    payload = verify_jwt_token(token)
    if not payload:
        return redirect('accounts:login')
        
    user = User.objects.get(id=payload['user_id'])
    user.two_factor_enabled = False
    user.save()
    
    return redirect('home')

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