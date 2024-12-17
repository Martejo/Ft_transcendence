import Api from '../api/api.js';
import { initializeFriendButtons, updateFriendRequestsList } from '../friends/index.js';

export async function loadNavbar() {
    try {
        const response = await Api.get('/core/navbar/');
        $('#navbar').html(response.html || response); 
        if ($('#burger-menu-toggle').length > 0) {
            await loadBurgerMenuData();
            $('#burger-menu-toggle').on('click', toggleBurgerMenu);
            setInterval(loadBurgerMenuData, 10000);
        }
    } catch (error) {
        console.error('Erreur chargement navbar:', error);
    }
}

export function toggleBurgerMenu() {
    const menu = document.getElementById('burger-menu');
    const overlay = document.getElementById('overlay');

    if (!menu || !overlay) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        menu.style.display = 'block';
        overlay.style.display = 'block';

        document.querySelectorAll('#profile-btn, #logout-btn, #tournament-link, #settings-link, #play-btn')
            .forEach(button => {
                button.addEventListener('click', () => {
                    menu.style.display = 'none';
                    overlay.style.display = 'none';
                });
            });

        function handleOutsideClick(event) {
            if (!menu.contains(event.target) && !document.getElementById('burger-menu-toggle').contains(event.target)) {
                menu.style.display = 'none';
                overlay.style.display = 'none';
                document.removeEventListener('click', handleOutsideClick);
            }
        }

        document.addEventListener('click', handleOutsideClick);
    }
}

export async function loadBurgerMenuData() {
    try {
        const data = await Api.get('/accounts/get_burger_menu_data/');
        if (data.error) {
            console.error('Erreur:', data.error);
            return;
        }
        $('#profile-avatar').attr('src', data.data.avatar_url);
        $('#profile-username').text(data.data.username);

        const burgerButton = $('#burger-menu-toggle');
        if (burgerButton.length) {
            burgerButton.css({
                'background-image': `url('${data.data.avatar_url}')`,
                'background-size': 'cover',
                'background-position': 'center'
            });
        }

        const statusIndicator = $('#status-indicator');
        if (data.data.is_online) {
            statusIndicator.addClass('online').removeClass('offline');
        } else {
            statusIndicator.addClass('offline').removeClass('online');
        }

        const friendsListContainer = $('#friends-list-container');
        friendsListContainer.empty();

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
                friendsListContainer.append(friendItem);
            });
        } else {
            friendsListContainer.html('<p class="text-center">Aucun ami pour le moment.</p>');
        }

        updateFriendRequestsList(data.data.friend_requests);
        initializeFriendButtons();
    } catch (error) {
        console.error('Erreur chargement burger-menu:', error);
    }
}
