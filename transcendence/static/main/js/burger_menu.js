document.addEventListener('DOMContentLoaded', function() {
    const burgerButton = document.getElementById('burger-menu-toggle');
    if (burgerButton) {
        burgerButton.addEventListener('click', function() {
            toggleBurgerMenu();
        });
    }

    // Initialiser les boutons des amis
    initializeFriendButtons();
});

function toggleBurgerMenu() {
    const menu = document.getElementById('burger-menu');
    const overlay = document.getElementById('overlay');

    if (menu && overlay) {
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
            overlay.style.display = 'none';
        } else {
            menu.style.display = 'block';
            overlay.style.display = 'block';

            // Ajouter des gestionnaires de clics pour cacher le menu
            document.querySelectorAll('#profile-btn, #logout-btn, #tournament-link, #settings-link, #play-btn')
                .forEach(function (button) {
                    button.addEventListener('click', function () {
                        menu.style.display = 'none';
                        overlay.style.display = 'none';
                    });
                });

            // Ajouter un gestionnaire global pour cacher le menu en cas de clic à l'extérieur
            document.addEventListener('click', handleOutsideClick);
        }
    }

    // Fonction pour gérer le clic en dehors du menu
    function handleOutsideClick(event) {
        if (!menu.contains(event.target) && !document.getElementById('burger-menu-toggle').contains(event.target)) {
            // Si le clic n'est pas dans le menu ni sur le bouton burger, on cache le menu
            menu.style.display = 'none';
            overlay.style.display = 'none';

            // Retirer ce gestionnaire après avoir fermé le menu
            document.removeEventListener('click', handleOutsideClick);
        }
    }
}

function refreshAccessToken() {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.error('Refresh token manquant. Impossible de rafraîchir le token JWT.');
        return;
    }

    $.ajax({
        url: '/api/token/refresh/',
        method: 'POST',
        data: {
            'refresh': refreshToken
        },
        success: function(response) {
            console.log('Nouveau token JWT obtenu');
            sessionStorage.setItem('accessToken', response.access);
        },
        error: function(xhr, status, error) {
            console.error('Erreur lors de la tentative de rafraîchissement du token JWT :', error);
            // Rediriger vers la page de connexion
            window.location.hash = '#accounts-login';
        }
    });
}

function loadBurgerMenuData() {
    console.log("Appel à loadBurgerMenuData");

    $.ajax({
        url: '/accounts/get_burger_menu_data/',
        method: 'GET',
        cache: false,  // Empêche la mise en cache
        success: function(data) {
            console.log("Réponse reçue de l'API :", data);
            
            if (data.error) {
                console.error('Erreur :', data.error);
                return;
            }

            // Sauvegarde de l'URL de l'avatar pour une utilisation ultérieure
            const avatarUrl = data.data.avatar_url;

            // Mise à jour du nom d'utilisateur et de l'avatar
            $('#profile-avatar').attr('src', avatarUrl);
            $('#profile-username').text(data.data.username);

            // Mise à jour du bouton du menu burger avec l'avatar
            const burgerButton = $('#burger-menu-toggle');
            if (burgerButton.length) {
                // Utiliser l'avatar comme arrière-plan du bouton
                burgerButton.css({
                    'background-image': `url('${avatarUrl}')`,
                    'background-size': 'cover',
                    'background-position': 'center'
                });
            }

            // Mise à jour du statut en ligne du profil
            const statusIndicator = $('#status-indicator');
            if (data.data.is_online) {
                statusIndicator.addClass('online').removeClass('offline');
            } else {
                statusIndicator.addClass('offline').removeClass('online');
            }

            // Mise à jour de la liste des amis
            const friendsListContainer = $('#friends-list-container');
            friendsListContainer.empty();

            console.log("Amis récupérés :", data.data.friends);

            if (data.data.friends && data.data.friends.length > 0) {
                data.data.friends.forEach(function(friend) {
                    const friendItem = `
                        <li class="d-flex align-items-center mb-2 friend-item">
                            <div class="position-relative">
                                <img src="${friend.avatar_url}" alt="Avatar of ${friend.username}" class="rounded-circle me-3" style="width: 50px; height: 50px;">
                                <span class="status-indicator-friend ${friend.status === 'online' ? 'online' : 'offline'}"></span>
                            </div>
                            <button class="friend-btn" data-username="${friend.username}">${friend.username}</button>
                        </li>
                    `;
                    friendsListContainer.append(friendItem);
                });
            } else {
                console.log("Aucun ami trouvé.");
                friendsListContainer.html('<p class="text-center">Aucun ami pour le moment.</p>');
            }

            // Mise à jour des invitations d'amis
            updateFriendRequestsList(data.data.friend_requests);

            // Réinitialiser les boutons des amis après mise à jour
            initializeFriendButtons();
        },
        error: function(xhr, status, error) {
            console.error('Erreur lors du chargement des données du burger-menu :', error);
        }
    });
}


