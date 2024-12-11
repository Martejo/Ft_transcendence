// auth/2faDisable.js
import Api from '../api/api.js';

async function submitDisable2FA(form) {
    const formData = new FormData(form);
    try {
        const response = await Api.post('/accounts/disable_2fa/', formData);
        if (response.status === 'success') {
            alert(response.message);
            window.location.hash = '#accounts-gestion_profil';
        } else {
            alert(response.message);
        }
    } catch (error) {
        console.error('Erreur disable 2FA:', error);
        alert(error.message || 'Une erreur est survenue');
    }
}

export function initializeDisable2FAView() {
    document.addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'disable-2fa') {
            e.preventDefault();
            submitDisable2FA(e.target);
        }
    });
}