//friends/friendActions.js
//fonctions actuellement inutilisees dans le code

import Api from '../api/api.js';

export async function sendFriendRequest(toUserId) {
    try {
        const response = await Api.post(`/api/send_friend_request/${toUserId}/`, null);
        alert(response.message);
        refreshFriendsList();
    } catch (error) {
        alert('Erreur lors de l\'envoi de la demande: ' + (error.message || ''));
    }
}

export async function removeFriend(friendId) {
    try {
        const response = await Api.post(`/api/remove_friend/${friendId}/`, null);
        alert(response.message);
        refreshFriendsList();
    } catch (error) {
        alert('Erreur suppression ami: ' + (error.message || ''));
    }
}

export async function refreshFriendsList() {
    try {
        const data = await Api.get('/api/get_burger_menu_data/');
        const friendsListContainer = $('#friends-list-container');
        friendsListContainer.empty();

        if (data.friends && data.friends.length > 0) {
            data.friends.forEach(friend => {
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
    } catch (error) {
        console.error('Erreur rafraichissement liste amis:', error);
        $('#friends-list-container').html('<p class="text-center text-danger">Erreur de chargement.</p>');
    }
}
