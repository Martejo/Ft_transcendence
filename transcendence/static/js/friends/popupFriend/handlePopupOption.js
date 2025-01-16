import {  handleRemoveFriend } from '../index.js';
import { navigateTo } from '../../router.js';

export function handleOptionPopup(option) {
    const friendName = document.getElementById('popupFriendName').innerText.trim();
    if (option === 'Voir le profil') {
        navigateTo(`/profile/${encodeURIComponent(friendName)}`); // Navigue vers la route dynamique
    } 
    else if (option === 'Inviter à jouer') {

        console.log(`Option sélectionnée : ${option}`);
    }
    else if (option === 'Supprimer') {
        handleRemoveFriend(friendName);
    }
    else {
        console.error(`Option inconnue : ${option}`);
    }
}
