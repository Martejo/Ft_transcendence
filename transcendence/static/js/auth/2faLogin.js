// auth/2faLogin.js
import { requestPost, requestGet } from '../api/index.js';
import { loadNavbar } from '../navbar/index.js'; // Adjust the import path as necessary
import { updateHtmlContent } from '../tools/index.js'; // Adjust the import path as necessary
// [IMPROVE] Verifier le fonction des nouvelles urls

async function submitLogin2FA(form) {
    const formData = new FormData(form);
    try {
        const response = await requestPost('accounts','verify_2fa_login', formData);
        if (response.status === 'success') {
            localStorage.setItem('accessToken', response.access);
            localStorage.setItem('refreshToken', response.refresh);
            setTimeout(() => {
                window.isAuthenticated = true;
                loadNavbar();
                window.location.hash = '#game-play';
            }, 500);
        } else {
            alert(response.message);
        }
    } catch (error) {
        console.error('Erreur login 2FA:', error);
        alert(error.message || 'Une erreur est survenue');
    }
}

export async function initializeLogin2FAView() {
    try {
        const data = await requestGet('accounts', 'login2fa');
        updateHtmlContent('#content', data.html)
    } catch (error) {
        
        // [IMPROVE] Faire un gestionnaire d'erreurs
        console.error('Erreur lors de la requete API initializeLoginView :', error);
    }
    
    document.addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'login-2fa-form') {
            e.preventDefault();
            submitLogin2FA(e.target);
        }
    });
}
