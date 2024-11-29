// Déléguer l'événement de clic pour le bouton principal et la croix via un parent fixe
$(document).on('click', '.invite-button', function(event) {
    const $button = $(this);

    // Si l'utilisateur clique sur la croix, annuler l'invitation
    if ($(event.target).hasClass('cancel-icon')) {
        event.stopPropagation(); // Empêcher l'événement de se propager au bouton principal
        cancelInvitation($button);
        return;
    }

    // Si le bouton n'est pas en état "Envoyé", envoyer l'invitation
    if (!$button.hasClass('sent')) {
        const friendUsername = $button.siblings('.friend-btn').text();

        // Envoyer l'invitation via une requête AJAX
        $.ajax({
            url: '/game/send_invitation/', // Vue Django qui enverra l'invitation
            method: 'POST',
            data: { friend_username: friendUsername },
            success: function(response) {
                if (response.status === 'success') {
                    // Ajouter le texte "Envoyé" avec la croix
                    $button.html('Envoyé <span class="cancel-icon">&times;</span>');
                    $button.addClass('sent'); // Ajouter une classe indiquant que le bouton est en état "Envoyé"
                    invitedFriend = friendUsername;

                    // Désactiver les autres boutons d'invitation
                    $('.invite-button').not($button).addClass('disabled');

                    // Activer le bouton "Commencer"
                    $('#start-game-btn').removeAttr('disabled');
                }
            },
            error: function(error) {
                console.error('Erreur lors de l\'envoi de l\'invitation :', error);
            }
        });
    }
});

// Fonction pour annuler une invitation
function cancelInvitation(button) {
    const friendUsername = button.siblings('.friend-btn').text();

    // Envoyer une requête AJAX pour annuler l'invitation
    $.ajax({
        url: '/game/cancel_invitation/', // Vue Django qui annule l'invitation
        method: 'POST',
        data: { friend_username: friendUsername },
        success: function(response) {
            if (response.status === 'success') {
                // Remettre le texte du bouton à "Inviter"
                button.html('Inviter');
                button.removeClass('sent'); // Retirer l'état "Envoyé"
                invitedFriend = null;

                // Désactiver le bouton "Commencer"
                $('#start-game-btn').attr('disabled', true);

                // Réactiver les autres boutons d'invitation
                $('.invite-button').removeClass('disabled');
            }
        },
        error: function(error) {
            console.error('Erreur lors de l\'annulation de l\'invitation :', error);
        }
    });
}