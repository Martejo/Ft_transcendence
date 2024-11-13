// views_init.js

// Fonction d'initialisation de la vue d'accueil
function initializeHomeView() {
    // Attacher des événements spécifiques à la vue d'accueil
    $(document).on('click', '#login-btn', function(event) {
        event.preventDefault();
        window.location.hash = '#accounts-login';
    });

    $(document).on('click', '#register-btn', function(event) {
        event.preventDefault();
        window.location.hash = '#accounts-register';
    });

    // Appeler la fonction pour animer la couleur du texte
    animateTextColor();
}



// Fonction d'initialisation de la vue d'inscription
function initializeRegisterView() {
    // Gestionnaire pour le formulaire d'inscription
    $(document).on('submit', '#register-form', function(event) {
        event.preventDefault(); // Empêche le comportement par défaut du formulaire

        const formData = $(this).serialize(); // Sérialise les données du formulaire

        $('#submit-btn').prop('disabled', true).text('Inscription en cours...');

        $.ajax({
            url: '/accounts/submit_registration/', // URL de soumission du formulaire d'inscription
            method: 'POST',
            data: formData,
            success: function(response) {
                if (response.status === 'success') {
                    // Afficher un message de succès et rediriger vers la page de connexion
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
            error: function(error) {
                console.error("Erreur lors de la soumission du formulaire :", error);
                $('#register-error').html('<p>Une erreur est survenue lors de l\'inscription. Veuillez réessayer.</p>');
                $('#submit-btn').prop('disabled', false).text('S\'inscrire');
            }
        });
    });
}


// Fonction d'initialisation de la vue de profil
// function initializeProfileView() {
//     // Initialiser les événements spécifiques à la vue 'profile'
//     $(document).on('click', '#logout-btn', function(event) {
//         event.preventDefault();
//         $.ajax({
//             url: '/accounts/logout/',
//             method: 'POST',
//             success: function(response) {
//                 if (response.success) {
//                     isAuthenticated = false;
//                     window.location.hash = '#core-home';
//                 } else {
//                     alert('Erreur lors de la déconnexion.');
//                 }
//             },
//             error: function(error) {
//                 console.error("Erreur lors de la déconnexion :", error);
//             }
//         });
//     });
// }

function initializeProfileView() {
    // Assurez-vous que les événements pertinents sont attachés correctement
    console.log("initializeProfileView called");

    // Mettre à jour dynamiquement les informations du profil si nécessaire
    $('#gestion-btn').on('click', function() {
        window.location.hash = '#accounts-gestion_profil';
    });

    // Charge l'avatar après modification
    if ($('#profile-avatar')) {
        // Recharger l'avatar si changé
        let avatarUrl = $('#profile-avatar').attr('src');
        $('#profile-avatar').attr('src', avatarUrl + '?' + new Date().getTime());
    }
}




function initializeGestionProfileView() {
    console.log("initializeGestionProfileView called."); // Débogage

    // Charger la vue de gestion de profil via AJAX
    $.ajax({
        url: '/accounts/gestion_profil/', // URL pour charger la vue de gestion du profil
        method: 'GET',
        success: function(response) {
            // Insérer la réponse HTML dans le conteneur `#content`
            $('#content').html(response);

            // Initialiser les formulaires après avoir chargé la vue de gestion de profil
            initializeProfileFormHandlers();
        },
        error: function(error) {
            console.error("Erreur lors du chargement de la vue de gestion de profil :", error);
            $('#content').html('<p>Une erreur est survenue lors du chargement de la page de gestion de profil.</p>');
        }
    });
}

function initializeProfileFormHandlers() {
    // Gestion du changement de pseudo
    $(document).on('submit', '#change-username-form', function(event) {
        event.preventDefault();
        const formData = $(this).serialize();
        
        $.ajax({
            url: '/accounts/update_profile/',
            method: 'POST',
            data: formData,
            success: function(response) {
                if (response.success) {
                    $('#change-username-success').text('Pseudo mis à jour avec succès.').show();
                    $('#change-username-error').empty();
                    
                    setTimeout(function() {
                        $('#change-username-success').fadeOut();
                    }, 3000);
                    // Réinitialiser le formulaire
                    document.getElementById('change-username-form').reset();

                    // Recharger la vue profil pour mettre à jour l'interface utilisateur avec le nouveau pseudo
                    loadContent('accounts', 'gestion_profil');

                    // Masquer le message de succès après 3 secondes
                } else {
                    $('#change-username-success').empty();
                    if (response.errors) {
                        let errorMessages = '';
                        for (let field in response.errors) {
                            if (response.errors.hasOwnProperty(field)) {
                                errorMessages += response.errors[field].join('<br>') + '<br>';
                            }
                        }
                        $('#change-username-error').html(errorMessages);
                    } else if (response.error) {
                        $('#change-username-error').text(response.error);
                    }
                }
            },
            error: function(error) {
                console.error("Erreur lors du changement de pseudo :", error);
                $('#change-username-error').html('<p>Une erreur est survenue lors du changement de pseudo. Veuillez réessayer.</p>');
                $('#change-username-success').empty();
            }
        });
    });

    // Gestion du changement de mot de passe
    $(document).on('submit', '#change-password-form', function(event) {
        event.preventDefault();
        const formData = $(this).serialize();

        $.ajax({
            url: '/accounts/change_password/',
            method: 'POST',
            data: formData,
            success: function(response) {
                if (response.status === 'success') {
                    $('#change-password-success').text(response.message).show();
                    $('#change-password-error').empty();

                    // Réinitialiser le formulaire
                    document.getElementById('change-password-form').reset();

                    // Recharger la vue profil pour mettre à jour les données
                    loadContent('accounts', 'gestion_profil');

                    setTimeout(function() {
                        $('#change-password-success').fadeOut();
                    }, 3000);
                } else if (response.status === 'error') {
                    $('#change-password-success').empty();
                    if (response.errors) {
                        let errorMessages = '';
                        for (let field in response.errors) {
                            if (response.errors.hasOwnProperty(field)) {
                                errorMessages += response.errors[field].join('<br>') + '<br>';
                            }
                        }
                        $('#change-password-error').html(errorMessages);
                    } else if (response.message) {
                        $('#change-password-error').text(response.message);
                    }
                }
            },
            error: function(error) {
                console.error("Erreur lors du changement de mot de passe :", error);
                $('#change-password-error').html('<p>Une erreur est survenue lors du changement de mot de passe. Veuillez réessayer.</p>');
                $('#change-password-success').empty();
            }
        });
    });

    // Gestion du changement d'avatar
    $(document).on('submit', '#change-avatar-form', function(event) {
        event.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: '/accounts/update_avatar/',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    $('#change-avatar-success').text('Avatar mis à jour avec succès.').show();
                    $('#change-avatar-error').empty();

                    // Recharger la vue profil pour mettre à jour l'interface utilisateur avec le nouvel avatar
                    loadContent('accounts', 'gestion_profil');

                    setTimeout(function() {
                        $('#change-avatar-success').fadeOut();
                    }, 3000);
                } else {
                    $('#change-avatar-success').empty();
                    if (response.errors) {
                        let errorMessages = '';
                        for (let field in response.errors) {
                            if (response.errors.hasOwnProperty(field)) {
                                errorMessages += response.errors[field].join('<br>') + '<br>';
                            }
                        }
                        $('#change-avatar-error').html(errorMessages);
                    } else if (response.error) {
                        $('#change-avatar-error').text(response.error);
                    }
                }
            },
            error: function(error) {
                console.error("Erreur lors du changement d'avatar :", error);
                $('#change-avatar-error').html('<p>Une erreur est survenue lors du changement d\'avatar. Veuillez réessayer.</p>');
                $('#change-avatar-success').empty();
            }
        });
    });
}
