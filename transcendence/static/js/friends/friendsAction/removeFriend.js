import { requestPost } from '../../api/index.js';

async function removeFriend(friendName) {
    console.log(`removeFriend: Suppression de l'ami ${friendName}`);
    
    const formData = new FormData();
    formData.append('friend_username', friendName);
    
    try {
        const response = await requestPost('accounts', 'friends/remove', formData);
        if (response.status !== 'success') {
            throw new Error(response.message || 'Erreur lors de la suppression de l\'ami.');
        }
        return response; // Retourne la réponse en cas de succès
    } catch (error) {
        console.error('Erreur dans removeFriend:', error);
        throw error; // Relance l'erreur pour la gérer dans le gestionnaire
    }
}


export async function handleRemoveFriend(friendName) {
    console.log(`Gestionnaire: handleRemoveFriend - Suppression de l'ami : ${friendName}`);
    try {
        // Appelle la fonction principale pour supprimer l'ami
        const response = await removeFriend(friendName);
        
        // Mise à jour de l'interface utilisateur
        document.querySelector(`.friend-btn:contains('${friendName}')`)?.closest('.friend-item')?.remove();
        document.getElementById('friendPopup').classList.add('d-none');
        
        // Affiche un message de succès
        displaySuccessMessage('friend-popup-success', response.message || 'Ami supprimé avec succès.');
        clearErrorMessage('friend-popup-error'); // Nettoie les anciens messages d'erreur
    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur dans handleRemoveFriend:', error);
        displayErrorMessage('friend-popup-error', error.message || 'Une erreur est survenue lors de la suppression de l\'ami.');
    }
}