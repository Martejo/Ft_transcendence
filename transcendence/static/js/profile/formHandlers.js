// profile/formHandlers.js
import Api from '../api/api.js';

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

async function handleChangeUsername(form) {
    const formData = new FormData(form);
    try {
        const response = await Api.post('/accounts/update_profile/', formData);
        if (response.success) {
            const successElem = document.querySelector('#change-username-success');
            if (successElem) {
                successElem.textContent = 'Pseudo mis à jour!';
                successElem.style.display = 'block';
                setTimeout(() => {
                    successElem.style.display = 'none';
                }, 3000);
            }
            form.reset();
            window.location.hash = '#accounts-gestion_profil';
        } else {
            if (response.errors) {
                displayErrors('#change-username-error', response.errors);
            } else if (response.error) {
                displayErrors('#change-username-error', response.error);
            }
        }
    } catch (error) {
        console.error('Erreur changement pseudo:', error);
        displayErrors('#change-username-error', 'Une erreur est survenue.');
    }
}

async function handleChangePassword(form) {
    const formData = new FormData(form);
    try {
        const response = await Api.post('/accounts/change_password/', formData);
        if (response.status === 'success') {
            const successElem = document.querySelector('#change-password-success');
            if (successElem) {
                successElem.textContent = response.message;
                successElem.style.display = 'block';
                setTimeout(() => {
                    successElem.style.display = 'none';
                }, 3000);
            }
            form.reset();
            window.location.hash = '#accounts-gestion_profil';
        } else {
            if (response.errors) {
                displayErrors('#change-password-error', response.errors);
            } else if (response.message) {
                displayErrors('#change-password-error', response.message);
            }
        }
    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        displayErrors('#change-password-error', 'Erreur survenue.');
    }
}

async function handleChangeAvatar(form) {
    const formData = new FormData(form);
    try {
        const response = await Api.post('/accounts/update_avatar/', formData);
        if (response.success) {
            const successElem = document.querySelector('#change-avatar-success');
            if (successElem) {
                successElem.textContent = 'Avatar mis à jour!';
                successElem.style.display = 'block';
                setTimeout(() => {
                    successElem.style.display = 'none';
                }, 3000);
            }
            window.location.hash = '#accounts-gestion_profil';
        } else {
            if (response.errors) {
                displayErrors('#change-avatar-error', response.errors);
            } else if (response.error) {
                displayErrors('#change-avatar-error', response.error);
            }
        }
    } catch (error) {
        console.error('Erreur changement avatar:', error);
        displayErrors('#change-avatar-error', 'Erreur survenue.');
    }
}

export function initializeProfileFormHandlers() {
    document.addEventListener('submit', async function(e) {
        const form = e.target;
        if (!form) return;

        if (form.id === 'change-username-form') {
            e.preventDefault();
            handleChangeUsername(form);
        } else if (form.id === 'change-password-form') {
            e.preventDefault();
            handleChangePassword(form);
        } else if (form.id === 'change-avatar-form') {
            e.preventDefault();
            handleChangeAvatar(form);
        }
    });
}
