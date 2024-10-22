
function animateTextColor() {
	let loginButton = document.getElementById('login');
	let registerButton = document.getElementById('register');
	let guestButton = document.getElementById('guest');
	let apiButton = document.getElementById('api');
	
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
  
  window.onload = animateTextColor;

  let balle = document.querySelector('.balle');
let traitGauche = document.querySelector('.trait-gauche');
let traitDroit = document.querySelector('.trait-droit');

// Frames basées sur Figma
let frames = [
  { balleX: 10, balleY: 215, raquetteGaucheY: 169, raquetteDroiteY: 169 },  // Frame 1
  { balleX: 441, balleY: 0, raquetteGaucheY: 0, raquetteDroiteY: 340 },     // Frame 2
  { balleX: 882, balleY: 215, raquetteGaucheY: 215, raquetteDroiteY: 125 }, // Frame 3
  { balleX: 371, balleY: 440, raquetteGaucheY: 31, raquetteDroiteY: 317 },  // Frame 4
  { balleX: 10, balleY: 275, raquetteGaucheY: 275, raquetteDroiteY: 46 },   // Frame 5
  { balleX: 533, balleY: 0, raquetteGaucheY: 30, raquetteDroiteY: 301 },    // Frame 6
  { balleX: 882, balleY: 178, raquetteGaucheY: 303, raquetteDroiteY: 148 }, // Frame 7
  { balleX: 441, balleY: 440, raquetteGaucheY: 34, raquetteDroiteY: 340 }   // Frame 8
];

let currentFrame = 0; // Frame initiale
let maxFrames = frames.length;
let transitionTime = 2200; // 1 seconde pour atteindre la prochaine frame

// Fonction pour déplacer la balle et les raquettes avec un mouvement fluide
function deplacerBalleEtRaquettes() {
  let frameActuelle = frames[currentFrame];
  let prochaineFrame = frames[(currentFrame + 1) % maxFrames];

  let startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    let progress = (time - startTime) / transitionTime;

    if (progress < 1) {
      // Interpolation linéaire pour les coordonnées X et Y de la balle
      balle.style.left = frameActuelle.balleX + (prochaineFrame.balleX - frameActuelle.balleX) * progress + 'px';
      balle.style.top = frameActuelle.balleY + (prochaineFrame.balleY - frameActuelle.balleY) * progress + 'px';

      // Interpolation linéaire pour les positions des raquettes
      traitGauche.style.top = frameActuelle.raquetteGaucheY + (prochaineFrame.raquetteGaucheY - frameActuelle.raquetteGaucheY) * progress + 'px';
      traitDroit.style.top = frameActuelle.raquetteDroiteY + (prochaineFrame.raquetteDroiteY - frameActuelle.raquetteDroiteY) * progress + 'px';

      requestAnimationFrame(animate);
    } else {
      // Une fois la frame atteinte, passer à la suivante
      currentFrame = (currentFrame + 1) % maxFrames;

      // Relancer l'animation pour la prochaine frame après avoir atteint la destination
      setTimeout(() => requestAnimationFrame(deplacerBalleEtRaquettes), 0);
    }
  }

  // Lancer l'animation
  requestAnimationFrame(animate);
}

// Initialiser les positions au début
balle.style.left = frames[0].balleX + 'px';
balle.style.top = frames[0].balleY + 'px';
traitGauche.style.top = frames[0].raquetteGaucheY + 'px';
traitDroit.style.top = frames[0].raquetteDroiteY + 'px';

// Démarrer l'animation fluide
deplacerBalleEtRaquettes();
