// auth/2faLogin.js
import { requestPost, requestGet } from '../../api/index.js';
import { handleNavbar } from '../../navbar/index.js'; // Adjust the import path as necessary
import { updateHtmlContent } from '../../tools/index.js'; // Adjust the import path as necessary
// [IMPROVE] Verifier le fonction des nouvelles urls

async function submitLogin2FA(form) {
    const formData = new FormData(form);
    try {
        const response = await requestPost('accounts','2fa/login2fa', formData);
        if (response.status === 'success') {
            console.log("2fa success");
            localStorage.setItem('access_Token', response.access_token);
            localStorage.setItem('refresh_Token', response.refresh_token);
            setTimeout(async () => {
                window.isAuthenticated = true;
                // Appel à la fonction async loadNavbar avec await
                await handleNavbar();


                window.location.hash = '#game-home';
            }, 1000);
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
        const data = await requestGet('accounts', '2fa/login2fa');
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
