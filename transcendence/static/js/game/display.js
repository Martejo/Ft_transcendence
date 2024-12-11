// game/display.js
import Api from '../api/api.js';
import { resetScrollPosition } from '../api/utility.js';

export async function displayGame() {
    try {
        const response = await Api.get('game.html');
        document.querySelector('#home').innerHTML = response.html || response;
        resetScrollPosition();
    } catch (error) {
        console.log('Erreur chargement jeu:', error);
    }
}

export async function displayTournamentBracket(participantCount) {
    const url = participantCount === 4 ? 'bracket_4.html' : 'bracket_8.html';
    try {
        const response = await Api.get(url);
        document.querySelector('#home').innerHTML = response.html || response;
        resetScrollPosition();
    } catch (error) {
        console.log('Erreur chargement bracket:', error);
    }
}
