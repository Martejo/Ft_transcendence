# user/decorators.py
from django.shortcuts import redirect

def login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if 'user_id' not in request.session:
            return redirect('accounts:login')
        return view_func(request, *args, **kwargs)
    return wrapper
