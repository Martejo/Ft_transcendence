from django.shortcuts import render, redirect
from .forms import RegistrationForm
from django.contrib import messages

# Create your views here.
def login(request):
	return render(request, "accounts/login.html")

def logAsguest(request):
		return render(request, "accounts/log_guest.html")

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Inscription réussie. Vous pouvez maintenant vous connecter.")
            return redirect('accounts:login')
    else:
        form = RegistrationForm()
    return render(request, 'accounts/register.html', {'form': form})