function initializeFriendButtons() {
    $('.friend-btn').off('click').on('click', function(event) {
        const friendName = $(this).data('username');
        showFriendPopup(event, friendName);
    });
}

function updateFriendRequestsList(friendRequests) {
    console.log('friendRequests reçu :', friendRequests);
    if (!Array.isArray(friendRequests)) {
        console.log("Les invitations d'amis sont mal définies ou ne sont pas un tableau:", friendRequests);
        friendRequests = [];
    }

    const friendRequestsListElement = document.getElementById('friend-requests-list-container');
    friendRequestsListElement.innerHTML = '';

    if (friendRequests.length === 0) {
        friendRequestsListElement.innerHTML = '<p class="text-center">Aucune invitation pour le moment.</p>';
    } else {
        friendRequests.forEach(request => {
            const requestItem = `
                <li class="d-flex align-items-center mb-2 request-item">
                    <div class="position-relative">
                        <img src="${request.avatar_url}" alt="Avatar of ${request.from_user}" class="rounded-circle me-3" style="width: 50px; height: 50px;">
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

function setStatus(status) {
    // Envoi de la requête AJAX pour mettre à jour le statut dans la base de données
    $.ajax({
        url: '/accounts/update_status/',
        method: 'POST',
        data: {
            status: status,
        },
        success: function(response) {
            if (response.status === 'success') {
                console.log('Statut mis à jour avec succès');

                // Utiliser la réponse du serveur pour mettre à jour l'indicateur de statut
                const statusIndicator = $('#status-indicator');
                if (statusIndicator) {
                    if (response.is_online) {
                        statusIndicator.addClass('online').removeClass('offline');
                    } else {
                        statusIndicator.addClass('offline').removeClass('online');
                    }
                }
            } else {
                console.error('Erreur lors de la mise à jour du statut :', response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Erreur lors de l\'envoi de la requête AJAX :', error);
        }
    });
}


function showFriendPopup(event, friendName) {
    event.stopPropagation();
    const popup = document.getElementById('friendPopup');
    document.getElementById('popupFriendName').innerText = friendName;

    popup.classList.remove('d-none');
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    const menu = document.getElementById('burger-menu');

    let top, left;

	const menuRect = menu.getBoundingClientRect();
	const mouseX = event.clientX - menuRect.left + menu.scrollLeft;
	const mouseY = event.clientY - menuRect.top + menu.scrollTop;


	if (mouseX >= 240 && event.clientY <= 250) {
		top = mouseY + popupHeight;
		left = mouseX - (popupWidth / 2);
	} else if (mouseX <= 240 && event.clientY <= 250) {
		top = mouseY + popupHeight;
		left = mouseX + (popupWidth / 2);
	} else if (mouseX <= 240 && event.clientY >= 250) {
		top = mouseY;
		left = mouseX + (popupWidth / 2);
	} else {
		top = mouseY;
		left = mouseX - (popupWidth / 2);
	}
	
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;

    document.addEventListener('click', closePopupOnClickOutside);
}

function closePopupOnClickOutside(event) {
    const popup = document.getElementById('friendPopup');
    if (!popup.contains(event.target) && !event.target.closest('.friend-item')) {
        popup.classList.add('d-none');
        document.removeEventListener('click', closePopupOnClickOutside);
    }
}

function handleOption(option) {
    const friendName = document.getElementById('popupFriendName').innerText;
	const menu = document.getElementById('burger-menu');
    const overlay = document.getElementById('overlay');

    if (option === 'Voir le profil') {
        loadContent('accounts', `friend_profile/${friendName}`);
 		menu.style.display = 'none';
		overlay.style.display = 'none';
    } else {
        alert(`${option} sélectionné`);
    }

    document.getElementById('friendPopup').classList.add('d-none');
}

function handleRemoveFriend(friendUsername) {
    $.ajax({
        url: '/accounts/remove_friend/',
        method: 'POST',
        data: {
            'friend_username': friendUsername,
            'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val()
        },
        success: function(response) {
            if (response.status === 'success') {
                alert(response.message);
                // Recharger la liste des amis après suppression
                loadBurgerMenuData();
            } else {
                console.error('Erreur lors de la suppression de l\'ami :', response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Erreur lors de la suppression de l\'ami :', error);
        }
    });
}

