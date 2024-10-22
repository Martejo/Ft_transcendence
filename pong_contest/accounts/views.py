from django.shortcuts import render

# Create your views here.
def login(request):
	return render(request, "accounts/login.html")

def logAsguest(request):
		return render(request, "accounts/log_guest.html")

def register(request):
	return render(request, "accounts/register.html")