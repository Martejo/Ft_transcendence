// Fonction d'initialisation pour l'activation de la 2FA
function initializeEnable2FAView() {
    console.log("initializeEnable2Fa View called");
    $(document).on('submit', '#enable-2fa-form', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/accounts/enable_2fa/',
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                if (response.status === 'success') {
                    $('#qr-code').attr('src', 'data:image/png;base64,' + response.qr_code);
                    $('#secret').text(response.secret);
                }
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    });
}

// Fonction d'initialisation pour la vérification de la 2FA
function initializeVerify2FAView() {
    console.log("initializeVerify2FA View called");
    $(document).on('submit', '#verify-2fa-form', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/accounts/verify_2fa/',
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message);
                    window.location.hash = '#accounts-profile';
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
                    window.location.href = '/profile';
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
    $(document).on('submit', '#disable-2fa-form', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/accounts/disable_2fa/',
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                if (response.status === 'success') {
                    alert(response.message);
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