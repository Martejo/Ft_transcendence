// friends/friendRequests.js
import Api from '../api/api.js';
import { loadBurgerMenuData } from '../navbar/loadBurgerMenuData.js';  // Si vous en avez besoin pour rafraîchir le menu.

export function updateFriendRequestsList(friendRequests) {
    const friendRequestsListElement = document.getElementById('friend-requests-list-container');
    if (!friendRequestsListElement) return;

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
                            <button class="btn btn-success btn-sm me-2" data-request-id="${request.id}" data-action="accept">Accepter</button>
                            <button class="btn btn-danger btn-sm" data-request-id="${request.id}" data-action="decline">Refuser</button>
                        </div>
                    </div>
                </li>
            `;
            friendRequestsListElement.insertAdjacentHTML('beforeend', requestItem);
        });

        // Ajout des eventListeners sur les boutons accept/decline
        friendRequestsListElement.querySelectorAll('button[data-request-id]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const requestId = btn.getAttribute('data-request-id');
                const action = btn.getAttribute('data-action');
                await handleFriendRequest(requestId, action);
            });
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
            await loadBurgerMenuData(); // Rechargement du menu burger pour voir les changements
        } else {
            console.error('Erreur:', response.error);
        }
    } catch (error) {
        console.error('Erreur traitement invitation:', error);
    }
}
