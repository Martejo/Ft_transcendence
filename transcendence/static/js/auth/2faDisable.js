// auth/2faDisable.js
import { requestPost, requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';

// [IMPROVE] Verifier le fonction des nouvelles urls

function showDisableSuccess() {
    const successElem = document.querySelector('.verification-success');
    if (successElem) {
        successElem.textContent = '2FA désactivée avec succès!';
        successElem.style.display = 'block';
        setTimeout(() => {
            successElem.style.display = 'none';
            window.location.hash = '#accounts-profile'; // Redirection vers la page de gestion de profil
        }, 2000); // Attends 2 secondes avant de rediriger
    }
}

function showDisableError(message) {
    const errorElem = document.querySelector('.verification-error');
    if (errorElem) {
        errorElem.textContent = message || 'Une erreur est survenue lors de la désactivation de la 2FA.';
        errorElem.style.display = 'block';
    }
}

async function submitDisable2FA(form) {
    const formData = new FormData(form);
    console.log('Submitting disable 2FA with form data'); // Log form data for debugging
    try {
        const response = await requestPost('accounts','2fa/disable', formData);
        if (response.status === 'success') {
            showDisableSuccess(); // Affiche le message de succès
        } else {
            showDisableError(response.message || 'Échec de la désactivation de la 2FA.');

        }
    } catch (error) {
        console.error('Erreur lors de la désactivation de la 2FA:', error);
        showDisableError('Erreur réseau ou serveur.');
    }
}

export async function initializeDisable2FAView() {
    console.log('initializeDisable2FAView called');
    try {
            const response = await requestGet('accounts', '2fa/disable'); // Charge la vue 2FA
            if (response.status === 'success' && response.html) {
                updateHtmlContent('#content', response.html);
            } else {
                console.error('Erreur dans la réponse du serveur:', response);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la vue disable 2fa:', error);
        }
        document.addEventListener('submit', function(e) {
            if (e.target && e.target.id === 'disable-2fa-form') {
                e.preventDefault();
                submitDisable2FA(e.target);
            }
        });
}

