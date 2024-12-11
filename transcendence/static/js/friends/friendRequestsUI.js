import { handleFriendRequest } from './friendRequestsAPI.js';
import { loadBurgerMenuData } from '../navbar/loadBurgerMenuData.js';

function clearFriendRequestsList(container) {
    container.innerHTML = '';
}

function renderNoFriendRequests(container) {
    container.innerHTML = '<p class="text-center">Aucune invitation pour le moment.</p>';
}

function createRequestItemHTML(request) {
    return `
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
}

function addRequestItemToList(container, request) {
    const requestItem = createRequestItemHTML(request);
    container.insertAdjacentHTML('beforeend', requestItem);
}

function attachEventListeners(container) {
    container.querySelectorAll('button[data-request-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const requestId = btn.getAttribute('data-request-id');
            const action = btn.getAttribute('data-action');
            
            const result = await handleFriendRequest(requestId, action);
            if (result.success) {
                alert(result.message);
                await loadBurgerMenuData();
            } else {
                console.error('Erreur:', result.message);
            }
        });
    });
}

//m
export function updateFriendRequestsList(friendRequests) {
    const friendRequestsListElement = document.getElementById('friend-requests-list-container');
    if (!friendRequestsListElement) return;

    clearFriendRequestsList(friendRequestsListElement);

    if (!friendRequests || friendRequests.length === 0) {
        renderNoFriendRequests(friendRequestsListElement);
    } else {
        friendRequests.forEach(request => addRequestItemToList(friendRequestsListElement, request));
        attachEventListeners(friendRequestsListElement);
    }
}
