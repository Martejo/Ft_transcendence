import { logoutUser } from '../auth/index.js';
import { initializeProfileView } from '../profile/index.js';
import { updateUserStatus } from './status.js';
import { handleViewProfile } from './profile.js';
import { handleAddFriend } from './addFriend.js';
import { requestPost } from '../api/index.js';
import { handleFriendRequest } from './handleFriend.js';
import { viewFriendProfile } from './viewFriendProfile.js';

// Fonctions utilitaires pour afficher les messages d'erreur et de succès
function displayErrorMessage(elementId, message) {
    const errorElement = document.querySelector(`#${elementId}`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Initialise tous les gestionnaires d'événements pour les interactions utilisateur
export function eventsHandlerBurgerMenu() {
    console.log('Initialisation des gestionnaires d\'événements...');

    // Gestion du changement de statut (en ligne / hors ligne)
    const statusButtons = document.querySelectorAll('.status-selector button[data-status]');
    statusButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const status = e.target.dataset.status;
            if (status) {
                console.log(`Changement de statut : ${status}`);
                handleStatusChange(status);
            }
        });
    });

    // Gestion du clic sur "Voir le profil"
    const profileBtn = document.querySelector('#profile-btn');
    if (profileBtn) {
        profileBtn.removeEventListener('click', handleViewProfile);
        profileBtn.addEventListener('click', handleViewProfile);
    }

    // Gestion des liens de navigation
    const navigationButtons = [
        { selector: '#play-btn', action: handlePlayClick },
        { selector: '#tournament-link', action: handleTournamentClick },
        { selector: '#settings-link', action: handleSettingsClick }
    ];
    navigationButtons.forEach(nav => {
        const button = document.querySelector(nav.selector);
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`${nav.selector} cliqué`);
                nav.action();
            });
        }
    });

    // Gestion du formulaire pour ajouter un ami
    const addFriendForm = document.querySelector('#add-friend-form');
    if (addFriendForm) {
        addFriendForm.removeEventListener('submit', handleAddFriendFormSubmit);
        addFriendForm.addEventListener('submit', handleAddFriendFormSubmit);
    }

    // Gestion des clics sur les boutons des amis
    const friendsListContainer = document.querySelector('#friends-list-container');
    if (friendsListContainer) {
        friendsListContainer.addEventListener('click', (e) => {
            const friendButton = e.target.closest('.friend-btn');
            if (friendButton) {
                const username = friendButton.innerText.trim();
                if (username) {
                    console.log(`Ami cliqué : ${username}`);
                    showFriendPopup(e, username);
                }
            }
        });
    }

    // Gestion des invitations d'amis
    const friendRequestsContainer = document.querySelector('#friend-requests-list-container');
    if (friendRequestsContainer) {
        friendRequestsContainer.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if (button) {
                const requestId = button.getAttribute('data-request-id');
                const action = button.getAttribute('data-action');
                if (requestId) {
                    console.log(`Invitation d'ami : ${requestId}, action : ${action}`);
                    const result = await handleFriendRequest(requestId, action);
                    if (result.success) {
                        console.log(result.message);
                    } else {
                        console.error(result.message);
                    }
                }
            }
        });
    }

    // Gestion des boutons dans le popup
    const viewProfileBtn = document.getElementById('view-profile-btn');
    const inviteToPlayBtn = document.getElementById('invite-to-play-btn');
    const removeFriendBtn = document.getElementById('remove-friend-btn');

    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', () => handleOption('Voir le profil'));
    }

    if (inviteToPlayBtn) {
        inviteToPlayBtn.addEventListener('click', () => handleOption('Inviter à jouer'));
    }

    if (removeFriendBtn) {
        removeFriendBtn.addEventListener('click', () => {
            const friendName = document.getElementById('popupFriendName').innerText.trim();
            handleRemoveFriend(friendName);
        });
    }

    // Ferme le popup si on clique en dehors
    document.addEventListener('click', closePopupOnClickOutside);

    console.log('Tous les gestionnaires d\'événements ont été initialisés.');
}

