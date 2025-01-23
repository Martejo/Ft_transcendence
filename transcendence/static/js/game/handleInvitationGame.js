
// game/invitations.js
import { requestPost, requestGet }  from '../api/index.js';
import { showStatusMessage, updateHtmlContent } from '../tools/index.js';
import { HTTPError } from '../api/index.js';

let invitedFriends = 0;
let participantCount = 1;





////// Section bugerMenu ///////


export async function handleGameInvitationBurgerMenu(invitationId, action) {
    try {
        if (action === 'accept') {
            // On appelle AcceptGameInvitationView
            // => par exemple /game/accept_invitation/ID/
            const url = `accept_invitation/${invitationId}`;
            const formData = new FormData();

            const response = await requestPost('game', url, formData);
            if (response.status === 'success') {
                console.log('Invitation acceptée => session créée :', response);
                document.querySelector(`[data-invitation-id="${invitationId}"]`)?.closest('.invitation-item')?.remove();
                alert('Partie créée ! ID : ' + response.session.id);
            } else {
                console.error('Erreur à l\'acceptation :', response.message);
            }
        } 
        else if (action === 'decline') {
            // On appelle respond_to_invitation
            const formData = new FormData();
            formData.append('invitation_id', invitationId);
            formData.append('action', 'decline');

            const response = await requestPost('game', 'respond_to_invitation', formData);
            if (response.status === 'success') {
                console.log('Invitation refusée :', response);
                document.querySelector(`[data-invitation-id="${invitationId}"]`)?.closest('.invitation-item')?.remove();
            } else {
                console.error('Erreur lors du refus :', response.message);
            }
        }
    } catch (error) {
        console.error('Erreur réseau lors du traitement de l\'invitation :', error);
    }
}


////// Section invitation partie en ligne ///////

/**
 * On conserve ici les paramètres "onlineParams" dans une variable
 * afin de les retrouver dans le listener quand on clique sur "Inviter".
 */

let cachedOnlineParams = null;

/**
 * Fonction appelée depuis gameMenu.js quand on clique "Inviter un ami" (section online).
 * Elle reçoit les paramètres de jeu, fait un GET pour afficher la liste d'amis, etc.
 */
export async function handleInviteGame(onlineParams) {

    console.log('[handleInviteGame] Inviter un ami pour une partie en ligne');
    console.log('[handleInviteGame] Paramètres online reçus : ', onlineParams);

    // On stocke en variable globale/locale pour s'en servir lors du sendInvitation()
    cachedOnlineParams = onlineParams;

    try {
        // Récupère le template d'invitation (liste d'amis)
        const response = await requestGet('game', 'invite_game'); // => renvoie {status, html, ...}
        
        if (response.status === 'error') {
            // Affiche un message d'erreur si l'utilisateur n'a pas d'amis par ex.
            showStatusMessage(response.message, 'error');
        } else {
            // Injecte le HTML dans #content
            updateHtmlContent('#content', response.html);

            // Initialise les boutons d'invitation
            initializeFriendInvitationBtn();
        }
    } catch (error) {
        if (error instanceof HTTPError) {
            showStatusMessage(error.message, 'error');
        } else {
            showStatusMessage('Une erreur est survenue.', 'error');
        }
        console.error('Erreur lors de handleInviteGame :', error);
    }
}

/**
 * Au clic sur un bouton "Inviter", on envoie un POST avec friend_username + paramètres online.
 */
function initializeFriendInvitationBtn() {
    document.addEventListener('click', async (event) => {
        const btn = event.target.closest('.invite-button');
        if (!btn) return; // on ne gère que les .invite-button

        // Si on clique sur la croix de l'invitation "Envoyé X"
        if (event.target.classList.contains('cancel-icon')) {
            event.stopPropagation();
            await cancelInvitation(btn);
            return;
        }

        // Sinon, s’il n’y a pas encore d’invitation envoyée
        if (!btn.classList.contains('sent')) {
            await sendInvitation(btn);
        }
    });
}

async function sendInvitation(button) {
    console.log('[sendInvitation] Envoi de l\'invitation...');
    
    // Récupération du nom d'utilisateur depuis l'attribut data-username
    const friendUsername = button.closest('li')?.getAttribute('data-username');
    if (!friendUsername) {
        console.error('Nom d\'utilisateur introuvable.');
        return;
    }

    // Création des données du formulaire
    // => On ajoute *tous* les champs requis par SendInvitationForm
    const formData = new FormData();
    formData.append('friend_username', friendUsername);

    // On pioche dans cachedOnlineParams
    // (ceux qu’on a stockés dans handleInviteGame)
    if (cachedOnlineParams) {
        console.log('Paramètres online en cache :', cachedOnlineParams);
        formData.append('ball_speed',               cachedOnlineParams.ball_speed);
        formData.append('racket_size',             cachedOnlineParams.racket_size);
        formData.append('bonus_malus_activation',  cachedOnlineParams.bonus_malus_activation);
        formData.append('bumpers_activation',      cachedOnlineParams.bumpers_activation);
    } else {
        console.warn('Aucun paramètre en cache pour la partie online');
    }

    try {
        // Envoi de l'invitation via une requête POST
        const response = await requestPost('game', 'send_invitation', formData);

        if (response.status === 'success') {
            // Mise à jour de l'état du bouton après succès
            button.innerHTML = 'Envoyé <span class="cancel-icon">&times;</span>';
            button.classList.add('sent');
            button.disabled = false;
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

    console.log('[cancelInvitation] Annulation de l\'invitation envoyée à', friendUsername);
    const formData = new FormData();
    formData.append('friend_username', friendUsername);

    try {
        const response = await requestPost('game', 'cancel_invitation', formData);
        if (response.status === 'success') {
            button.innerHTML = 'Inviter';
            button.classList.remove('sent');
        }
    } catch (error) {
        console.error('Erreur annulation invitation:', error);
    }
}