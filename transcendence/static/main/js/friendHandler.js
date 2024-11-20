
function sendFriendRequest(toUserId) {
    $.ajax({
        url: `/api/send_friend_request/${toUserId}/`,
        method: 'POST',
        success: function(response) {
            alert(response.message);
            // Optionnel : Rafraîchir la liste d'amis ou mettre à jour l'interface
            refreshFriendsList();
        },
        error: function(xhr, status, error) {
            alert('Erreur lors de l\'envoi de la demande d\'ami : ' + xhr.responseJSON.message || error);
        }
    });
}

function removeFriend(friendId) {
    $.ajax({
        url: `/api/remove_friend/${friendId}/`,
        method: 'POST',
        success: function(response) {
            alert(response.message);
            // Optionnel : Rafraîchir la liste d'amis ou mettre à jour l'interface
            refreshFriendsList();
        },
        error: function(xhr, status, error) {
            alert('Erreur lors de la suppression de l\'ami : ' + xhr.responseJSON.message || error);
        }
    });
}





// L' idee est de rafraichir le profil User pour maintenir la coherence du burger menu

function refreshUserProfile() {
    $.ajax({
        url: '/api/get_user_profile_data/',
        method: 'GET',
        success: function(data) {
            if (data.error) {
                console.error('Erreur:', data.error);
                return;
            }

            // Mise à jour de l'avatar
            $('.profile-section img').attr('src', data.avatar_url);

            // Mise à jour du nom de l'utilisateur
            $('.profile-section h5').text(data.username);

            // Mise à jour de la pastille de statut
            const statusIndicator = $('#status-indicator');
            if (data.is_online) {
                statusIndicator.addClass('online').removeClass('offline');
            } else {
                statusIndicator.addClass('offline').removeClass('online');
            }
        },
        error: function(xhr, status, error) {
            console.error('Erreur lors du rafraîchissement du profil:', error);
        }
    });
}


// Meme idee pour les amis
function refreshFriendsList() {
    $.ajax({
        url: '/api/get_burger_menu_data/',
        method: 'GET',
        success: function(data) {
            const friendsListContainer = $('#friends-list-container');
            friendsListContainer.empty(); // Efface la liste actuelle

            if (data.friends && data.friends.length > 0) {
                data.friends.forEach(function(friend) {
                    const friendItem = `
                        <li class="d-flex align-items-center mb-2 friend-item">
                            <div class="position-relative">
                                <img src="${friend.avatar_url}" alt="Avatar of ${friend.username}" class="rounded-circle me-3" style="width: 50px; height: 50px;">
                                <span class="status-indicator-friend ${friend.status === 'online' ? 'online' : 'offline'}"></span>
                            </div>
                            <button class="friend-btn" onclick="showFriendPopup(event, '${friend.username}')">${friend.username}</button>
                        </li>
                    `;
                    friendsListContainer.append(friendItem);
                });
            } else {
                friendsListContainer.html('<p class="text-center">Aucun ami pour le moment.</p>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Erreur lors du rafraîchissement de la liste des amis:', error);
            $('#friends-list-container').html('<p class="text-center text-danger">Erreur lors du chargement des amis.</p>');
        }
    });
}


//**** Au lieu de rafraichir periodiquement, essayer de rafraichir si gestion profil est appelle*/
//***Pour les amis je pense qu' il faut rester comme ca car nous ne savons pas quand les amis peuvent se supprimer ****/
// Appel initial et mise à jour périodique
