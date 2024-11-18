// Animation du texte des boutons de la page d'accueil
function animateTextColor() {
	let loginButton = document.getElementById('login-btn');
	let registerButton = document.getElementById('register-btn');
	let guestButton = document.getElementById('guest-btn');
	let apiButton = document.getElementById('api-btn');
	
	let isOriginalColor = true;
  
	setInterval(function() {
	  if (isOriginalColor) {
		
		setTimeout(function() {
		  if (registerButton) registerButton.style.color = "#8EC7E1";
		  if (loginButton) loginButton.style.color = "#8EC7E1"; 
		}, 10); 
  
		setTimeout(function() {
		  if (guestButton) guestButton.style.color = "#8EC7E1";
		  if (apiButton) apiButton.style.color = "#8EC7E1"; 
		}, 10); 
	  } else {
		setTimeout(function() {
		  if (registerButton) registerButton.style.color = "white"; 
		  if (loginButton) loginButton.style.color = "white"; 
		}, 10);
  
		setTimeout(function() {
		  if (guestButton) guestButton.style.color = "white"; 
		  if (apiButton) apiButton.style.color = "white"; 
		}, 10);
	  }
  
	  isOriginalColor = !isOriginalColor;
	}, 1000); 
}

// Ajuster la hauteur du menu burger avec marges
function adjustBurgerHeight() {
    const navAndMarginHeight = 66; // Hauteur navbar et marge pour le menu burger
    const availableHeight = window.innerHeight - navAndMarginHeight;
    document.documentElement.style.setProperty('--burger-height', `${availableHeight}px`);
}

// Ajuster la hauteur sans la barre navigation
function adjustSinNavHeight() {
    const navAndMarginHeight = 50; // Hauteur sans la navbar
    const availableHeight = window.innerHeight - navAndMarginHeight;
    document.documentElement.style.setProperty('--sin-nav-height', `${availableHeight}px`);
}


// lancement des fonctions au chargement de la page
window.onload = function() {
    animateTextColor();
    adjustBurgerHeight();
	adjustSinNavHeight();

    // Écouteur d'événement pour ajuster les hauteurs lors du redimensionnement de la page
    window.addEventListener('resize', () => {
        adjustBurgerHeight();
		adjustSinNavHeight();
    });
};

// animation terrain background

let balle = document.querySelector('.balle');
let traitGauche = document.querySelector('.trait-gauche');
let traitDroit = document.querySelector('.trait-droit');

// Dimensions du terrain en pourcentage
let terrainWidth = 80; // 80vw
let terrainHeight = 40; // 40vw

// Frames adaptées en pourcentage
let frames = [
  { balleX: 1, balleY: 47, raquetteGaucheY: 36.5, raquetteDroiteY: 36.5 },  // Frame 1
  { balleX: 48, balleY: 0, raquetteGaucheY: 0, raquetteDroiteY: 73 },       // Frame 2
  { balleX: 97, balleY: 47, raquetteGaucheY: 47, raquetteDroiteY: 26 },     // Frame 3
  { balleX: 41, balleY: 95, raquetteGaucheY: 7, raquetteDroiteY: 69 },      // Frame 4
  { balleX: 1, balleY: 60, raquetteGaucheY: 60, raquetteDroiteY: 10 },      // Frame 5
  { balleX: 53, balleY: 0, raquetteGaucheY: 7, raquetteDroiteY: 65 },       // Frame 6
  { balleX: 97, balleY: 37, raquetteGaucheY: 67, raquetteDroiteY: 32 },     // Frame 7
  { balleX: 48, balleY: 95, raquetteGaucheY: 7, raquetteDroiteY: 73 }       // Frame 8
];

let currentFrame = 0;
let maxFrames = frames.length;
let transitionTime = 2200; 

