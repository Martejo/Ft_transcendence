// animations.js

// Fonction pour animer la couleur des boutons
function animateTextColor() {
    let loginButton = document.getElementById('login-btn');
    let registerButton = document.getElementById('register-btn');
    let guestButton = document.getElementById('guest-btn');
    let apiButton = document.getElementById('api-btn');
    
    let isOriginalColor = true;

    setInterval(function() {
        let color = isOriginalColor ? "#8EC7E1" : "white";
        [loginButton, registerButton, guestButton, apiButton].forEach(btn => {
            if (btn) btn.style.color = color;
        });
        isOriginalColor = !isOriginalColor;
    }, 1000); 
}

// Fonction pour animer les mouvements de la balle et des raquettes
function animatePongGame() {
    let balle = document.querySelector('.balle');
    let traitGauche = document.querySelector('.trait-gauche');
    let traitDroit = document.querySelector('.trait-droit');

    let frames = [
        { balleX: 1, balleY: 47, raquetteGaucheY: 36.5, raquetteDroiteY: 36.5 },
        { balleX: 48, balleY: 0, raquetteGaucheY: 0, raquetteDroiteY: 73 },
        // Autres frames...
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
                balle.style.left = frameActuelle.balleX + (prochaineFrame.balleX - frameActuelle.balleX) * progress + '%';
                balle.style.top = frameActuelle.balleY + (prochaineFrame.balleY - frameActuelle.balleY) * progress + '%';
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

    deplacerBalleEtRaquettes();
}

// Initialisation des animations
window.onload = function() {
    animateTextColor();
    animatePongGame();
};