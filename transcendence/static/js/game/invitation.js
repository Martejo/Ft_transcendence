// game/invitations.js
import { requestPost }  from '../api/index.js';


let invitedFriends = 0;
let participantCount = 1;

async function sendInvitation(button) {
    const friendBtn = button.parentElement.querySelector('.friend-btn');
    const friendUsername = friendBtn ? friendBtn.textContent : null;
    if (!friendUsername) return;

    const formData = new FormData();
    formData.append('friend_username', friendUsername);

    try {
        const response = await requestPost('game', 'send_invitation', formData);
        if (response.status === 'success') {
            button.innerHTML = 'Envoyé <span class="cancel-icon">&times;</span>';
            button.classList.add('sent');
            invitedFriends++;

            if (invitedFriends >= participantCount) {
                document.querySelectorAll('.invite-button:not(.sent)').forEach(el => el.classList.add('disabled'));
                if (participantCount === 1) {
                    document.querySelector('#start-game-btn').removeAttribute('disabled');
                } else {
                    document.querySelector('#start-tournament-btn').removeAttribute('disabled');
                }
            }
        }
    } catch (error) {
        console.error('Erreur envoi invitation:', error);
    }
}

export async function cancelInvitation(button) {
    const friendBtn = button.parentElement.querySelector('.friend-btn');
    const friendUsername = friendBtn ? friendBtn.textContent : null;
    if (!friendUsername) return;

    const formData = new FormData();
    formData.append('friend_username', friendUsername);

    try {
        const response = await requestPost('game', 'cancel_invitation', formData);
        if (response.status === 'success') {
            button.innerHTML = 'Inviter';
            button.classList.remove('sent');
            invitedFriends--;
            if (invitedFriends < participantCount) {
                if (participantCount === 1) {
                    document.querySelector('#start-game-btn').setAttribute('disabled', true);
                } else {
                    document.querySelector('#start-tournament-btn').setAttribute('disabled', true);
                }
                document.querySelectorAll('.invite-button').forEach(el => el.classList.remove('disabled'));
            }
        }
    } catch (error) {
        console.error('Erreur annulation invitation:', error);
    }
}

export function initializeFriendInvitation() {
    document.addEventListener('click', async function(event) {
        const btn = event.target.closest('.invite-button');
        if (!btn) return;

        if (event.target.classList.contains('cancel-icon')) {
            event.stopPropagation();
            await cancelInvitation(btn);
            return;
        }

        if (!btn.classList.contains('sent')) {
            sendInvitation(btn);
        }
    });

    document.querySelectorAll('#start-tournament-btn, #start-game-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Vous n'avez pas startLoading ici, on le gérera dans loading.js
            // On pourrait soit importer startLoading ici, soit laisser la logique
            // du "start" être gérée par la vue qui appelle initializeFriendInvitation.
            // Si vous voulez garder la même logique, importez startLoading :
            // import { startLoading } from './loading.js';
            // startLoading(participantCount);
        });
    });
}
