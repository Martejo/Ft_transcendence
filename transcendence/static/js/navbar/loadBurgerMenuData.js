import { requestGet }  from '../api/index.js';
import { initializeFriendButtons, updateFriendRequestsList } from '../friends/index.js';
import { toggleBurgerMenu } from './toggleBurgerMenu.js';
import { eventsHandlerBurgerMenu } from './eventsBurgerMenu.js';

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
//Faire requete post pour changer le status
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
    //Display/undisplay the burger menu
    const burgerToggle = document.querySelector('#burger-menu-toggle');
    if (burgerToggle) {
        // setInterval(loadBurgerMenuData, 10000);
        burgerToggle.addEventListener('click', toggleBurgerMenu);
    }
    //initialize every other possible user interactions in the burger menu
    eventsHandlerBurgerMenu();
}

// Fonction principale pour charger et afficher les données du burger menu
export async function loadBurgerMenuData() {
    try {
        const response = await requestGet('accounts', 'burgerMenu');
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
