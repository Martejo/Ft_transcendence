import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js'; 


function attachGameMenuEvents() {
    console.log('Attachement des événements pour le menu du jeu.');

    // Bouton "Partie Locale"
    const localGameBtn = document.getElementById('local-game-btn');
    if (localGameBtn) {
        localGameBtn.addEventListener('click', () => {
            document.getElementById('game-modes').classList.remove('d-none');
            document.getElementById('customization-menu').classList.add('d-none');
        });
    }

    // Bouton "Jeu Standard"
    const standardGameBtn = document.getElementById('standard-game-btn');
    if (standardGameBtn) {
        standardGameBtn.addEventListener('click', () => {
            alert("Lancement de la partie standard...");
            // Ajouter la logique AJAX pour lancer une partie standard
        });
    }

    // Bouton "Jeu Personnalisé"
    const customGameBtn = document.getElementById('custom-game-btn');
    if (customGameBtn) {
        customGameBtn.addEventListener('click', () => {
            document.getElementById('customization-menu').classList.remove('d-none');
        });
    }

    // Input pour la vitesse de la balle
    const ballSpeedInput = document.getElementById('ballSpeed');
    if (ballSpeedInput) {
        ballSpeedInput.addEventListener('input', () => {
            document.getElementById('ballSpeedValue').innerText = ballSpeedInput.value;
        });
    }

    // Select pour la taille de la raquette
    const paddleSizeSelect = document.getElementById('paddleSizeSelect');
    if (paddleSizeSelect) {
        paddleSizeSelect.addEventListener('change', () => {
            console.log("Taille de la raquette choisie :", paddleSizeSelect.value);
        });
    }

    // Bouton pour lancer la partie personnalisée
    const startCustomGameBtn = document.querySelector('#customization-menu .btn-primary');
    if (startCustomGameBtn) {
        startCustomGameBtn.addEventListener('click', () => {
            alert("Lancement de la partie personnalisée avec les options choisies...");
            // Ajouter la logique AJAX pour lancer une partie personnalisée
        });
    }
}


export async function handleGameMenu() {
    console.log('Chargement du menu du jeu...');
    try {
        const response = await requestGet('game', 'menu');
        updateHtmlContent('#content', response.html);
        attachGameMenuEvents();
    } catch (error) {
        console.error('Erreur dans hangleGameMenu:', error);
        //displayErrorMessage('#content', 'Erreur lors du chargement du menu du jeu.');
    }
}


