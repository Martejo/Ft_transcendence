// // Initialisation de l'invitation des amis
// function initializeFriendInvitation(participantCount) {
// 	let invitedFriends = 0;

// 	// Gestion de l'invitation avec le bouton
// 	$('.invite-button').click(function() {
// 		const $button = $(this);
		
// 		if (!$button.hasClass('sent')) {
// 			// Ajouter le texte "Envoyé" avec la croix
// 			$button.html('Envoyé <span class="cancel-icon">&times;</span>');
// 			$button.addClass('sent'); // Ajouter une classe indiquant que le bouton est en état "Envoyé"

// 			invitedFriends++;
// 		}
// 		if (invitedFriends >= participantCount) { //ici la condition sera si le nombre de bouton avec état "accepté" a atteint le nombre de participant
// 			if (participantCount === 1)
// 				$('#start-game-btn').removeAttr('disabled'); 
// 			else
// 				$('#start-tournament-btn').removeAttr('disabled'); // Activer le bouton "Commencer"
// 			$('.invite-button').not('.sent').addClass('disabled');
// 		}

// 		// Gestion de l'annulation via la croix
// 		$button.find('.cancel-icon').off('click').on('click', function(event) {
// 			event.stopPropagation(); // Empêcher l'événement de se propager au bouton
// 			cancelInvitation($button);
// 		});
// 		console.log("invited : ",invitedFriends);
// 	});

// 	// Fonction pour annuler une invitation
// 	function cancelInvitation(button) {
// 		button.html('Inviter'); // Remettre le texte à "Inviter"
// 		button.removeClass('sent'); // Retirer l'état "Envoyé"
// 		invitedFriends--;

// 		// Si le nombre d'invitations est inférieur au maximum, désactiver "Commencer" et réactiver les boutons d'invitation
// 		if (invitedFriends < participantCount) {
// 			if (participantCount === 1)
// 				$('#start-game-btn').attr('disabled', true);
// 			else
// 				$('#start-tournament-btn').attr('disabled', true);
// 			$('.invite-button').removeClass('disabled');
// 		}
// 	}

// 	// Ecoute pour le bouton "Commencer" du tournoi si participantCount != 1
// 	$('#start-tournament-btn, #start-game-btn').click(function() {
// 		startLoading(participantCount); // Charger la page d'attente
// 	});
// }

// Initialisation de l'invitation des amis
function initializeFriendInvitation(participantCount) {

    let invitedFriends = 0;
    // Déléguer l'événement de clic pour le bouton principal et la croix via un parent fixe
    $(document).on('click', '.invite-button', function(event) {
        const $button = $(this);

        // Si l'utilisateur clique sur la croix, annuler l'invitation
        if ($(event.target).hasClass('cancel-icon')) {
            event.stopPropagation(); // Empêcher l'événement de se propager au bouton principal
            cancelInvitation($button);
            return;
        }

        // Si le bouton n'est pas en état "Envoyé", envoyer l'invitation
        if (!$button.hasClass('sent')) {
            const friendUsername = $button.siblings('.friend-btn').text();

            // Envoyer l'invitation via une requête AJAX
            $.ajax({
                url: '/game/send_invitation/', // Vue Django qui enverra l'invitation
                method: 'POST',
                data: { friend_username: friendUsername },
                success: function(response) {
                    if (response.status === 'success') {
                        // Ajouter le texte "Envoyé" avec la croix
                        $button.html('Envoyé <span class="cancel-icon">&times;</span>');
                        $button.addClass('sent'); // Ajouter une classe indiquant que le bouton est en état "Envoyé"
                        invitedFriends++;

                        // Désactiver les autres boutons d'invitation si nécessaire
                        if (invitedFriends >= participantCount) {
                            $('.invite-button').not($button).addClass('disabled');
                            // Activer le bouton "Commencer"
                            if (participantCount === 1) {
                                $('#setting-game-btn').removeAttr('disabled');
                            } else {
                                $('#start-tournament-btn').removeAttr('disabled');
                            }
                        }
                    }
                },
                error: function(error) {
                    console.error('Erreur lors de l\'envoi de l\'invitation :', error);
                }
            });
        }
    });

    // Fonction pour annuler une invitation
    function cancelInvitation(button) {
        const friendUsername = button.siblings('.friend-btn').text();

        // Envoyer une requête AJAX pour annuler l'invitation
        $.ajax({
            url: '/game/cancel_invitation/', // Vue Django qui annule l'invitation
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(), // Ajoute le token CSRF pour la sécurité
            },
            data: { friend_username: friendUsername },
            success: function(response) {
                if (response.status === 'success') {
                    // Remettre le texte du bouton à "Inviter"
                    button.html('Inviter');
                    button.removeClass('sent'); // Retirer l'état "Envoyé"
                    invitedFriends--;

                    // Désactiver le bouton "Commencer" si nécessaire et réactiver les autres boutons
                    if (invitedFriends < participantCount) {
                        if (participantCount === 1) {
                            $('#setting-game-btn').attr('disabled', true);
                        } else {
                            $('#start-tournament-btn').attr('disabled', true);
                        }
                        $('.invite-button').removeClass('disabled');
                    }
                }
            },
            error: function(error) {
                console.error('Erreur lors de l\'annulation de l\'invitation :', error);
            }
        });
    }
		// // Ecoute pour le bouton "Commencer" du tournoi si participantCount != 1
		// $('#start-tournament-btn, #start-game-btn').click(function() {
		// 	startLoading(participantCount); // Charger la page d'attente
		// });
}

