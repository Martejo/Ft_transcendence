// auth/register.js
import { requestPost, requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js'


function displayRegistrationErrors(errors) {
    const registerError = document.querySelector('#register-error');
    let errorMessages = '';
    for (let field in errors) {
        if (Object.prototype.hasOwnProperty.call(errors, field)) {
            errorMessages += errors[field].join('<br>') + '<br>';
        }
    }
    registerError.innerHTML = errorMessages;
}

function handleRegisterResponse(response) {
    if (response.status === 'success') {
        alert(response.message);
        window.location.hash = '#accounts-login';
    } else {
        if (response.errors) {
            displayRegistrationErrors(response.errors);
        }
    }
}

async function submitRegistration(form) {
    const submitBtn = document.querySelector('#submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Inscription en cours...';

    const formData = new FormData(form);

    try {
        const response = await requestPost('accounts','submit_register', formData);
        handleRegisterResponse(response);
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        document.querySelector('#register-error').innerHTML = '<p>Une erreur est survenue. Veuillez réessayer.</p>';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'S\'inscrire';
    }
}

// MAIN FUNCTION
export async function initializeRegisterView() {
    console.log('initializeRegisterView');
    let data;
    try {
        data = await requestGet('accounts', 'register')
        updateHtmlContent('#content', data.html)
    } catch (error) {
        // [IMPROVE] Faire un gestionnaire d'erreurs 
        console.error('Erreur lors de la requete API initializeRegisterView :', error);
    }

    const form = document.querySelector('#register-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitRegistration(form);
    });
}
