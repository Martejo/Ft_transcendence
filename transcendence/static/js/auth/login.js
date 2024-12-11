// auth/login.js
import Api from '../api/api.js';
import { loadNavbar } from '../modules/navbar.js';

function displayLoginErrors(errors) {
    const loginError = document.querySelector('#login-error');
    let errorMessages = '';
    for (let field in errors) {
        if (Object.prototype.hasOwnProperty.call(errors, field)) {
            errorMessages += errors[field].join('<br>') + '<br>';
        }
    }
    loginError.innerHTML = errorMessages;
}

function handleLoginResponse(response) {
    if (response.status === 'success') {
        if (response.requires_2fa) {
            window.location.hash = '#accounts-verify_2fa_login';
        } else {
            sessionStorage.setItem('accessToken', response.access);
            sessionStorage.setItem('refreshToken', response.refresh);
            setTimeout(() => {
                window.isAuthenticated = true;
                loadNavbar();
                window.location.hash = '#game-play';
            }, 500);
        }
    } else {
        if (response.errors) {
            displayLoginErrors(response.errors);
        } else if (response.message) {
            document.querySelector('#login-error').textContent = response.message;
        }
    }
}

async function submitLogin(form) {
    const validateBtn = document.querySelector('#validate-btn');
    validateBtn.disabled = true;
    validateBtn.textContent = 'Connexion...';

    const formData = new FormData(form);

    try {
        const response = await Api.post('/accounts/submit_login/', formData);
        handleLoginResponse(response);
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        document.querySelector('#login-error').innerHTML = '<p>Une erreur est survenue. Veuillez réessayer.</p>';
    } finally {
        validateBtn.disabled = false;
        validateBtn.textContent = 'Valider';
    }
}

export function initializeLoginView() {
    const form = document.querySelector('#login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitLogin(form);
    });
}
