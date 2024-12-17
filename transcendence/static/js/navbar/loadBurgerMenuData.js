import Api from '../api/api.js';
import { initializeFriendButtons, updateFriendRequestsList } from '../friends/index.js';

// Met à jour les informations de profil (avatar, username)
function updateProfileSection(data) {
    const profileAvatar = document.querySelector('#profile-avatar');
    const profileUsername = document.querySelector('#profile-username');

    if (profileAvatar) profileAvatar.src = data.avatar_url;
    if (profileUsername) profileUsername.textContent = data.username;
}

// Met à jour le burger button (avatar en background)
function updateBurgerButton(data) {
    const burgerButton = document.querySelector('#burger-menu-toggle');
    if (burgerButton) {
        burgerButton.style.backgroundImage = `url('${data.avatar_url}')`;
        burgerButton.style.backgroundSize = 'cover';
        burgerButton.style.backgroundPosition = 'center';
    }
}

// Met à jour l'indicateur de statut (online/offline)
function updateStatusIndicator(isOnline) {
    const statusIndicator = document.querySelector('#status-indicator');
    if (statusIndicator) {
        if (isOnline) {
            statusIndicator.classList.add('online');
            statusIndicator.classList.remove('offline');
        } else {
            statusIndicator.classList.add('offline');
            statusIndicator.classList.remove('online');
        }
    }
}

// Met à jour la liste des amis
function updateFriendsList(friends) {
    const friendsListContainer = document.querySelector('#friends-list-container');
    if (!friendsListContainer) return;

    friendsListContainer.innerHTML = '';

    if (friends && friends.length > 0) {
        friends.forEach(friend => {
            const friendItem = `
                <li class="d-flex align-items-center mb-2 friend-item">
                    <div class="position-relative">
                        <img src="${friend.avatar_url}" class="rounded-circle me-3" style="width: 50px; height: 50px;">
                        <span class="status-indicator-friend ${friend.status === 'online' ? 'online' : 'offline'}"></span>
                    </div>
                    <button class="friend-btn" data-username="${friend.username}">${friend.username}</button>
                </li>
            `;
            friendsListContainer.insertAdjacentHTML('beforeend', friendItem);
        });
    } else {
        friendsListContainer.innerHTML = '<p class="text-center">Aucun ami pour le moment.</p>';
    }
}

// Met à jour les demandes d'amis et initialise les boutons liés aux amis
function handleFriendRequests(friendRequests) {
    updateFriendRequestsList(friendRequests);
    initializeFriendButtons();
}

// Initialise le burger menu (rafraîchissement périodique, etc.)
function initializeBurgerMenuInteraction() {
    const burgerToggle = document.querySelector('#burger-menu-toggle');
    if (burgerToggle) {
        // On suppose que loadBurgerMenuData est la fonction courante. Si vous souhaitez
        // actualiser le menu régulièrement, veillez à ce que cela ne crée pas de boucle.
        // Potentiellement, créer une fonction dédiée au rafraîchissement régulier.
        
        // setInterval(loadBurgerMenuData, 10000); 
        // ATTENTION : Cet appel réappellerait loadBurgerMenuData de façon cyclique, 
        // ce qui peut ne pas être souhaitable. A ajuster selon le besoin.
        
        // Ici on suppose que le toggleBurgerMenu est une fonction importée ailleurs
        // et qui gère l'ouverture/fermeture du menu.
        burgerToggle.addEventListener('click', toggleBurgerMenu);
    }
}

// Fonction principale pour charger et afficher les données du burger menu
export async function loadBurgerMenuData() {
    try {
        const response = await Api.get('/accounts/get_burger_menu_data/');
        if (response.error) {
            console.error('Erreur:', response.error);
            return;
        }

        const data = response.data;

        updateProfileSection(data);
        updateBurgerButton(data);
        updateStatusIndicator(data.is_online);
        updateFriendsList(data.friends);
        handleFriendRequests(data.friend_requests);
        initializeBurgerMenuInteraction();

    } catch (error) {
        console.error('Erreur chargement burger-menu:', error);
    }
}
