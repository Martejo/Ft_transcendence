# core/views.py
from django.shortcuts import render
from django.template.loader import get_template
from django.http import JsonResponse, HttpResponse, HttpResponseNotFound
from django.template import TemplateDoesNotExist
from accounts.views import manage_profile_view
from django.apps import apps
import logging


#NEW
logger = logging.getLogger(__name__)

class ViewLoader:
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def is_form_view(self, view_func) -> bool:
        """Check if a view function returns forms in its context"""
        if not view_func:
            return False
            
        # Get the source code of the view function
        source = inspect.getsource(view_func)
        # Check for form-related patterns
        form_patterns = ['Form(', 'form =', 'context[', '_form']
        return any(pattern in source for pattern in form_patterns)
    
    def find_view(self, app_name: str, view_name: str):
        """Find a view function in the app"""
        try:
            app_config = apps.get_app_config(app_name)
            views_module = app_config.module.views
            
            patterns = [
                view_name,
                f'view_{view_name}',
                f'{view_name}_view',
                f'ajax_{view_name}',
                f'{view_name}_ajax'
            ]
            
            for pattern in patterns:
                if hasattr(views_module, pattern):
                    view_func = getattr(views_module, pattern)
                    print(f"Found view: {pattern}")
                    return view_func
            return None
            
        except Exception as e:
            print(f"Error finding view: {e}")
            return None
    
    def find_template(self, app_name: str, view_name: str) -> str:
        """Find template file"""
        patterns = [
            f'{app_name}/{view_name}.html',
            f'{app_name}/views/{view_name}.html',
            f'{view_name}.html'
        ]
        
        for pattern in patterns:
            try:
                get_template(pattern)
                return pattern
            except TemplateDoesNotExist:
                continue
        return None
    
    def handle_view(self, request, view_func):
        """Handle view execution with proper context"""
        if self.is_form_view(view_func):
            # If it's a form view, call it directly to get proper form initialization
            return view_func(request)
        else:
            # For non-form views, add standard context
            context = {
                'is_authenticated': bool(request.session.get('user_id')),
                'user_id': request.session.get('user_id')
            }
            # Call the view and get its response
            response = view_func(request)
            
            # If the view returns a dict, it's expecting template rendering
            if isinstance(response, dict):
                context.update(response)
                template_name = getattr(view_func, 'template_name', 'landing.html')
                return render(request, template_name, context)
            
            return response

# Create instance
loader = ViewLoader()

def load_view(request, app: str, view_name: str):
    """Dynamic view loader that handles both regular and form views"""
    try:
        # Initialize basic context
        context = {
            'is_authenticated': bool(request.session.get('user_id')),
            'user_id': request.session.get('user_id')
        }
        
        print(f"Loading view: {app}/{view_name}")
        
        # Handle AJAX requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            view_func = loader.find_view(app, f'ajax_{view_name}')
            if view_func:
                return loader.handle_view(request, view_func)
            
            template_path = loader.find_template(app, view_name)
            if template_path:
                template = get_template(template_path)
                return HttpResponse(template.render(context, request))
            
            return JsonResponse({'error': 'View not found'}, status=404)
        
        # Handle regular requests
        view_func = loader.find_view(app, view_name)
        if view_func:
            return loader.handle_view(request, view_func)
        
        # Fall back to template rendering
        template_path = loader.find_template(app, view_name)
        if template_path:
            return render(request, 'landing.html', {
                **context,
                'content_template': template_path
            })
        
        raise TemplateDoesNotExist(f"No template or view found for {app}/{view_name}")
        
    except TemplateDoesNotExist as e:
        print(f"Template not found: {e}")
        return HttpResponseNotFound(f"Page not found: {app}/{view_name}")
    
    except Exception as e:
        print(f"Error in load_view: {e}")
        return HttpResponse("Internal server error", status=500)

def home_view(request):
    return render(request, 'core/home.html')

def landing_view(request):
    user_id = request.session.get('user_id')
    is_authenticated = bool(user_id)
    return render(request, 'landing.html', {'is_authenticated': is_authenticated})


#Ancienne load_view

# Attention ! 
# Enorme difference entre rendre un template est vue dynamique 

# Inutile de rendre un template a la con, nous pouvons envoyer les vues directement . 
# Trouver une maniere d' appeller de maniere generic
# def load_view(request, app, view_name):
#     try:
#         if view_name == 'gestion_profil':
#             # Rendre une vue Django directement dans le cas
#             return manage_profile_view(request)
#         else:
#             # Autre vue à charger
#             template = get_template(f'{app}/{view_name}.html')
#             return HttpResponse(template.render({}, request))

#     except TemplateDoesNotExist:
#         return HttpResponseNotFound("Vue non trouvée")