// Fonction qui affiche le popup pour un ami
function showFriendPopup(event, friendName) {
    event.stopPropagation();

    const popup = document.getElementById('friendPopup');
    document.getElementById('popupFriendName').innerText = friendName;

    popup.classList.remove('d-none');

    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    const menu = document.getElementById('burger-menu');
    const menuRect = menu.getBoundingClientRect();
    const mouseX = event.clientX - menuRect.left + menu.scrollLeft;
    const mouseY = event.clientY - menuRect.top + menu.scrollTop;

    let top, left;

    if (mouseY < 250 && window.innerWidth - mouseX < 175) {
        top = mouseY + popupHeight;
        left = mouseX - (popupWidth / 2);
    } else if (mouseY < 250 && window.innerWidth - mouseX >= 175) {
        top = mouseY + popupHeight;
        left = mouseX + (popupWidth / 2);
    } else if (mouseY >= 250 && window.innerWidth - mouseX >= 175) {
        top = mouseY;
        left = mouseX + (popupWidth / 2);
    } else {
        top = mouseY;
        left = mouseX - (popupWidth / 2);
    }

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
}

// Fonction pour fermer le popup en cliquant en dehors
function closePopupOnClickOutside(event) {
    const popup = document.getElementById('friendPopup');
    if (!popup.contains(event.target) && !event.target.closest('.friend-item')) {
        popup.classList.add('d-none');
    }
}

// Fonction pour gérer les options sélectionnées
function handleOption(option) {
    const friendName = document.getElementById('popupFriendName').innerText.trim();
    if (option === 'Voir le profil') {
        viewFriendProfile(friendName);
    } else {
        console.log(`Option sélectionnée : ${option}`);
    }
}

// Fonction pour supprimer un ami
async function handleRemoveFriend(friendName) {
    console.log(`Suppression de l'ami : ${friendName}`);
    
    try {
        const formData = new FormData();
        formData.append('friend_username', friendName);

        const response = await requestPost('accounts', 'friends/remove', formData);

        if (response.status === 'success') {
            console.log(response.message);

            // Met à jour l'interface utilisateur
            const friendItem = document.querySelector(`.friend-btn:contains('${friendName}')`);
            if (friendItem) {
                friendItem.closest('.friend-item').remove();
            }

            // Ferme le popup
            document.getElementById('friendPopup').classList.add('d-none');
        } else {
            console.error(response.message);
            displayErrorMessage('friend-popup-error', response.message);
        }
    } catch (error) {
        console.error(`Erreur lors de la suppression de l'ami : ${error.message}`);
        displayErrorMessage('friend-popup-error', 'Une erreur est survenue lors de la suppression de l\'ami.');
    }
}

// Fonction pour gérer le formulaire d'ajout d'amis
function handleAddFriendFormSubmit(e) {
    e.preventDefault();
    const friendUsername = document.querySelector('#friend-username').value.trim();
    if (friendUsername) {
        console.log(`Ajout d'ami : ${friendUsername}`);
        handleAddFriend(friendUsername);
    } else {
        displayErrorMessage('add-friend-error', 'Le nom d\'utilisateur ne peut pas être vide.');
    }
}

function handleProfileClick() {
    console.log('handleProfileClick');
}

function handleStatusChange(status) {
    console.log('handleStatusChange:', status);
    updateUserStatus(status);
}

function handlePlayClick() {
    console.log('handlePlayClick');
}

function handleTournamentClick() {
    console.log('handleTournamentClick');
}

function handleSettingsClick() {
    console.log('handleSettingsClick');
    initializeProfileView();
}

function handleFriendClick(username) {
    console.log('handleFriendClick:', username);
}

function handleLogout() {
    console.log('handleLogout');
    logoutUser();
}

function handleFriendOption(action, friendName) {
    console.log('handleFriendOption:', action, friendName);
}