function deplacerBalleEtRaquettes() {
  let frameActuelle = frames[currentFrame];
  let prochaineFrame = frames[(currentFrame + 1) % maxFrames];
  let startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    let progress = (time - startTime) / transitionTime;

    if (progress < 1) {
      // Interpolation linéaire pour les coordonnées X et Y de la balle
      balle.style.left = frameActuelle.balleX + (prochaineFrame.balleX - frameActuelle.balleX) * progress + '%';
      balle.style.top = frameActuelle.balleY + (prochaineFrame.balleY - frameActuelle.balleY) * progress + '%';

      // Interpolation linéaire pour les positions des raquettes
      traitGauche.style.top = frameActuelle.raquetteGaucheY + (prochaineFrame.raquetteGaucheY - frameActuelle.raquetteGaucheY) * progress + '%';
      traitDroit.style.top = frameActuelle.raquetteDroiteY + (prochaineFrame.raquetteDroiteY - frameActuelle.raquetteDroiteY) * progress + '%';

      requestAnimationFrame(animate);
    } else {
      currentFrame = (currentFrame + 1) % maxFrames;
      setTimeout(() => requestAnimationFrame(deplacerBalleEtRaquettes), 0);
    }
  }

  requestAnimationFrame(animate);
}

// Initialisation des positions de la balle et des raquettes
balle.style.left = frames[0].balleX + '%';
balle.style.top = frames[0].balleY + '%';
traitGauche.style.top = frames[0].raquetteGaucheY + '%';
traitDroit.style.top = frames[0].raquetteDroiteY + '%';

// Lancement de l'animation
deplacerBalleEtRaquettes();

function adjustContainer(ContainerId) {
	const container = document.getElementById(ContainerId);
	if (!container) return;
	const threshold = 50; // Seuil de hauteur pour activer le centrage
	// Si le contenu dépasse la hauteur de l'écran, on enlève `center-content`
	if (container.scrollHeight > window.innerHeight - threshold) {
		container.classList.remove('center-content');
		container.classList.add('normal-content');
	} else {
		container.classList.add('center-content');
		container.classList.remove('normal-content');
	}
}

// Appeler la fonction au chargement et lors du redimensionnement de la fenêtre
window.addEventListener('load',function() {
    adjustContainer('invite-container'); // Remplacez 'invite-container' par l'ID voulu
	adjustContainer('guest');
	adjustContainer('register');
});
window.addEventListener('resize',function() {
    adjustContainer('invite-container'); // Remplacez 'invite-container' par l'ID voulu
	adjustContainer('guest');
	adjustContainer('register');
});

// Gestion des options de tournoi (4 ou 8 participants)
function initializeTournamentOptions() {
	// Ecoute pour les boutons de sélection de tournoi (par exemple #four-player-tournament et #eight-player-tournament)
	$("#tournament-4").click(() => setupTournament(4));
	$("#tournament-8").click(() => setupTournament(8));
}

// Configurer le tournoi pour le nombre de participants choisi
function setupTournament(participantCount) {
	// Charger la liste d'amis pour les invitations
	$.ajax({
		url: 'invite_tournament.html', // Charger la liste d'amis
		method: 'GET',
		success: function(response) {
			$('#home').html(response); // Afficher la liste des amis
			initializeFriendInvitation(participantCount); // Initialiser l'invitation des amis
			adjustContainer('invite-container');
			resetScrollPosition(); // Réinitialiser le scroll
		},
		error: function(error) {
			console.log("Erreur lors du chargement de la liste d'amis :", error);
		}
	});
}

