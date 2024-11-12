// authentication.js

// Fonction d'initialisation de la vue de connexion
function initializeLoginView() {
    $(document).on('submit', '#login-form', function(event) {
        event.preventDefault();
        const formData = $(this).serialize();

        $('#validate-btn').prop('disabled', true).text('Connexion...');

        ajaxRequest(
            '/accounts/submit_login/',
            'POST',
            formData,
            function(response) {
                if (response.success) {
                    isAuthenticated = true;
                    addMenuButton();
                    window.location.hash = '#accounts-profile';
                } else {
                    if (response.errors) {
                        let errorMessages = '';
                        for (let field in response.errors) {
                            if (response.errors.hasOwnProperty(field)) {
                                errorMessages += response.errors[field].join('<br>') + '<br>';
                            }
                        }
                        $('#login-error').html(errorMessages);
                    } else if (response.error) {
                        $('#login-error').text(response.error);
                    }
                }
                $('#validate-btn').prop('disabled', false).text('Valider');
            },
            function(error) {
                console.error("Erreur lors de la soumission du formulaire :", error);
                $('#login-error').html('<p>Une erreur est survenue lors de la connexion. Veuillez réessayer.</p>');
                $('#validate-btn').prop('disabled', false).text('Valider');
            }
        );
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