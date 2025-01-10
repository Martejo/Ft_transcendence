import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';


async function FriendProfile(friendName) {
    try {
        console.log(`Chargement du profil de l'ami : ${friendName}`);
        const response = await requestGet('accounts', `friend/${friendName}`);
        
        if (response.status !== 'success') {
            throw new Error(response.message || 'Erreur lors de la récupération du profil.');
        }
        updateHtmlContent('#content', response.html);
        return response.message; // Retourne la réponse en cas de succès
    } catch (error) {
        console.error('Erreur dans viewFriendProfile :', error);
        throw error; // Relance l'erreur pour la gestion dans le gestionnaire
    }
}

export async function handleFriendProfile(friendName) {
    console.log(`Gestionnaire: Affichage du profil de l'ami ${friendName}`);
    try {
        // Appelle la fonction principale pour charger le profil
        const response = await FriendProfile(friendName);

        // Affiche un message de succès
        displaySuccessMessage('friend-profile-success', 'Profil de l\'ami chargé avec succès.');
        clearErrorMessage('friend-profile-error'); // Nettoie les anciens messages d'erreur
    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur dans handleViewFriendProfile :', error);
        displayErrorMessage('friend-profile-error', error.message || 'Une erreur est survenue lors du chargement du profil de l\'ami.');
    }
}