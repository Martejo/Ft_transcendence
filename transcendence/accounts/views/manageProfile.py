# ---- Imports standard ----
import logging

# ---- Imports tiers ----
from django.template.loader import render_to_string
from django.views import View
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.db.models import Max
from django.contrib.auth import update_session_auth_hash, logout
from django.contrib.auth import get_user_model

# ---- Imports locaux ----
from accounts.forms import ProfileForm, PasswordChangeForm, AvatarUpdateForm

# ---- Configuration ----
logger = logging.getLogger(__name__)
User = get_user_model()


# @method_decorator(csrf_protect, name='dispatch')
# class ProfileView(View):
#     """
#     Class-Based View (CBV) for displaying the user's profile.
#     Returns both JSON data and rendered HTML.
#     """
#     def get(self, request):
#         """
#         Handle GET request to fetch and return the user's profile information.
#         """
#         logger.debug("Entering ProfileView.get()")
#         try:
#             user = request.user
#             logger.info(f"Utilisateur trouvé: {user.username}")

#             # Calculer des données supplémentaires pour l'utilisateur
#             match_count = user.match_histories.count()
#             victories = user.match_histories.filter(result='win').count()
#             defeats = user.match_histories.filter(result='loss').count()
#             best_score = user.games_as_player1.aggregate(Max('score_player1'))['score_player1__max'] or 0

#             friends_count = user.friends.count()

#             logger.info(f"Statistiques calculées: match_count={match_count}, victories={victories}, defeats={defeats}, best_score={best_score}, friends_count={friends_count}")

#             default_avatar = '/media/avatars/default_avatar.png'
        
#             # Render HTML from template
#             rendered_html = render_to_string('accounts/profile.html')

#             # Prepare the response JSON
#             response_data = {
#                 'username': user.username,
#                 'email': user.email,
#                 'avatar_url': user.avatar.url if user.avatar else default_avatar,
#                 'is_2fa_enabled': user.is_2fa_enabled,
#                 'match_count': match_count,
#                 'victories': victories,
#                 'defeats': defeats,
#                 'best_score': best_score,
#                 'friends_count': friends_count,
#             }

#             return JsonResponse({
#                 'status': 'success',
#                 'data': response_data,
#                 'html': rendered_html,  # Include rendered HTML
#             }, status=200)

#         except Exception as e:
#             # Log the error and return a generic error message
#             logger.error(f"Error loading user profile: {e}")
#             return JsonResponse({'status': 'error', 'message': 'An error occurred while loading the profile.'}, status=500)


class ManageProfileView(View):
    """
    Display and manage profile-related forms.
    """

    def get(self, request):
        user = request.user
        profile_form = ProfileForm(instance=user)
        password_form = PasswordChangeForm()
        avatar_form = AvatarUpdateForm(instance=user)

        # Render HTML as a string
        rendered_html = render_to_string('accounts/gestion_profil.html', {
            'profile_form': profile_form,
            'password_form': password_form,
            'avatar_form': avatar_form,
            'profile_user': user,
        })

        return JsonResponse({
            'status': 'success',
            'html': rendered_html
        })


class UpdateProfileView(View):
    """
    Handle updates to user profile information.
    """

    def post(self, request):
        user = request.user
        form = ProfileForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Profil mis à jour avec succès.'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors})


class DeleteAccountView(View):
    """
    Handle account deletion.
    """

    def delete(self, request):
        user = request.user
        user.delete()
        logout(request)
        return JsonResponse({'status': 'success', 'message': 'Votre compte a été supprimé avec succès.'})

class ChangePasswordView(View):
    """
    Handle password changes using Django's built-in functions.
    """

    def post(self, request):
        user = request.user  # Récupérer l'utilisateur authentifié
        form = PasswordChangeForm(user, request.POST)  # Formulaire standard pour changer le mot de passe

        if form.is_valid():
            # Met à jour le mot de passe et hache automatiquement
            form.save()
            update_session_auth_hash(request, user)  # Maintient la session active après la mise à jour
            return JsonResponse({'status': 'success', 'message': 'Mot de passe mis à jour avec succès.'})

        # Retourner les erreurs si le formulaire est invalide
        return JsonResponse({'status': 'error', 'errors': form.errors})


class UpdateAvatarView(View):
    """
    Handle avatar updates.
    """
    def post(self, request):
        user = request.user
        form = AvatarUpdateForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'message': 'Avatar mis à jour avec succès.'})
        return JsonResponse({'status': 'error', 'errors': form.errors})
