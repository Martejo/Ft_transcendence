document.addEventListener('DOMContentLoaded', function() {
    const burgerButton = document.getElementById('burger-menu-toggle');
    if (burgerButton) {
        burgerButton.addEventListener('click', function() {
            toggleBurgerMenu();
        });
    }
});



function toggleBurgerMenu() {
    const menu = document.getElementById('burger-menu');
    const overlay = document.getElementById('overlay');

    if (menu && overlay) {
        if (menu.style.display === 'block') {
            // Masquer le menu
            menu.style.display = 'none';
            overlay.style.display = 'none';
        } else {
            // Afficher le menu
            menu.style.display = 'block';
            overlay.style.display = 'block';
        }
    }
}

function loadBurgerMenuData() {
    $.ajax({
        url: '/accounts/get_burger_menu_data/',
        method: 'GET',
        success: function(data) {
            console.log(data);
            if (data.error) {
                console.error('Erreur :', data.error);
                return;
            }
    
            // Mise à jour du nom d'utilisateur et de l'avatar
            $('#profile-avatar').attr('src', data.avatar_url);
            $('#profile-username').text(data.username);

            // Mise à jour de la liste des amis
            const friendsListContainer = $('#friends-list-container');
            friendsListContainer.empty();

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
            };
              // Mise à jour des invitations d'amis
              const friendRequests = data.data.friend_requests; // Assurez-vous d'accéder correctement aux donnée
              updateFriendRequestsList(friendRequests);
        },
        error: function(xhr, status, error) {
            console.error('Erreur lors du chargement des données du burger-menu :', error);
        }
    });
}

function updateFriendRequestsList(friendRequests) {
    console.log('friendRequests reçu :', friendRequests); // Ajoutez ceci pour vérifier ce qui est reçu
    if (!Array.isArray(friendRequests)) {
        console.error('Les invitations d\'amis sont mal définies ou ne sont pas un tableau:', friendRequests);
        friendRequests = []; // Définir un tableau vide par défaut
    }

    const friendRequestsListElement = document.getElementById('friend-requests-list-container');
    friendRequestsListElement.innerHTML = ''; // Vider la liste actuelle

    if (friendRequests.length === 0) {
        friendRequestsListElement.innerHTML = '<p class="text-center">Aucune invitation pour le moment.</p>';
    } else {
        friendRequests.forEach(request => {
            const requestItem = `
                <li class="d-flex align-items-center mb-2 request-item">
                    <div class="position-relative">
                        <img src="${request.avatar_url}" alt="Avatar of ${request.from_user}" class="rounded-circle me-3" style="width: 50px; height: 50px;">
                    </div>
                    <div class="d-flex flex-column">
                        <p>${request.from_user}</p>
                        <div class="d-flex">
                            <button class="btn btn-success btn-sm me-2" onclick="handleFriendRequest('${request.id}', 'accept')">Accepter</button>
                            <button class="btn btn-danger btn-sm" onclick="handleFriendRequest('${request.id}', 'decline')">Refuser</button>
                        </div>
                    </div>
                </li>
            `;
            friendRequestsListElement.insertAdjacentHTML('beforeend', requestItem);
        });
    }
}



