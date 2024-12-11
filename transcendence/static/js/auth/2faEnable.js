// auth/2faEnable.js
import Api from '../api/api.js';

function showVerificationSuccess() {
    const successElem = document.querySelector('.verification-success');
    if (successElem) {
        successElem.textContent = '2FA activé avec succès!';
        successElem.style.display = 'block';
    }
}

function showVerificationError(message) {
    const errorElem = document.querySelector('.verification-error');
    if (errorElem) {
        errorElem.textContent = message || 'Une erreur est survenue';
        errorElem.style.display = 'block';
    }
}

async function submitEnable2FA(form) {
    const formData = new FormData(form);
    try {
        const response = await Api.post('/accounts/verify_2fa/', formData);
        if (response.status === 'success') {
            showVerificationSuccess();
            setTimeout(() => {
                window.location.hash = '#accounts-profile';
            }, 2000);
        } else {
            showVerificationError(response.message);
            const codeInput = document.querySelector('#code');
            if (codeInput) {
                codeInput.value = '';
            }
        }
    } catch (err) {
        console.error('Erreur enable 2FA:', err);
        showVerificationError(err.message);
    }
}

export function initializeEnable2FAView() {
    document.addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'verify-2fa-form') {
            e.preventDefault();
            submitEnable2FA(e.target);
        }
    });
}
