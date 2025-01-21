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
			// On masque les autres div de personnalisation (au cas où elles seraient apparantes)
            document.getElementById('customization-online-game').classList.add('d-none');
			document.getElementById('customization-tournament').classList.add('d-none');
            // On affiche la personnalisation du jeu en local
            document.getElementById('customization-local-game').classList.remove('d-none');
			
		}); 
    }

	const localtutorialBtn = document.getElementById('tutorial-btn-local');
	if (localtutorialBtn) {
		localtutorialBtn.addEventListener('click', () => {
			const localtutorialContent = document.getElementById('tutorial-content-local');
		if (localtutorialContent.classList.contains('collapse')) {
			localtutorialContent.classList.remove('collapse');
		} else {
			localtutorialContent.classList.add('collapse');
		}
		});
	}
	

	const ballSpeedLocal = document.getElementById('ballSpeedLocal');
    if (ballSpeedLocal) {
        ballSpeedLocal.addEventListener('input', () => {
            document.getElementById('ballSpeedValueLocal').innerText = ballSpeedLocal.value;
            console.log("Vitesse de balle choisie (Local):", ballSpeedLocal.value);
        });
    }

	// =============================
    // 2) Bouton "Partie En Ligne"
    // =============================
    const onlineGameBtn = document.getElementById('online-game-btn');
    if (onlineGameBtn) {
        onlineGameBtn.addEventListener('click', () => {
			// On masque les autres div de personnalisation (au cas où elles seraient apparantes)
			document.getElementById('customization-local-game').classList.add('d-none');
			document.getElementById('customization-tournament').classList.add('d-none');
            // On affiche la personnalisation du jeu en ligne
            document.getElementById('customization-online-game').classList.remove('d-none');

        });
    }

	const onlinetutorialBtn = document.getElementById('tutorial-btn-online');
	if (onlinetutorialBtn) {
		onlinetutorialBtn.addEventListener('click', () => {
			const onlinetutorialContent = document.getElementById('tutorial-content-online');
		if (onlinetutorialContent.classList.contains('collapse')) {
			onlinetutorialContent.classList.remove('collapse');
		} else {
			onlinetutorialContent.classList.add('collapse');
		}
		});
	}

	const ballSpeedOnline = document.getElementById('ballSpeedOnline');
    if (ballSpeedOnline) {
        ballSpeedOnline.addEventListener('input', () => {
            document.getElementById('ballSpeedValueOnline').innerText = ballSpeedOnline.value;
            console.log("Vitesse de balle choisie (Online):", ballSpeedOnline.value);
        });
    }

	// =============================
    // 3) Bouton "Tournoi"
    // =============================
    const tournamentBtn = document.getElementById('tournament-btn');
    if (tournamentBtn) {
        tournamentBtn.addEventListener('click', () => {
            // On masque les autres div de personnalisation (au cas où elles seraient apparantes)
			document.getElementById('customization-local-game').classList.add('d-none');
            document.getElementById('customization-online-game').classList.add('d-none');
            // On affiche la personnalisation du jeu en ligne
			document.getElementById('customization-tournament').classList.remove('d-none');

        });
    }

	const tournamenttutorialBtn = document.getElementById('tutorial-btn-tournament');
	if (tournamenttutorialBtn) {
		tournamenttutorialBtn.addEventListener('click', () => {
			const tournamenttutorialContent = document.getElementById('tutorial-content-tournament');
		if (tournamenttutorialContent.classList.contains('collapse')) {
			tournamenttutorialContent.classList.remove('collapse');
		} else {
			tournamenttutorialContent.classList.add('collapse');
		}
		});
	}

	const ballSpeedTournament = document.getElementById('ballSpeedTournament');
    if (ballSpeedTournament) {
        ballSpeedTournament.addEventListener('input', () => {
            document.getElementById('ballSpeedValueTournament').innerText = ballSpeedTournament.value;
            console.log("Vitesse de balle choisie (Tournament):", ballSpeedLocal.value);
        });
    }

    // =============================
    // 4) Bouton "Inviter un Ami" (donc partie ONLINE apres avoir custom)
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

    // Fonction pour lancer partie standard a oimplemetner 
    // function initializeRemoteMenu(participantCount) {
    //     // Utiliser un gestionnaire d'événements délégué
    //     $(document).on('click', '#start-tournament-btn, #start-game-btn', function() {
    
    //         // Vérifier que participantCount existe avant d'appeler startLoading
    //         if (typeof participantCount !== 'undefined') {
    //             startLoading(participantCount); // Charger la page d'attente
    //         } else {
    //             console.error('participantCount est non défini');
    //         }
    //     });
    // }
    

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
