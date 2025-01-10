export function handleOptionPopup(option) {
    const friendName = document.getElementById('popupFriendName').innerText.trim();
    if (option === 'Voir le profil') {
        viewFriendProfile(friendName);
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
