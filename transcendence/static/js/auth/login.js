// auth/login.js
//import Api from '../api/api.js';

import { requestGet, requestPost } from '../api/index.js';
import { handleNavbar } from '../navbar/index.js';
import { updateHtmlContent } from '../tools/index.js'


/**
 * Affiche les erreurs de connexion reçues du serveur dans la zone prévue pour les erreurs.
 * @param {Object} errors - Un objet contenant les erreurs retournées par le serveur.
 */
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


/**
 * Gère la réponse du serveur après une tentative de connexion.
 * Redirige l'utilisateur en fonction du statut de la connexion ou affiche des messages d'erreur.
 * @param {Object} response - La réponse du serveur après soumission du formulaire de connexion.
 */
async function handleLoginResponse(response) {
    console.log('handleLoginResponse');
    if (response.status === 'success') {
        if (response.requires_2fa) {
            window.location.hash = '#accounts-verify_2fa_login';
        } 
        else {
            console.log("Access token = ", response.access_token);
            localStorage.setItem('access_token', response.access_token);
            //[IMPROVE]Dois t on renvoyer des tokens refresh a chaque nouvelle connexion ?
            localStorage.setItem('refresh_token', response.refresh_token);

            setTimeout(async () => {
                window.isAuthenticated = true;

                // Appel à la fonction async loadNavbar avec await
                await handleNavbar();

                window.location.hash = '#game-home';
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



/**
 * Soumet le formulaire de connexion au serveur via une requête POST.
 * Désactive le bouton de validation pendant le traitement et gère les erreurs éventuelles.
 * @param {HTMLFormElement} form - Le formulaire de connexion soumis par l'utilisateur.
 */
async function submitLogin(form) {
    console.log('submitLogin');
    const validateBtn = document.querySelector('#validate-btn');
    validateBtn.disabled = true;
    validateBtn.textContent = 'Connexion...';

    const formData = new FormData(form);

    try {
        
        const response = await requestPost('accounts','submit_login', formData);
        console.log('Reponse de la requete POST submit_login :', response);
        handleLoginResponse(response);
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        document.querySelector('#login-error').innerHTML = '<p>Une erreur est survenue. Veuillez réessayer.</p>';
    } finally {
        validateBtn.disabled = false;
        validateBtn.textContent = 'Valider';
    }
}

// [IMPROVE] Verifier le fonction des nouvelles urls
export async function initializeLoginView() {
    let data;
    try {
        data = await requestGet('accounts', 'login')
        updateHtmlContent('#content', data.html)

        // if (data && data.html)
        // {
        //     updateHtmlContent('#content', data.html)
        // }
        // else
        // {
        //     console.error('Les données HTML de la page d\'accueil sont manquantes.');
        // }
    } catch (error) {
        
        // [IMPROVE] Faire un gestionnaire d'erreurs 
        console.error('Erreur lors de la requete API initializeLoginView :', error);
    }

    const form = document.querySelector('#login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Soumission du formulaire de connexion');
        submitLogin(form);
    });


    const forgotPasswordLink = document.querySelector('#forgot-password-link');
    if (!forgotPasswordLink) return;

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault(); // Empêche le comportement par défaut du lien
        // Exemple d'action : Redirection ou affichage d'une modale
        alert("Redirection vers la page de récupération de mot de passe."); // À remplacer par votre logique
        // window.location.href = '/accounts/forgot_password/';
    });

    console.log('Fin de initializeLoginView');
}
