import Api from '../api/api.js';
import { loadNavbar } from '../modules/navbar.js';

export function initializeLoginView() {
    const form = document.querySelector('#login-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const data = $(form).serialize();

        $('#validate-btn').prop('disabled', true).text('Connexion...');

        $.ajax({
            url: '/accounts/submit_login/',
            method: 'POST',
            data: data,
            success: response => {
                if (response.status === 'success') {
                    if (response.requires_2fa) {
                        window.location.hash = '#accounts-verify_2fa_login';
                    } else {
                        sessionStorage.setItem('accessToken', response.access);
                        sessionStorage.setItem('refreshToken', response.refresh);
                        setTimeout(() => {
                            window.isAuthenticated = true;
                            // Charger la navbar ou actions post-login
                            loadNavbar();
                            window.location.hash = '#game-play';
                        }, 500);
                    }
                } else {
                    if (response.errors) {
                        let errors = response.errors;
                        let errorMessages = '';
                        for (let field in errors) {
                            if (errors.hasOwnProperty(field)) {
                                errorMessages += errors[field].join('<br>') + '<br>';
                            }
                        }
                        $('#login-error').html(errorMessages);
                    } else if (response.message) {
                        $('#login-error').text(response.message);
                    }
                }
                $('#validate-btn').prop('disabled', false).text('Valider');
            },
            error: error => {
                console.error('Erreur lors de la connexion :', error);
                $('#login-error').html('<p>Une erreur est survenue. Veuillez réessayer.</p>');
                $('#validate-btn').prop('disabled', false).text('Valider');
            }
        });
    });
}











export function initializeRegisterView() {
    const form = document.querySelector('#register-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const data = $(form).serialize();

        $('#submit-btn').prop('disabled', true).text('Inscription en cours...');

        $.ajax({
            url: '/accounts/submit_registration/',
            method: 'POST',
            data: data,
            success: response => {
                if (response.status === 'success') {
                    alert(response.message);
                    window.location.hash = '#accounts-login';
                } else {
                    if (response.errors) {
                        let errors = response.errors;
                        let errorMessages = '';
                        for (let field in errors) {
                            if (errors.hasOwnProperty(field)) {
                                errorMessages += errors[field].join('<br>') + '<br>';
                            }
                        }
                        $('#register-error').html(errorMessages);
                    }
                }
                $('#submit-btn').prop('disabled', false).text('S\'inscrire');
            },
            error: error => {
                console.error('Erreur lors de l\'inscription:', error);
                $('#register-error').html('<p>Une erreur est survenue. Veuillez réessayer.</p>');
                $('#submit-btn').prop('disabled', false).text('S\'inscrire');
            }
        });
    });
}







export function logoutUser() {
    $.ajax({
        url: '/accounts/logout/',
        type: 'POST',
        success: function(response) {
            if (response.status === 'success') {
                console.log('Déconnexion réussie');
                $('#navbar').html('');
                $('#burger-menu').html('');
                $('#content').html('');
                window.location.href = '/';
            }
        },
        error: function(error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    });
}
