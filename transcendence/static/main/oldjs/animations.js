// animations.js

// Animation du texte des boutons de la page d'accueil
function animateTextColor() {
	let loginButton = document.getElementById('login-btn');
	let registerButton = document.getElementById('register-btn');
	let isOriginalColor = true;
  
	setInterval(function() {
	  if (isOriginalColor) {
		
		setTimeout(function() {
		  if (registerButton) registerButton.style.color = "#8EC7E1";
		  if (loginButton) loginButton.style.color = "#8EC7E1"; 
		}, 10); 

	  } else {
		setTimeout(function() {
		  if (registerButton) registerButton.style.color = "white"; 
		  if (loginButton) loginButton.style.color = "white"; 
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


//Fonction responsive
function adjustContainer(ContainerId) {
  console.log("Rentre dans adjust container");
	const container = document.getElementById(ContainerId);
	if (!container) {
    console.log("adjustContainer: container error");
    return;
  } 
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

// Fonction pour arrêter l'animation de la balle et des raquettes
let animationRunning = true;  // Flag pour suivre l'état de l'animation

function stopPongAnimation() {
    animationRunning = false;  // Indiquer que l'animation ne doit plus tourner
}

function deplacerBalleEtRaquettes() {

  if (!animationRunning) return;  // Arrêter l'animation si le flag est à false
  let frameActuelle = frames[currentFrame];
  let prochaineFrame = frames[(currentFrame + 1) % maxFrames];
  let startTime = null;

  function animate(time) {

    if (!animationRunning) return;  // Stopper immédiatement si l'animation est arrêtée

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

// lancement des fonctions au chargement de la page
window.onload = function() {
    animateTextColor();
    //animatePongGame();
    adjustBurgerHeight();
	adjustSinNavHeight();

    // Écouteur d'événement pour ajuster les hauteurs lors du redimensionnement de la page
    window.addEventListener('resize', () => {
        adjustBurgerHeight();
		adjustSinNavHeight();
    adjustContainer('invite-container'); // Remplacez 'invite-container' par l'ID voulu
    adjustContainer('login');
    adjustContainer('register');
    });

    // Appeler la fonction au chargement et lors du redimensionnement de la fenêtre
    window.addEventListener('load',function() {
      adjustContainer('invite-container'); // Remplacez 'invite-container' par l'ID voulu
    adjustContainer('login');
    adjustContainer('register');
    });


};


