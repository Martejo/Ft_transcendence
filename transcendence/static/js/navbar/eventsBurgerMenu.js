// Initialise tous les gestionnaires d'événements pour les interactions utilisateur
export function eventsHandlerBurgerMenu() {
	// Gestion du clic sur le profil utilisateur (avatar ou nom)
    const profileAvatar = document.querySelector('#profile-avatar');
    const profileUsername = document.querySelector('#profile-username');

    if (profileAvatar) {
        profileAvatar.addEventListener('click', () => {
            console.log('Avatar cliqué');
            handleProfileClick();
        });
    }

    if (profileUsername) {
        profileUsername.addEventListener('click', () => {
            console.log('Nom d\'utilisateur cliqué');
            handleProfileClick();
        });
    }

    // Gestion du changement de statut (en ligne / hors ligne)
    const statusButtons = document.querySelectorAll('.status-selector button');
    statusButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const status = e.target.textContent.toLowerCase();
            console.log(`Changement de statut : ${status}`);
            handleStatusChange(status);
        });
    });

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
        addFriendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const friendUsername = document.querySelector('#friend-username').value;
            console.log(`Ajout d'ami : ${friendUsername}`);
            handleAddFriend(friendUsername);
        });
    }

    // Gestion des clics sur les boutons des amis
    const friendsListContainer = document.querySelector('#friends-list-container');
    if (friendsListContainer) {
        friendsListContainer.addEventListener('click', (e) => {
            const friendButton = e.target.closest('.friend-btn');
            if (friendButton) {
                const username = friendButton.getAttribute('data-username');
                console.log(`Ami cliqué : ${username}`);
                handleFriendClick(username);
            }
        });
    }

    // Gestion des invitations d'amis
    const friendRequestsContainer = document.querySelector('#friend-requests-list-container');
    if (friendRequestsContainer) {
        friendRequestsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                const requestId = button.getAttribute('data-request-id');
                const action = button.classList.contains('btn-success') ? 'accept' : 'decline';
                console.log(`Invitation d'ami : ${requestId}, action : ${action}`);
                handleFriendRequest(requestId, action);
            }
        });
    }

    // Gestion du formulaire de déconnexion
    const logoutButton = document.querySelector('#logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('Déconnexion demandée');
            handleLogout();
        });
    }

    // Gestion des options d'ami dans le popup
    const friendPopup = document.querySelector('#friendPopup');
    if (friendPopup) {
        friendPopup.addEventListener('click', (e) => {
            const optionButton = e.target.closest('button');
            if (optionButton) {
                const action = optionButton.textContent;
                const friendName = document.querySelector('#popupFriendName').innerText;
                console.log(`Option sélectionnée : ${action} pour ${friendName}`);
                handleFriendOption(action, friendName);
            }
        });
    }

    console.log('Tous les gestionnaires d\'événements ont été initialisés.');
}

// Fonctions vides à implémenter
function handleProfileClick() {
	console.log('handleProfileClick');
}
function handleStatusChange(status) {
	console.log('handleStatusChange');
}
function handlePlayClick() {
	console.log('handlePlayClick');
}
function handleTournamentClick() {
	console.log('handleTournamentClick');
}
function handleSettingsClick() {
	console.log('handleSettingsClick');
}
function handleAddFriend(friendUsername) {
	console.log('handleAddFriend');
}
function handleFriendClick(username) {
	console.log('handleFriendClick');
}
function handleFriendRequest(requestId, action) {
	console.log('handleFriendRequest');
}
function handleLogout() {
	console.log('handleLogout');
}
function handleFriendOption(action, friendName) {
	console.log('handleFriendOption');
}
