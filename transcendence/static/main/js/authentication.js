// authentication.js

function checkAuthentication(callback) {
    // Vérifier s'il y a déjà un état d'authentification stocké
    if (localStorage.getItem('is_authenticated') !== null) {
        const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
        callback(isAuthenticated);
    } else {
        // Envoyer une requête pour vérifier l'état d'authentification
        $.ajax({
            url: '/is_authenticated/',
            method: 'GET',
            success: function(response) {
                localStorage.setItem('is_authenticated', response.is_authenticated);
                callback(response.is_authenticated);
            },
            error: function() {
                console.error("Erreur lors de la vérification de l'authentification");
                callback(false);
            }
        });
    }
}


// Fonction d'initialisation de la vue de connexion
function initializeLoginView() {
    console.log("initialize login view");
    // Gestionnaire pour le formulaire de connexion
    $(document).on('submit', '#login-form', function(event) {
        event.preventDefault(); // Empêche le comportement par défaut du formulaire

        const formData = $(this).serialize(); // Sérialise les données du formulaire

        $('#validate-btn').prop('disabled', true).text('Connexion...');

        $.ajax({
            url: '/accounts/submit_login/', // URL de soumission du formulaire
            method: 'POST',
            data: formData,
            success: function(response) {
                console.log("succes avant 2fa");
                if (response.status === 'success') {
                    if (response.requires_2fa) {
                        console.log("succes");
                        window.location.hash = '#accounts-verify_2fa_login';
                    } else {
                        // Attendre un petit délai avant de charger la nouvelle barre de navigation
                        setTimeout(function() {
                            window.isAuthenticated = true; // L'utilisateur est maintenant connecté
                            loadNavbar();
                            window.location.hash = '#accounts-profile';
                        }, 500); // 500 ms de délai
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
            error: function(error) {
                console.error("Erreur lors de la soumission du formulaire :", error);
                $('#login-error').html('<p>Une erreur est survenue lors de la connexion. Veuillez réessayer.</p>');
                $('#validate-btn').prop('disabled', false).text('Valider');
            }
        });
    });
}
// Fonction pour ajouter un bouton au menu après connexion
function addMenuButton() {
    const menuButton = `
        <a id="menu-btn" class="nav-link text-white d-flex justify-content-center align-items-center" href="#profile">
            <img src="png/7.avif" alt="Menu" style="width: 50px; height:50px;"></img>
        </a>
    `;
    document.getElementById("navbar-right").innerHTML = menuButton;
}