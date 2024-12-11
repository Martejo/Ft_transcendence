// navbar/loadBurgerMenuData.js
import Api from '../api/api.js';
import { initializeFriendButtons, updateFriendRequestsList } from '../friends.js';

export async function loadBurgerMenuData() {
    try {
        const data = await Api.get('/accounts/get_burger_menu_data/');
        if (data.error) {
            console.error('Erreur:', data.error);
            return;
        }

        const profileAvatar = document.querySelector('#profile-avatar');
        const profileUsername = document.querySelector('#profile-username');
        const burgerButton = document.querySelector('#burger-menu-toggle');
        const statusIndicator = document.querySelector('#status-indicator');
        const friendsListContainer = document.querySelector('#friends-list-container');

        if (profileAvatar) profileAvatar.src = data.data.avatar_url;
        if (profileUsername) profileUsername.textContent = data.data.username;

        if (burgerButton) {
            burgerButton.style.backgroundImage = `url('${data.data.avatar_url}')`;
            burgerButton.style.backgroundSize = 'cover';
            burgerButton.style.backgroundPosition = 'center';
        }

        if (statusIndicator) {
            if (data.data.is_online) {
                statusIndicator.classList.add('online');
                statusIndicator.classList.remove('offline');
            } else {
                statusIndicator.classList.add('offline');
                statusIndicator.classList.remove('online');
            }
        }

        if (friendsListContainer) {
            friendsListContainer.innerHTML = '';

            if (data.data.friends && data.data.friends.length > 0) {
                data.data.friends.forEach(friend => {
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

            updateFriendRequestsList(data.data.friend_requests);
            initializeFriendButtons();
        }
    } catch (error) {
        console.error('Erreur chargement burger-menu:', error);
    }
}
