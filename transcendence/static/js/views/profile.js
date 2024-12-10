//profile.js
import Api from '../api/api.js';

export function initializeProfileView() {
    console.log('initializeProfileView called');

    $('#gestion-btn').on('click', function() {
        window.location.hash = '#accounts-gestion_profil';
    });
}

export async function initializeGestionProfileView() {
    try {
        const response = await Api.get('/accounts/gestion_profil/');
        $('#content').html(response.html || response); 
        // Si votre backend renvoie directement du HTML, utilisez-le tel quel.
        // Sinon, adaptez en fonction de ce qui est renvoyé.
        initializeProfileFormHandlers();
    } catch (error) {
        console.error('Erreur chargement gestion profil:', error);
        $('#content').html('<p>Erreur chargement profil</p>');
    }
}

export function initializeProfileFormHandlers() {
    document.addEventListener('submit', async function(e) {
        if (e.target) {
            const form = e.target;

            if (form.id === 'change-username-form') {
                e.preventDefault();
                const formData = new FormData(form);
                try {
                    const response = await Api.post('/accounts/update_profile/', formData);
                    if (response.success) {
                        $('#change-username-success').text('Pseudo mis à jour!').show();
                        setTimeout(() => $('#change-username-success').fadeOut(), 3000);
                        form.reset();
                        window.location.hash = '#accounts-gestion_profil';
                    } else {
                        if (response.errors) {
                            let errorMessages = '';
                            for (let field in response.errors) {
                                errorMessages += response.errors[field].join('<br>') + '<br>';
                            }
                            $('#change-username-error').html(errorMessages);
                        } else if (response.error) {
                            $('#change-username-error').text(response.error);
                        }
                    }
                } catch (error) {
                    console.error('Erreur changement pseudo:', error);
                    $('#change-username-error').text('Une erreur est survenue.');
                }
            }

            if (form.id === 'change-password-form') {
                e.preventDefault();
                const formData = new FormData(form);
                try {
                    const response = await Api.post('/accounts/change_password/', formData);
                    if (response.status === 'success') {
                        $('#change-password-success').text(response.message).show();
                        setTimeout(() => $('#change-password-success').fadeOut(), 3000);
                        form.reset();
                        window.location.hash = '#accounts-gestion_profil';
                    } else {
                        if (response.errors) {
                            let errorMessages = '';
                            for (let field in response.errors) {
                                errorMessages += response.errors[field].join('<br>') + '<br>';
                            }
                            $('#change-password-error').html(errorMessages);
                        } else if (response.message) {
                            $('#change-password-error').text(response.message);
                        }
                    }
                } catch (error) {
                    console.error('Erreur changement mot de passe:', error);
                    $('#change-password-error').text('Erreur survenue.');
                }
            }

            if (form.id === 'change-avatar-form') {
                e.preventDefault();
                const formData = new FormData(form);
                try {
                    const response = await Api.post('/accounts/update_avatar/', formData);
                    if (response.success) {
                        $('#change-avatar-success').text('Avatar mis à jour!').show();
                        setTimeout(() => $('#change-avatar-success').fadeOut(), 3000);
                        window.location.hash = '#accounts-gestion_profil';
                    } else {
                        if (response.errors) {
                            let errorMessages = '';
                            for (let field in response.errors) {
                                errorMessages += response.errors[field].join('<br>') + '<br>';
                            }
                            $('#change-avatar-error').html(errorMessages);
                        } else if (response.error) {
                            $('#change-avatar-error').text(response.error);
                        }
                    }
                } catch (error) {
                    console.error('Erreur changement avatar:', error);
                    $('#change-avatar-error').text('Erreur survenue.');
                }
            }
        }
    });
}
