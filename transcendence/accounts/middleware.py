from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from datetime import timedelta, datetime
from .models import CustomUserProfile

INACTIVITY_PERIOD = timedelta(minutes=5)  # Durée après laquelle un utilisateur est considéré comme inactif

class OnlineStatusMiddleware(MiddlewareMixin):
    def process_request(self, request):
        user_id = request.session.get('user_id')
        if user_id:
            try:
                profile = CustomUserProfile.objects.get(user_id=user_id)
                # Si l'utilisateur a explicitement choisi d'être hors ligne, ne rien faire
                if not profile.is_online:
                    # Mettre à jour à `True` uniquement si l'utilisateur est actif ou revient après une période d'inactivité
                    last_activity = request.session.get('last_activity')
                    now = timezone.now()

                    if last_activity:
                        # Utiliser `fromisoformat` pour analyser la date-heure
                        last_activity = datetime.fromisoformat(last_activity)
                        if now - last_activity > INACTIVITY_PERIOD:
                            profile.is_online = True  # L'utilisateur redevient en ligne s'il interagit après une longue absence
                    else:
                        # Si `last_activity` n'est pas défini, on le considère en ligne maintenant
                        profile.is_online = True

                    profile.save()

                # Mettre à jour l'heure de la dernière activité
                request.session['last_activity'] = str(timezone.now())

            except CustomUserProfile.DoesNotExist:
                pass

    def process_response(self, request, response):
        # On ne remet plus automatiquement à `offline` dans le `process_response`
        return response
