import Api from '../api/api.js';
import { loadBurgerMenuData } from './navbar.js';

export function initializeFriendButtons() {
    $('.friend-btn').off('click').on('click', function(event) {
        const friendName = $(this).data('username');
        showFriendPopup(event, friendName); // Supposez que showFriendPopup est défini ailleurs
    });
}

export function updateFriendRequestsList(friendRequests) {
    const friendRequestsListElement = document.getElementById('friend-requests-list-container');
    friendRequestsListElement.innerHTML = '';

    if (!friendRequests || friendRequests.length === 0) {
        friendRequestsListElement.innerHTML = '<p class="text-center">Aucune invitation pour le moment.</p>';
    } else {
        friendRequests.forEach(request => {
            const requestItem = `
                <li class="d-flex align-items-center mb-2 request-item">
                    <div class="position-relative">
                        <img src="${request.avatar_url}" class="rounded-circle me-3" style="width: 50px; height: 50px;">
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

export async function handleFriendRequest(requestId, action) {
    const formData = new FormData();
    formData.append('request_id', requestId);
    formData.append('action', action);

    try {
        const response = await Api.post('/accounts/handle_friend_request/', formData);
        if (response.status === 'success') {
            alert(`Invitation ${action}ée avec succès.`);
            await loadBurgerMenuData();
        } else {
            console.error('Erreur:', response.error);
        }
    } catch (error) {
        console.error('Erreur traitement invitation:', error);
    }
}

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
                        <button class="friend-btn" onclick="showFriendPopup(event, '${friend.username}')">${friend.username}</button>
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

// showFriendPopup est supposée être définie ailleurs.
