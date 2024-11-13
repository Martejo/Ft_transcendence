function toggleBurgerMenu() {
    const menu = document.getElementById('burger-menu');
    const overlay = document.getElementById('overlay');
    console.log('toogleBurgerMenu');

    if (menu.style.display === 'block') {
        // Masquer le menu
        menu.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        // Afficher le menu
        menu.style.display = 'block';
        overlay.style.display = 'block';

        // Charger dynamiquement le contenu du menu (amis, statut, etc.)
        loadBurgerMenuContent();
    }
}

function loadBurgerMenuContent() {
    $.ajax({
        url: '/accounts/get_burger_menu_data/', // URL vers une vue Django qui fournit les données
        method: 'GET',
        success: function(response) {
            if (response.status === 'success') {
                // Mettre à jour le contenu du menu avec les données retournées
                document.querySelector('.profile-section img').src = response.avatar_url;
                document.querySelector('.profile-section h5').textContent = response.username;
                document.querySelector('.profile-section p').textContent = response.email;

                // Mettre à jour la liste des amis, le statut, etc.
                updateFriendsList(response.friends);
            } else {
                console.error("Erreur lors du chargement du menu burger :", response.error);
            }
        },
        error: function(error) {
            console.error("Erreur lors du chargement du menu burger :", error);
        }
    });
}


function updateFriendsList(friends) {
    const friendsListElement = document.querySelector('.friends-list ul');
    friendsListElement.innerHTML = ''; // Vider la liste actuelle

    friends.forEach(friend => {
        const friendItem = `
            <li class="d-flex align-items-center mb-2 friend-item">
                <div class="position-relative">
                    <img src="${friend.avatar_url}" alt="${friend.username}" class="rounded-circle me-3" style="width: 50px; height: 50px;">
                    <span class="status-indicator-friend ${friend.status}" id="${friend.username}-status"></span>
                </div>
                <button class="friend-btn" onclick="showFriendPopup(event, '${friend.username}')">${friend.username}</button>
            </li>
        `;
        friendsListElement.insertAdjacentHTML('beforeend', friendItem);
    });
}