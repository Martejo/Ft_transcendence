import { requestGet, requestPost } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';

function showVerificationSuccess() {
    const successElem = document.querySelector('.verification-success');
    if (successElem) {
        successElem.textContent = '2FA activé avec succès!';
        successElem.style.display = 'block';
        setTimeout(() => {
            successElem.style.display = 'none';
            window.location.hash = '#accounts-profile'; // Redirection vers la page de gestion de profil
        }, 2000); // Attends 2 secondes avant de rediriger
    }
}

function showVerificationError(message) {
    const errorElem = document.querySelector('.verification-error');
    if (errorElem) {
        errorElem.textContent = message || 'Une erreur est survenue';
        errorElem.style.display = 'block';
    }
}

async function handle2FAVerification(event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire
    const form = event.target; // Récupère le formulaire
    const formData = new FormData(form); // Prépare les données du formulaire

    try {
        const response = await requestPost('accounts', '2fa/check', formData); // Envoie la requête POST
        if (response.status === 'success') {
            showVerificationSuccess(); // Affiche le message de succès
        } else {
            showVerificationError(response.message || 'Code 2FA incorrect.');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification 2FA:', error);
        showVerificationError('Erreur réseau ou serveur.');
    }
}

export async function initializeEnable2FAView() {
    console.log('Initialisation de la vue d\'activation de la 2FA');
    try {
        const response = await requestGet('accounts', '2fa/enable'); // Charge la vue 2FA
        if (response.status === 'success' && response.html) {
            updateHtmlContent('#content', response.html);

            // Attache l'événement de soumission au formulaire de vérification
            const verifyForm = document.querySelector('#verify-2fa-form');
            if (verifyForm) {
                verifyForm.addEventListener('submit', handle2FAVerification);
            } else {
                console.error('Formulaire de vérification 2FA introuvable.');
            }
        } else {
            console.error('Erreur dans la réponse du serveur:', response);
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la vue enable 2fa:', error);
    }
}
