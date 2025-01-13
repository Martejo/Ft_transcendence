import { requestGet, requestPost } from '../api/index.js'; 
import { updateHtmlContent } from '../tools/index.js'; 
import { handleInviteGame } from './invitation.js'; // Suppose qu'on gère l'invitation en ligne ici

function attachGameMenuEvents() {
    console.log('Attachement des événements pour le menu du jeu.');

    // =============================
    // 1) Bouton "Partie Locale"
    // =============================
    const localGameBtn = document.getElementById('local-game-btn');
    if (localGameBtn) {
        localGameBtn.addEventListener('click', () => {
            // On affiche les modes de jeu (standard / personnalisé)
            document.getElementById('game-modes').classList.remove('d-none');
            // On masque la personnalisation (au cas où)
            document.getElementById('customization-menu').classList.add('d-none');

            // On peut stocker quelque part le fait qu'on est en mode "local" (via une variable globale, data-attribute, etc.)
            // Par simplicité, on ne le fait pas ici, on gérera dans les boutons standard / custom
        });
    }

    // =============================
    // 2) Bouton "Inviter un Ami" (donc partie ONLINE)
    // =============================
    const inviteGameButton = document.querySelector('#invite-game-btn');
    if (inviteGameButton && !inviteGameButton.dataset.bound) {
        inviteGameButton.addEventListener('click', async (e) => {
            e.preventDefault();

            // handleInviteGame peut, par exemple, gérer l’ID de l’ami, etc.
            // ou simplement afficher un formulaire pour choisir l’ami 
            // puis lancer un POST pour game_type="online"
            await handleInviteGame(); 
        });
        inviteGameButton.dataset.bound = true;
    }

    // =============================
    // 3) Bouton "Jeu Standard"
    // =============================
    const standardGameBtn = document.getElementById('standard-game-btn');
    if (standardGameBtn) {
        standardGameBtn.addEventListener('click', async () => {
            try {
                // Conversion des données en FormData
                const formData = new FormData();
                formData.append('game_type', 'local');
                formData.append('ball_speed', 2); 
                formData.append('racket_size', 2);
                formData.append('bonus_malus_activation', true);
                formData.append('bumpers_activation', false);

                // Envoi de la requête avec FormData
                const response = await requestPost('game', 'menu', formData);

                // Gérer la réponse
                alert(`Partie standard créée : ID = ${response.game_id}\n${response.message}`);
            } catch (err) {
                console.error('Erreur lors de la création de la partie standard :', err);
                alert('Impossible de créer la partie standard.');
            }
        });
    }

    // =============================
    // 4) Bouton "Jeu Personnalisé"
    // =============================
    const customGameBtn = document.getElementById('custom-game-btn');
    if (customGameBtn) {
        customGameBtn.addEventListener('click', () => {
            // On dévoile le menu de customisation
            document.getElementById('customization-menu').classList.remove('d-none');
        });
    }

    // =============================
    // 5) Input "vitesse de la balle"
    // =============================
    const ballSpeed = document.getElementById('ballSpeed');
    if (ballSpeed) {
        ballSpeed.addEventListener('input', () => {
            document.getElementById('ballSpeedValue').innerText = ballSpeed.value;
            console.log("Vitesse de balle choisie :", ballSpeed.value);
        });
    }

    // =============================
    // 6) Bouton "Lancer la partie personnalisée"
    // =============================
    const startCustomGameBtn = document.querySelector('#start-custom-game-btn');
    if (startCustomGameBtn) {
        startCustomGameBtn.addEventListener('click', async () => {
            try {
                // Création de l'objet FormData
                const formData = new FormData();
                formData.append('game_type', 'local'); // pour le moment les parties personnalisées ne sont faisables qu'en local
                formData.append('ball_speed', document.getElementById('ballSpeed').value); // 1, 2 ou 3
                formData.append('racket_size', document.getElementById('racketSize').value);
                formData.append('bonus_malus_activation', document.getElementById('bonusCkeckbox').checked);
                formData.append('bumpers_activation', document.getElementById('bumpersCheckbox').checked);

                // Envoi de la requête avec FormData
                const response = await requestPost('game', 'menu', formData);

                // Gérer la réponse
                alert(`Partie personnalisée créée : ID = ${response.game_id}\n${response.message}`);
            } catch (err) {
                console.error('Erreur lors de la création de la partie personnalisée :', err);
                alert('Impossible de créer la partie personnalisée.');
            }
        });
    }
}

export async function handleGameMenu() {
    console.log('Chargement du menu du jeu...');
    try {
        // 1) On va chercher le HTML du menu
        const response = await requestGet('game', 'menu');
        // 2) On injecte ce HTML dans la div #content
        updateHtmlContent('#content', response.html);
        // 3) On attache les événements
        attachGameMenuEvents();
    } catch (error) {
        console.error('Erreur dans handleGameMenu:', error);
        // displayErrorMessage('#content', 'Erreur lors du chargement du menu du jeu.');
    }
}
