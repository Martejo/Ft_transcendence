// profile/formHandlers.js
import { requestPost } from '../api/index.js';


// [IMPROVE] Si l'utilisateur change son username, en théorie il faudrait le déconnecter puis le faire reconnecter pour générer un nouveau token avec le nouveau username.

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

}