function initializeRemoteMenu(participantCount) {
    // Utiliser un gestionnaire d'événements délégué
    $(document).on('click', '#start-tournament-btn, #start-game-btn', function() {

        // Vérifier que participantCount existe avant d'appeler startLoading
        if (typeof participantCount !== 'undefined') {
            startLoading(participantCount); // Charger la page d'attente
        } else {
            console.error('participantCount est non défini');
        }
    });
}

let loadingTimeout;


// Page de chargement avant le tournoi
function startLoading(participantCount) {
	if (loadingTimeout) {
        clearTimeout(loadingTimeout);
    }
	// Charger la page de chargement personnalisée avec AJAX
    $.ajax({
        url: '/game/loading/', // Chemin vers votre fichier HTML de chargement
        method: 'GET',
        success: function(response) {
			 // Masquer la div contenant le terrain de jeu et désactiver l'animation
			//  $('#ground-game').hide();  // Masquer la div contenant le terrain de jeu

			//  // Arrêter l'animation du terrain de jeu
			//  stopPongAnimation();
            $('#content').html(response); // Injecter le contenu de loading.html dans #hom
			animateLoadingText();
			if (isTouchDevice()) {
                console.log('Appareil tactile détecté. Activation des contrôles tactiles.');
                initializeGameControls('touch'); // Active les contrôles tactiles
            }
			else {
				console.log('Pas un appareil tactile. Aucun contrôle tactile activé.');
				initializeGameControls('keyboard'); // Active les contrôles clavier
			}
			// initializeNavigation();  // A voir avec hamza
            // Définir le timeout pour charger soit le jeu, soit le tournoi
			loadingTimeout = setTimeout(function() {
                if (participantCount === 1) {
                    displayGame(); // Charger le jeu
                } else {
                    displayTournamentBracket(participantCount); // Charger le tableau de tournoi
                }
            }, 20000); // Attendre 20 seconde avant de charger le jeu ou le tournoi (jeu animation js pour le chargement)
        },
        error: function(error) {
            console.log("Erreur lors du chargement de la page de chargement :", error);
        }
    });
}

function animateLoadingText() {
    const loadingText = document.getElementById('loading-text');
    const loadingDots = document.getElementById('loading-dots');
    let dotCount = 0;

    // Crée trois éléments de point pour l'animation
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.innerText = '.';
        dot.style.display = 'inline-block';
		dot.style.fontSize = '1.7em';
        dot.style.transition = 'transform 0.3s ease';
        loadingDots.appendChild(dot);
    }

    const dots = loadingDots.children;

    setInterval(() => {
        // Réinitialise la transformation de tous les points
        for (let i = 0; i < dots.length; i++) {
            dots[i].style.transform = 'translateY(0)';
        }

        // Applique un effet de rebond au point actuel
        dots[dotCount].style.transform = 'translateY(-10px)';
        
        // Passe au point suivant ou revient au début
        dotCount = (dotCount + 1) % dots.length;
    }, 300); // Intervalle de 300 ms pour un rebond fluide
}


// Affichage du jeu
function displayGame() {
	$.ajax({
		url: 'game.html', // La page à charger pour le jeu
		method: 'GET',
		success: function(response) {
			$('#home').html(response); // Charger le contenu dans #home
			if ($('#ground-game').length) {
				groundGameContent = $('#ground-game').detach();
			} // Cache le terrain de jeu
			addMenuButton();
			initializeNavigation(); // Réinitialise les écouteurs d’événements
			resetScrollPosition(); // Réinitialiser le scroll
		},
		error: function(error) {
			console.log("Erreur lors du chargement de la page du jeu :", error);
		}
	});
}

// Affichage du tableau du tournoi
function displayTournamentBracket(_participantCount) {
	$.ajax({
		url: _participantCount === 4 ? 'bracket_4.html' : 'bracket_8.html', // La page avec le tableau du tournoi
		method: 'GET',
		success: function(response) {
			$('#home').html(response); // Afficher le tableau
			resetScrollPosition(); // Réinitialiser le scroll
		},
		error: function(error) {
			console.log("Erreur lors du chargement du tableau du tournoi :", error);
		}
	});
}