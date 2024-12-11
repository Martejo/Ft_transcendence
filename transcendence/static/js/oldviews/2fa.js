//2fa.js
import Api from '../api/api.js';

export function initializeEnable2FAView() {
    document.addEventListener('submit', async function(e) {
        if (e.target && e.target.id === 'verify-2fa-form') {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            try {
                const response = await Api.post('/accounts/verify_2fa/', formData);
                if (response.status === 'success') {
                    $('.verification-success')
                        .text('2FA activé avec succès!')
                        .show();
                    setTimeout(() => {
                        window.location.hash = '#accounts-profile';
                    }, 2000);
                } else {
                    $('.verification-error')
                        .text(response.message || 'Une erreur est survenue')
                        .show();
                    $('#code').val('');
                }
            } catch (err) {
                $('.verification-error')
                    .text(err.message || 'Une erreur est survenue')
                    .show();
            }
        }
    });
}

export function initializeLogin2FAView() {
    document.addEventListener('submit', async function(e) {
        if (e.target && e.target.id === 'login-2fa-form') {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            try {
                const response = await Api.post('/accounts/verify_2fa_login/', formData);
                if (response.status === 'success') {
                    sessionStorage.setItem('accessToken', response.access);
                    sessionStorage.setItem('refreshToken', response.refresh);
                    setTimeout(() => {
                        window.isAuthenticated = true;
                        window.location.hash = '#accounts-profile';
                    }, 500);
                } else {
                    alert(response.message);
                }
            } catch (error) {
                alert(error.message || 'Une erreur est survenue');
            }
        }
    });
}

export function initializeDisable2FAView() {
    document.addEventListener('submit', async function(e) {
        if (e.target && e.target.id === 'disable-2fa') {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            try {
                const response = await Api.post('/accounts/disable_2fa/', formData);
                if (response.status === 'success') {
                    alert(response.message);
                    window.location.hash = '#accounts-gestion_profil';
                } else {
                    alert(response.message);
                }
            } catch (error) {
                alert(error.message || 'Une erreur est survenue');
            }
        }
    });
}
