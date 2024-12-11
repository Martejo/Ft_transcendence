// auth/2faLogin.js
import Api from '../api/api.js';

async function submitLogin2FA(form) {
    const formData = new FormData(form);
    try {
        const response = await Api.post('/accounts/verify_2fa_login/', formData);
        if (response.status === 'success') {
            sessionStorage.setItem('accessToken', response.access);
            sessionStorage.setItem('refreshToken', response.refresh);
            setTimeout(() => {
                window.isAuthenticated = true;
                window.location.hash = '#accounts-profile';
            }, 500);
        } else {
            alert(response.message);
        }
    } catch (error) {
        console.error('Erreur login 2FA:', error);
        alert(error.message || 'Une erreur est survenue');
    }
}

export function initializeLogin2FAView() {
    document.addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'login-2fa-form') {
            e.preventDefault();
            submitLogin2FA(e.target);
        }
    });
}
