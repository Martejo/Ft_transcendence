// game/loading.js
import Api from '../api/api.js';
import Animations from '../modules/animations.js';
import { isTouchDevice } from '../api/utility.js';
import { initializeGameControls } from './controls.js';
import { displayGame, displayTournamentBracket } from './display.js';

export async function startLoading(participantCount) {
    try {
        const response = await Api.get('/game/loading/');
        document.querySelector('#content').innerHTML = response.html || response;
        Animations.animateLoadingText();
        if (isTouchDevice()) {
            initializeGameControls('touch');
        } else {
            initializeGameControls('keyboard');
        }

        setTimeout(() => {
            if (participantCount === 1) {
                displayGame();
            } else {
                displayTournamentBracket(participantCount);
            }
        }, 20000);
    } catch (error) {
        console.log('Erreur chargement page loading:', error);
    }
}
