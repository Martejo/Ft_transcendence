# core/views.py
from django.shortcuts import render, get_object_or_404
from django.template.loader import get_template, render_to_string
from django.http import JsonResponse, HttpResponse, HttpResponseNotFound
from django.template import TemplateDoesNotExist
from accounts.views import manage_profile_view
from django.apps import apps
import logging
import inspect
from django.views.i18n import set_language




#NEW
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


class ViewLoader:
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def is_form_view(self, view_func) -> bool:
        logger.debug("Entre dans is_form_view")
        """Check if a view function returns forms in its context"""
        if not view_func:
            return False
            
        # Get the source code of the view function
        source = inspect.getsource(view_func)
        # Check for form-related patterns
        form_patterns = ['Form(', 'form =', 'context[', '_form']
        Result = any(pattern in source for pattern in form_patterns)
        logger.debug(f"Résultat de is.form_view = {Result}" )
        return Result
    
    def find_view(self, app_name: str, view_name: str):
        logger.debug(f"Entre dans find_view {app_name}/{view_name}")
        
        """Find a view function in the app"""
        try:
            app_config = apps.get_app_config(app_name)
            views_module = app_config.module.views
            logger.debug(f"find_view -> app_config = {app_config} et views_module = {views_module}")
            
            patterns = [
                view_name,
                f'view_{view_name}',
                f'{view_name}_view',
                f'ajax_{view_name}',
                f'{view_name}_ajax'
            ]
            
            for pattern in patterns:
                logger.debug(f" PATTERN = {pattern}")
                if hasattr(views_module, pattern):
                    view_func = getattr(views_module, pattern)
                    logger.debug(f"FOUND VIEW: {pattern}")
                    return view_func
            return None
            
        except Exception as e:
            logger.debug("Error finding view: {e}")
            return None
    
    def find_template(self, app_name: str, view_name: str) -> str:
        logger.debug("Entre dans find_template")

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
        logger.debug("Entre dans handle_view")
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
                logger.debug("ENtre dans isinstance ")
                context.update(response)
                template_name = getattr(view_func, 'template_name', 'landing.html')
                return render(request, template_name, context)
            
            logger.debug(f"Réponse fin handle__view = {response}")
            return response

# Create instance
loader = ViewLoader()


def load_view(request, app: str, view_name: str):
    logger.debug("Entre dans load view")
    """Dynamic view loader that handles both regular and form views"""
	
    # Exclure explicitement les requêtes i18n/setlang
    if app == "i18n" and view_name == "setlang":
        logger.debug("Requête i18n/setlang ignorée pour permettre à Django de la gérer")
        # Appelle directement la vue set_language de Django
        return set_language(request)
    
    try:
        # Initialize basic context
        context = {
            'is_authenticated': bool(request.session.get('user_id')),
            'user_id': request.session.get('user_id')
        }
        
        logger.debug(f"Loading view: {app}/{view_name}")
        
        # Handle AJAX requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest': #Si c'est une requete AJAX
            view_func = loader.find_view(app, view_name)
            if view_func:
                logger.debug(f"Found AJAX view: {view_name}")
                return loader.handle_view(request, view_func)
            
            template_path = loader.find_template(app, view_name)
            if template_path:
                logger.debug(f"Found AJAX template: {view_name}")
                if view_name == 'enable_2fa':
                    view_func = loader.find_view(app, 'ajax_{view_name}')
                    if view_func:
                        return loader.handle_view(request, view_func)
                template = get_template(template_path)
                return HttpResponse(template.render(context, request))
            
            return JsonResponse({'error': 'View not found'}, status=404)
        
        # Handle regular requests
        view_func = loader.find_view(app, view_name)
        if view_func:
            logger.debug(f"Found regular view: {view_name}")
            return loader.handle_view(request, view_func)
        
        # Fall back to template rendering
        template_path = loader.find_template(app, view_name)
        if template_path:
            logger.debug(f"Found fallback template: {view_name}")
            return render(request, 'landing.html', {
                **context,
                'content_template': template_path
            })
        
        raise TemplateDoesNotExist(f"No template or view found for {app}/{view_name}")
        
    except TemplateDoesNotExist as e:
        logger.debug(f"Template not found: {e}")
        return HttpResponseNotFound(f"Page not found: {app}/{view_name}")
    
    except Exception as e:
        logger.debug(f"Error in load_view: {e}")
        return HttpResponse("Internal server error", status=500)

def get_navbar(request):
    logger.debug("Entre dans get_navbar_view")
    is_authenticated = request.session.get('is_authenticated', False)

    if is_authenticated:
        # Génère le HTML du burger-menu sans appeler la vue `burger_menu_view`
        burger_menu_html = render_to_string('accounts/burger_menu.html')
        return render(request, 'core/navbar_logged_in.html', {
            'burger_menu': burger_menu_html
        })
    else:
        return render(request, 'core/navbar_public.html')

def home_view(request):
    logger.debug("Entre dans home_view")
    return render(request, 'core/home.html')

def landing_view(request):
    logger.debug("Entre dans landing_view")
    user_id = request.session.get('user_id')
    is_authenticated = bool(user_id)
    return render(request, 'landing.html', {'is_authenticated': is_authenticated})
