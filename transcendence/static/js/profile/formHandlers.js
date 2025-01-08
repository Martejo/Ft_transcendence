// profile/formHandlers.js
import { requestPost } from '../api/index.js';
import { initializeEnable2FAView, initializeDisable2FAView, handleDeleteAccount } from '../auth/index.js';


// [IMPROVE] Si l'utilisateur change son username, en théorie il faudrait le déconnecter puis le faire reconnecter pour générer un nouveau token avec le nouveau username.



// attache les evenements aux boutons 2FA et de suppression de compte une seule fois
function attachProfileEvents() {
    // Bouton Activer 2FA
    const enable2FABtn = document.querySelector('#enable-2fa-btn');
    if (enable2FABtn) {
        enable2FABtn.addEventListener('click', () => {
            console.log('Enable 2FA button clicked');
            handle2FA('enable');
        });
    }

    // Bouton Désactiver 2FA
    const disable2FABtn = document.querySelector('#disable-2fa-btn');
    if (disable2FABtn) {
        disable2FABtn.addEventListener('click', () => {
            console.log('Disable 2FA button clicked');
            handle2FA('disable');
        });
    }

    // Bouton Supprimer le compte
    const deleteAccountBtn = document.querySelector('#delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            console.log('Delete account button clicked');
            handleDeleteAccount();
        });
    }
}


async function handle2FA(action) {
    if (action === 'enable') 
        initializeEnable2FAView();
    else if (action === 'disable')
        initializeDisable2FAView();

}

// async function handleDeleteAccount() {
//     if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
//         return;
//     }
//     try {
//         const response = await requestPost('accounts', 'profile/delete_account');
//         if (response.status === 'success') {
//             alert('Compte supprimé avec succès.');
//             window.location.href = '/logout/'; // Redirection après suppression
//         } else {
//             alert(`Erreur lors de la suppression du compte: ${response.message}`);
//         }
//     } catch (error) {
//         console.error('Erreur réseau lors de la suppression du compte:', error);
//     }
// }

function displayErrors(containerSelector, errorsOrMessage) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    if (typeof errorsOrMessage === 'string') {
        container.textContent = errorsOrMessage;
    } else {
        let errorMessages = '';
        for (let field in errorsOrMessage) {
            errorMessages += errorsOrMessage[field].join('<br>') + '<br>';
        }
        container.innerHTML = errorMessages;
    }
    container.style.display = 'block';
}

async function handleFormSubmit(form, app, view, successMessage, successSelector, errorSelector) {
    const formData = new FormData(form);
    try {
        const response = await requestPost(app, view, formData);
        if (response.status === 'success') {
            const successElem = document.querySelector(successSelector);
            if (successElem) {
                successElem.textContent = successMessage;
                successElem.style.display = 'block';
                setTimeout(() => {
                    successElem.style.display = 'none';
                }, 3000);
            }
            form.reset();
            window.location.hash = '#accounts-profile';
        } else {
            const errors = response.errors || response.error || 'Une erreur est survenue.';
            displayErrors(errorSelector, errors);
        }
    } catch (error) {
        console.error(`Erreur lors de la requête vers ${app}/${view}:`, error);
        displayErrors(errorSelector, 'Erreur réseau ou serveur.');
    }
}

export function initializeProfileFormHandlers() {
    document.querySelectorAll('form').forEach((form) => {
        if (!form.hasAttribute('data-handled')) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                if (form.id === 'change-username-form') {
                    handleFormSubmit(form, 'accounts', 'profile/update', 'Pseudo mis à jour!', '#change-username-success', '#change-username-error');
                } else if (form.id === 'change-password-form') {
                    handleFormSubmit(form, 'accounts', 'profile/change_password', 'Mot de passe mis à jour!', '#change-password-success', '#change-password-error');
                } else if (form.id === 'change-avatar-form') {
                    handleFormSubmit(form, 'accounts', 'profile/update_avatar', 'Avatar mis à jour!', '#change-avatar-success', '#change-avatar-error');
                }
            });
            form.setAttribute('data-handled', 'true'); // Marque le formulaire comme traité
        }
    });
     // Appelle la fonction pour attacher les événements des boutons
    attachProfileEvents();

}