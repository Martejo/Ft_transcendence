// game/invitations.js
import { requestPost, requestGet }  from '../api/index.js';
import { showStatusMessage, updateHtmlContent } from '../tools/index.js';
import { HTTPError } from '../api/index.js';

let invitedFriends = 0;
let participantCount = 1;

async function sendInvitation(button) {
    console.log('Envoi de l\'invitation...');
    
    // Récupération du nom d'utilisateur depuis l'attribut data-username
    const friendUsername = button.closest('li')?.getAttribute('data-username');
    if (!friendUsername) {
        console.error('Nom d\'utilisateur introuvable.');
        return;
    }

    // Création des données du formulaire
    const formData = new FormData();
    formData.append('friend_username', friendUsername);
    console.log('Invitation envoyée à', friendUsername);

    try {
        // Envoi de l'invitation via une requête POST
        const response = await requestPost('game', 'send_invitation', formData);

        if (response.status === 'success') {
            // Mise à jour de l'état du bouton après succès
            button.innerHTML = 'Envoyé <span class="cancel-icon">&times;</span>';
            button.classList.add('sent');
            button.disabled = false; // Empêche de cliquer plusieurs fois
        } else {
            throw new Error(response.message || 'Erreur inconnue');
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'invitation :', error);

        // Affichage d'une erreur pour l'utilisateur
        button.textContent = 'Erreur';
        button.classList.add('error');
        setTimeout(() => {
            button.innerHTML = 'Inviter <span class="cancel-icon d-none">&times;</span>';
            button.classList.remove('error');
        }, 3000);
    }
}
async function cancelInvitation(button) {
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

function initializeFriendInvitation() {
    document.addEventListener('click', async (event) => {
        try {
            const btn = event.target.closest('.invite-button');
            if (!btn) return; // Ignorer si le clic n'est pas sur un bouton d'invitation

            // Gestion de l'annulation d'une invitation
            if (event.target.classList.contains('cancel-icon')) {
                event.stopPropagation();
                await cancelInvitation(btn);
                return;
            }

            // Gestion de l'envoi d'une invitation
            if (!btn.classList.contains('sent')) {
                console.log('Envoi d\'invitation...');
                await sendInvitation(btn);
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de l\'invitation :', error);
        }
    });
}



export async function handleInviteGame() {
    console.log('Tentative d\'envoi d\'invitation...');
    try {
        const response = await requestGet('game', 'invite_game'); // Exemple de requête
        
        if (response.status === 'error') {
            // Affiche le message d'erreur envoyé par le backend
            
            showStatusMessage(response.message, 'error');
        } else {
            // Met à jour le contenu avec la liste des amis
            updateHtmlContent('#content', response.html);
            initializeFriendInvitation(); // Initialise les boutons d'invitation
        }
    } catch (error) {
        if (error instanceof HTTPError) {
            // Affiche les erreurs spécifiques au backend
            console.log('rentre ici');
            showStatusMessage(error.message, 'error');
        } else {
            // Affiche une erreur générique pour les autres cas
            showStatusMessage('Une erreur est survenue.', 'error');
        }
        console.error('Erreur lors de l\'envoi de l\'invitation :', error);
    }
}

