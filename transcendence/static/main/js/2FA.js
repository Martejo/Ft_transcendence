
// Fonction d'initialisation pour la vérification de la 2FA
function initializeEnable2FAView() {
    console.log("initializeEnable2FA View called");
    
    // For debugging
    console.log("Form present:", $('#verify-2fa-form').length > 0);
    
    $(document).on('submit', '#verify-2fa-form', function(e) {
        e.preventDefault();
        console.log("Form submitted");
        
        const formData = $(this).serialize();
        console.log("Form data:", formData);
        
        $.ajax({
            url: '/accounts/verify_2fa/',
            method: 'POST',
            data: formData,
            success: function(response) {
                console.log("Response:", response);
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
            },
            error: function(xhr) {
                console.error("Error:", xhr);
                $('.verification-error')
                    .text(xhr.responseJSON?.message || 'Une erreur est survenue')
                    .show();
            }
        });
    });
}

// Fonction d'initialisation pour la vérification de la 2FA lors de la connexion
function initializeLogin2FAView() {
    console.log("initializeLogin2FA View called");
    $(document).on('submit', '#login-2fa-form', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/accounts/verify_2fa_login/',
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                if (response.status === 'success') {
                    window.location.href = '#accounts-profile';
                } else {
                    alert(response.message);
                }
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    });
}

// Fonction d'initialisation pour la désactivation de la 2FA
function initializeDisable2FAView() {
    console.log("initializeDisable2FA View called");
    $(document).on('submit', '#disable-2fa', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/accounts/disable_2fa/',
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message);
                    window.location.href = '#accounts-gestion_profil';
                } else {
                    alert(response.message);
                }
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    });
}