// Initialisation de l'invitation des amis
function initializeFriendInvitation(participantCount) {
	let invitedFriends = 0;

	// Recherche d'amis avec saisie d'au moins 3 lettres
	$('#friend-search').on('input', function() {
		let searchQuery = $(this).val();
		if (searchQuery.length >= 3) {
			// Requête AJAX pour récupérer les amis correspondants
			$.ajax({
				url: 'search_friends',
				method: 'POST',
				data: { query: searchQuery },
				success: function(data) {
					// Afficher les amis filtrés
					$('#friend-list').html(data);
				}
			});
		}
	});

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




// Page de chargement avant le tournoi
function startLoading(participantCount) {
	// Charger la page de chargement personnalisée avec AJAX
    $.ajax({
        url: 'loading.html', // Chemin vers votre fichier HTML de chargement
        method: 'GET',
        success: function(response) {
            $('#home').html(response); // Injecter le contenu de loading.html dans #home
			animateLoadingText();
			initializeControls();
			initializeGame(); // Initialiser le jeu
			initializeNavigation(); 
            // Définir le timeout pour charger soit le jeu, soit le tournoi
            setTimeout(function() {
                if (participantCount === 1) {
                    displayGame(); // Charger le jeu
                } else {
                    displayTournamentBracket(participantCount); // Charger le tableau de tournoi
                }
            }, 20000); // Attendre 5 seconde avant de charger le jeu ou le tournoi (jeu animation js pour le chargement)
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

function resetScrollPosition() {
    // Défilement en haut avec scrollTo, qui fonctionne de manière générale
    window.scrollTo(0, 0);

    // Défilement en haut pour les navigateurs qui utilisent document.documentElement
    document.documentElement.scrollTop = 0;

    // Défilement en haut pour les navigateurs qui utilisent document.body (notamment Safari)
    document.body.scrollTop = 0;
}


//ajax / sap
function addMenuButton() {
    const menuButton = `
        <a id="menu-btn" class="nav-link text-white d-flex justify-content-center align-items-center" href="#profile">
            <img src="png/7.avif" alt="Menu" style="width: 40px; height:40px; "></img>
        </a>
		`;
    document.getElementById("navbar-right").innerHTML = menuButton;

	// Afficher/masquer le menu burger au clic sur le bouton profil
    $("#menu-btn").click(function(event) {
        event.preventDefault();
		adjustBurgerHeight();
		// Vérifier si le menu burger est déjà visible
        if ($("#burger-menu").is(":visible")) {
            $("#burger-menu, #overlay").hide(); // Si visible, on cache le menu et l'overlay
        } else {
            // Si non visible, on le charge et l'affiche
            $("#burger-menu, #overlay").remove(); // Supprimer tout menu existant avant d'en créer un nouveau
        
		$.ajax({
            url: 'profil_menu.html',
            method: 'GET',
            success: function(response) {
                $("body").append(response); // Ajoute le contenu du menu burger à la fin du body
                $("#burger-menu").toggle(); // Affiche le menu burger
                $("#overlay").show(); // Affiche l'overlay

				// Gestion des clics pour cacher le menu lorsqu'on clique sur les boutons
				$("#profile-btn, #logout-btn, #tournament-link, #settings-link, #play-btn").click(function() {
					$("#burger-menu, #overlay").hide();
					
				});

				$("#profile-btn").click(function(event) {
					event.preventDefault();
					$.ajax({
						url: 'profil.html',
						method: 'GET',
						success: function(response) {
							$('#home').html(response); // Remplace le contenu de #home
							if ($('#ground-game').length) {
								groundGameContent = $('#ground-game').detach();
							} // Cache le terrain de jeu
							addMenuButton();
							initializeNavigation(); // Réinitialise les écouteurs d’événements
							resetScrollPosition();
							
						},
						error: function(error) {
							console.log("Erreur lors du chargement de la page :", error);
						}
					});
				});

				$("#settings-link").click(function(event) {
					event.preventDefault();
					$.ajax({
						url: 'gestion_profil.html',
						method: 'GET',
						success: function(response) {
							$('#home').html(response); // Remplace le contenu de #home
							if ($('#ground-game').length) {
								groundGameContent = $('#ground-game').detach();
							} // Cache le terrain de jeu
							addMenuButton();
							initializeNavigation(); // Réinitialise les écouteurs d’événements
							resetScrollPosition();
							
						},
						error: function(error) {
							console.log("Erreur lors du chargement de la page :", error);
						}
					});
				});

				$("#tournament-link").click(function(event) {
					event.preventDefault();
					$.ajax({
						url: 'tournament.html', // La page à charger pour le tournoi
						method: 'GET',
						success: function(response) {
							$('#home').html(response); // Charger le contenu dans #home
							// if ($('#ground-game').length) {
							// 	groundGameContent = $('#ground-game').detach();
							// } // Cache le terrain de jeu
							initializeTournamentOptions(); // Initialiser les options de tournoi
							initializeNavigation(); // Réinitialise les écouteurs d’événements
							resetScrollPosition(); // Réinitialiser le scroll
						},
						error: function(error) {
							console.log("Erreur lors du chargement de la page du tournoi :", error);
						}
					});
				});

				$("#play-btn").click(function(event) {
					event.preventDefault();
					$.ajax({
						url: 'game-menu.html',
						method: 'GET',
						success: function(response) {
							$('#home').html(response); // Remplace le contenu de #home
							if ($('#ground-game').length) {
								groundGameContent = $('#ground-game').detach();
							} // Cache le terrain de jeu
							addMenuButton();
							initializeNavigation();
							resetScrollPosition();
						},
						error: function(error) {
							console.log("Erreur lors du chargement de la page :", error);
						}
					});
				});

				$("#logout-link").click(function(event) {
					event.preventDefault();
					$.ajax({
						url: 'home.html',
						method: 'GET',
						success: function(response) {
							const homeContent = $('<div>').append($.parseHTML(response)).find('#home').html();
							$('#home').html(homeContent); // Remplace le contenu de #home par accueil
							if (!$('#ground-game').length) {
								$('#home').before(groundGameContent);
							}
							$('#navbar-right').html(''); // Supprime le bouton de menu
							
							initializeNavigation(); // Réinitialise les écouteurs d’événements
							resetScrollPosition();

							$("#burger-menu, #overlay").hide();
							
						},
						error: function(error) {
							console.log("Erreur lors du chargement de la page :", error);
						}
					});
				});

            },
            error: function(error) {
                console.log("Erreur lors du chargement du menu burger :", error);
            }
        });// Affiche ou masque le menu burger
		}
    });

    // Cacher le menu burger si on clique ailleurs
    $(document).click(function(event) {
        if (!$(event.target).closest("#menu-btn, #burger-menu").length) {
            $("#burger-menu, #overlay").hide();
        }
    });
}


function initializeNavigation() {
	
// Revenir à l'accueil
$("#home-btn").click(function(event) {
	event.preventDefault();
	$.ajax({
	url: 'home.html',
	method: 'GET',
	success: function(response) {
		const homeContent = $('<div>').append($.parseHTML(response)).find('#home').html();
		$('#home').html(homeContent); // Remplace le contenu de #home par accueil
		if (!$('#ground-game').length) {
            $('#home').before(groundGameContent);
        } // Ajoute le terrain de jeu
		// $('#navbar-right').html(''); // Supprime le bouton de menu
		addMenuButton();
		initializeNavigation(); // Réinitialise les écouteurs d’événements
		resetScrollPosition();
	},
	error: function(error) {
		console.log("Erreur lors du chargement de la page :", error);
	}
	});
});

// Charger la page de login
$("#login-btn").click(function(event) {
    event.preventDefault();
    $.ajax({
      url: 'login.html',
      method: 'GET',
      success: function(response) {
        $('#home').html(response);
		if (!$('#ground-game').length) {
            $('#home').before(groundGameContent);
        } // Ajoute le terrain de jeu
		$('#navbar-right').html(''); // Supprime le bouton de menu
		adjustContainer('guest');
        initializeNavigation(); // Réinitialise les écouteurs d’événements
		resetScrollPosition();
      },
      error: function(error) {
        console.log("Erreur lors du chargement de la page :", error);
      }
    });
});


$("#submit-btn").click(function(event) {
	event.preventDefault();
	$.ajax({
	url: 'login.html',
	method: 'GET',
	success: function(response) {
		$('#home').html(response); // Remplace le contenu de #home
		if (!$('#ground-game').length) {
            $('#home').before(groundGameContent);
        } // Ajoute le terrain de jeu
		$('#navbar-right').html(''); // Supprime le bouton de menu
		adjustContainer('guest');
		initializeNavigation(); // Réinitialise les écouteurs d’événements
		resetScrollPosition();
	},
	error: function(error) {
		console.log("Erreur lors du chargement de la page :", error);
	}
	});
});

$("#register-btn").click(function(event) {
	event.preventDefault(); 
	$.ajax({
	url: 'register.html',
	method: 'GET',
	success: function(response) {
		$('#home').html(response); // Remplace le contenu de #home
		if (!$('#ground-game').length) {
            $('#home').before(groundGameContent);
        } // Ajoute le terrain de jeu
		$('#navbar-right').html(''); // Supprime le bouton de menu
		adjustContainer('register');
		initializeNavigation(); // Réinitialise les écouteurs d’événements
		resetScrollPosition();
	},
	error: function(error) {
		console.log("Erreur lors du chargement de la page :", error);
	}
	});
});

$("#validate-btn").click(function(event) {
	event.preventDefault();
	$.ajax({
	url: 'play.html',
	method: 'GET',
	success: function(response) {
		$('#home').html(response); // Remplace le contenu de #home
		if (!$('#ground-game').length) {
            $('#home').before(groundGameContent);
        } // Ajoute le terrain de jeu
		addMenuButton();
		initializeNavigation(); // Réinitialise les écouteurs d’événements
		resetScrollPosition();
	},
	error: function(error) {
		console.log("Erreur lors du chargement de la page :", error);
	}
	});
});

$("#play-btn").click(function(event) {
	event.preventDefault();
	$.ajax({
	url: 'game-menu.html',
	method: 'GET',
	success: function(response) {
		$('#home').html(response); // Remplace le contenu de #home
		if ($('#ground-game').length) {
			groundGameContent = $('#ground-game').detach();
		} // Cache le terrain de jeu
		addMenuButton();
		initializeNavigation(); // Réinitialise les écouteurs d’événements
		resetScrollPosition();
	},
	error: function(error) {
		console.log("Erreur lors du chargement de la page :", error);
	}
	});
});

$("#gestion-btn").click(function(event) {
	event.preventDefault();
	$.ajax({
	url: 'gestion_profil.html',
	method: 'GET',
	success: function(response) {
		$('#home').html(response);
		if ($('#ground-game').length) {
			groundGameContent = $('#ground-game').detach();
		} // Cache le terrain de jeu
		addMenuButton();
		initializeNavigation(); // Réinitialise les écouteurs d’événements
		resetScrollPosition();	
	},
	error: function(error) {
		console.log("Erreur lors du chargement de la page :", error);
	}
	});
});

$("#invite-game").click(function(event) {
    event.preventDefault();
    $.ajax({
        url: 'invite_game.html',
        method: 'GET',
        success: function(response) {
            $('#home').html(response); // Remplace le contenu de #home par le contenu de invite_game.html
			addMenuButton();
            adjustContainer('invite-container'); // Ajuste le conteneur si nécessaire
			initializeFriendInvitation(1); 
            initializeNavigation(); // Réinitialise les écouteurs d’événements pour le nouveau contenu chargé
            resetScrollPosition(); // Réinitialise la position de défilement
        },
        error: function(error) {
            console.log("Erreur lors du chargement de la page d'invitation :", error);
        }
    });
});

}

// Initialiser la navigation au chargement de la page
$(document).ready(function() {
	initializeNavigation();
});