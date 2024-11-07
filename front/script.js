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
				$("#profile-btn, #logout-btn").click(function() {
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
		$('#navbar-right').html(''); // Supprime le bouton de menu
		initializeNavigation(); // Réinitialise les écouteurs d’événements
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
        initializeNavigation(); // Réinitialise les écouteurs d’événements
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
		initializeNavigation(); // Réinitialise les écouteurs d’événements
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
		initializeNavigation(); // Réinitialise les écouteurs d’événements
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
	},
	error: function(error) {
		console.log("Erreur lors du chargement de la page :", error);
	}
	});
});

}

// Initialiser la navigation au chargement de la page
$(document).ready(function() {
initializeNavigation();
});