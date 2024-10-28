# User/middleware.py
from django.utils.deprecation import MiddlewareMixin
from .models import UserProfile

class OnlineStatusMiddleware(MiddlewareMixin):
    def process_request(self, request):
        user_id = request.session.get('user_id')
        if user_id:
            try:
                profile = UserProfile.objects.get(user_id=user_id)
                profile.is_online = True
                profile.save()
            except UserProfile.DoesNotExist:
                pass

    def process_response(self, request, response):
        user_id = request.session.get('user_id')
        if user_id:
            try:
                profile = UserProfile.objects.get(user_id=user_id)
                profile.is_online = False
                profile.save()
            except UserProfile.DoesNotExist:
                pass
        return response
