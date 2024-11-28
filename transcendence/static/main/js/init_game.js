// Initialisation de l'invitation des amis
function initializeFriendInvitation(participantCount) {
	let invitedFriends = 0;

	// Gestion de l'invitation avec le bouton
	$('.invite-button').click(function() {
		const $button = $(this);
		
		if (!$button.hasClass('sent')) {
			// Ajouter le texte "Envoyé" avec la croix
			$button.html('Envoyé <span class="cancel-icon">&times;</span>');
			$button.addClass('sent'); // Ajouter une classe indiquant que le bouton est en état "Envoyé"

			invitedFriends++;
		}
		if (invitedFriends >= participantCount) { //ici la condition sera si le nombre de bouton avec état "accepté" a atteint le nombre de participant
			if (participantCount === 1)
				$('#start-game-btn').removeAttr('disabled'); 
			else
				$('#start-tournament-btn').removeAttr('disabled'); // Activer le bouton "Commencer"
			$('.invite-button').not('.sent').addClass('disabled');
		}

		// Gestion de l'annulation via la croix
		$button.find('.cancel-icon').off('click').on('click', function(event) {
			event.stopPropagation(); // Empêcher l'événement de se propager au bouton
			cancelInvitation($button);
		});
		console.log("invited : ",invitedFriends);
	});

	// Fonction pour annuler une invitation
	function cancelInvitation(button) {
		button.html('Inviter'); // Remettre le texte à "Inviter"
		button.removeClass('sent'); // Retirer l'état "Envoyé"
		invitedFriends--;

		// Si le nombre d'invitations est inférieur au maximum, désactiver "Commencer" et réactiver les boutons d'invitation
		if (invitedFriends < participantCount) {
			if (participantCount === 1)
				$('#start-game-btn').attr('disabled', true);
			else
				$('#start-tournament-btn').attr('disabled', true);
			$('.invite-button').removeClass('disabled');
		}
	}

	// Ecoute pour le bouton "Commencer" du tournoi si participantCount != 1
	$('#start-tournament-btn, #start-game-btn').click(function() {
		startLoading(participantCount); // Charger la page d'attente
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
        url: 'loading.html', // Chemin vers votre fichier HTML de chargement
        method: 'GET',
        success: function(response) {
            $('#home').html(response); // Injecter le contenu de loading.html dans #home
			animateLoadingText();
			if (isTouchDevice()) {
                console.log('Appareil tactile détecté. Activation des contrôles tactiles.');
                initializeGameControls('touch'); // Active les contrôles tactiles
            }
			else {
				console.log('Pas un appareil tactile. Aucun contrôle tactile activé.');
				initializeGameControls('keyboard'); // Active les contrôles clavier
			}
			initializeNavigation(); 
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