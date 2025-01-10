import { requestGet, requestPost } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';
import { displayErrors, showDisableSuccess, showDisableError } from './notifications.js';

// Gestionnaire principal pour désactiver la 2FA
export async function handleDisable2FA() {
    console.log('Désactivation de la 2FA...');
    try {
        // Charge la vue de désactivation de la 2FA
        await loadDisable2FAView();
    } catch (error) {
        console.error('Erreur dans handleDisable2FA:', error);
        displayErrors('#content', 'Erreur lors de la désactivation de la 2FA.');
    }
}

// Fonction pour charger la vue de désactivation de la 2FA
async function loadDisable2FAView() {
    console.log('Chargement de la vue de désactivation de la 2FA...');
    try {
        const response = await requestGet('accounts', '2fa/disable');
        if (response.status === 'success' && response.html) {
            updateHtmlContent('#content', response.html);
            attachDisable2FAEvent(); // Attache l'événement de soumission
        } else {
            throw new Error(response.message || 'Erreur lors du chargement de la vue de désactivation de la 2FA.');
        }
    } catch (error) {
        console.error('Erreur dans loadDisable2FAView:', error);
        throw error; // Propagation de l'erreur pour gestion dans handleDisable2FA
    }
}

// Fonction pour attacher l'événement de soumission au formulaire
function attachDisable2FAEvent() {
    const disable2FAForm = document.querySelector('#disable-2fa-form');
    if (disable2FAForm) {
        disable2FAForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await submitDisable2FA(disable2FAForm);
            } catch (error) {
                console.error('Erreur dans submitDisable2FA:', error);
                showDisableError('Une erreur est survenue lors de la soumission.');
            }
        });
    } else {
        console.error('Formulaire de désactivation 2FA introuvable.');
    }
}

// Fonction pour soumettre le formulaire de désactivation de la 2FA
async function submitDisable2FA(form) {
    const formData = new FormData(form);
    console.log('Soumission du formulaire de désactivation de la 2FA...');
    try {
        const response = await requestPost('accounts', '2fa/disable', formData);
        if (response.status === 'success') {
            showDisableSuccess(); // Affiche le message de succès
        } else {
            throw new Error(response.message || 'Échec de la désactivation de la 2FA.');
        }
    } catch (error) {
        console.error('Erreur dans submitDisable2FA:', error);
        throw error; // Propagation de l'erreur pour gestion dans attachDisable2FAEvent
    }
}
