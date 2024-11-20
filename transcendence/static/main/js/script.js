// script.js


// Fonction pour obtenir le token CSRF
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        if (cookie.trim().startsWith('csrftoken=')) {
            return cookie.trim().substring('csrftoken='.length);
        }
    }
    console.log("Je sors sans token");
    return '';
}

// Configurer les requêtes AJAX pour inclure le token CSRF
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
        }
    }
});

// Charger les modules en fonction des vues
$(window).on('hashchange', handleHashChange);

$(document).ready(function() {
    loadNavbar();
    handleHashChange();
});

function handleHashChange() {
    console.log("Hash changé : ", window.location.hash);
    const hash = window.location.hash.substring(1); // Supprime le '#'
    const [app, view] = hash.split('-'); // Suppose que le format est 'App-View'
    // Charger la vue spécifiée
    if (app && view) {
        if (view === 'logout')
            logoutUser();
        else
            loadContent(app, view);
    } else {
        window.location.hash = '#core-home';
    }
}


function loadNavbar() {
    console.log("Rentre dans loadnavbar");
    $.ajax({
        url: '/core/get_navbar/',  //?_=' + new Date().getTime(), // Ajoute un timestamp pour éviter la mise en cache
        method: 'GET',
        success: function(response) {
            $('#navbar').html(response);

            // Attachez l'événement burger menu uniquement si l'utilisateur est connecté
            // Vérifiez si l'élément `burger-menu-toggle` est présent dans la réponse
            if ($('#burger-menu-toggle').length > 0) {
                console.log("Rentre dans if burger");
                loadBurgerMenuData();
                $('#burger-menu-toggle').on('click', toggleBurgerMenu);
            }
            console.log("Navbar chargée.");
        },
        error: function(xhr) {
            console.error('Erreur lors du chargement de la barre de navigation :', xhr);
        }
    });
}


function loadContent(app, view) {
    $.ajax({
        url: `/${app}/${view}/`,
        method: 'GET',
        success: function(response) {
            $('#content').html(response);
            initializeView(app, view);
        },
        error: function(error) {
            console.error("Erreur lors du chargement de la vue :", error);
            $('#content').html('<p>Une erreur est survenue lors du chargement de la page.</p>');
        }
    });
}

$(document).on('click', '#login-btn', function(event) {
    event.preventDefault();
    console.log("Login button clicked"); // Pour le débogage
    window.location.hash = '#accounts-login';
});

$(document).on('click', '#logout-btn', function(event) {
    event.preventDefault();
    console.log("Login button clicked"); // Pour le débogage
    window.location.hash = '#accounts-logout';
});

$(document).on('click', '#register-btn', function(event) {
    event.preventDefault();
    console.log("Register button clicked"); // Pour le débogage
    window.location.hash = '#accounts-register';
});

$(document).on('click', '#enable-2fa-btn', function(event) {
    event.preventDefault();
    console.log("enable 2fa button clicked"); // Pour le débogage
    window.location.hash = '#accounts-enable_2fa';
});

$(document).on('click', '#disable-2fa-btn', function(event) {
    event.preventDefault();
    console.log("disable 2fa button clicked"); // Pour le débogage
    window.location.hash = '#accounts-disable_2fa';
});

function initializeView(app, view) {
    if (app === 'core' && view === 'home') {
        initializeHomeView();
    } else if (app === 'accounts' && view === 'login') {
        initializeLoginView();
    } else if (app === 'accounts' && view === 'register') {
        initializeRegisterView();
    } else if (app === 'accounts' && view === 'profile') {
        initializeProfileView();
    } else if (app === 'accounts' && view === 'gestion_profil') {
        initializeProfileFormHandlers(); 
    } else if (app === 'accounts' && view === 'verify_2fa_login') {
        initializeLogin2FAView();
    } else if (app === 'accounts' && view === 'enable_2fa') {
        initializeEnable2FAView();
    } else if (app === 'accounts' && view === 'disable_2fa') {
        initializeDisable2FAView();
    }
}

$(document).on('submit', '#add-friend-form', function(event) {
    event.preventDefault();
    const formData = $(this).serialize(); // Sérialise les données du formulaire

    // Désactiver le bouton pendant le traitement de la requête
    $('#add-friend-form button').prop('disabled', true).text('Ajout en cours...');

    $.ajax({
        url: '/accounts/add_friend/', // URL de soumission du formulaire pour ajouter un ami
        method: 'POST',
        data: formData,
        success: function(response) {
            if (response.status === 'success') {
                // Afficher un message de succès
                $('#add-friend-success').text(response.message).show();
                $('#add-friend-error').hide();

                // Réinitialiser le formulaire
                document.getElementById('add-friend-form').reset();

                // Masquer le message de succès après 3 secondes
                setTimeout(function() {
                    $('#add-friend-success').fadeOut();
                }, 3000);
            } else if (response.status === 'error') {
                // Afficher un message d'erreur
                $('#add-friend-error').text(response.message).show();
                $('#add-friend-success').hide();
            }
            $('#add-friend-form button').prop('disabled', false).text('Ajouter');
        },
        error: function(xhr, status, error) {
            // Gérer les erreurs inattendues
            $('#add-friend-error').html('<p>Une erreur est survenue. Veuillez réessayer.</p>').show();
            $('#add-friend-success').hide();
            $('#add-friend-form button').prop('disabled', false).text('Ajouter');
        }
    });
});


function handleFriendRequest(requestId, action) {
    $.ajax({
        url: '/accounts/handle_friend_request/',
        method: 'POST',
        data: {
            request_id: requestId,
            action: action,
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
        },
        success: function(response) {
            if (response.status === 'success') {
                alert(`Invitation ${action}ée avec succès.`);
                // Recharger la liste des invitations d'amis
                loadBurgerMenuData();
            } else {
                console.error("Erreur lors du traitement de la requête :", response.error);
            }
        },
        error: function(error) {
            console.error("Erreur lors du traitement de la requête :", error);
        }
    });
}