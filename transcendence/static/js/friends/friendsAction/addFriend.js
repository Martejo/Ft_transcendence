import { requestPost } from '../../api/index.js';

async function addFriend(friendUsername) {
    console.log('addFriend:', friendUsername);

    const formData = new FormData();
    formData.append('friend_username', friendUsername);

    try {
        const response = await requestPost('accounts', 'friends/add', formData);

        if (response.status !== 'success') {
            throw new Error(response.message || 'Erreur lors de l\'ajout de l\'ami.');
        }

        console.log('Demande d\'ami envoyée avec succès.');
        return response; // Retourne la réponse en cas de succès
    } catch (error) {
        console.error('Erreur dans addFriend:', error);
        throw error; // Relance l'erreur pour la gérer dans handleAddFriend
    }
}

export async function handleAddFriend(e) {
    e.preventDefault();
    const friendUsername = document.querySelector('#friend-username').value.trim();
    if (friendUsername) {
        console.log('Gestionnaire: handleAddFriend - Ajout d\'un ami:', friendUsername);
        try {
            // Appelle la fonction principale pour ajouter un ami
            //const response = await addFriend(friendUsername);
            await addFriend(friendUsername);
            
            // Affiche un message de succès si l'ajout a réussi
            //displaySuccessMessage('add-friend-success', response.message || 'Demande d\'ami envoyée avec succès.');
            //clearErrorMessage('add-friend-error'); // Nettoie tout message d'erreur précédent
        } catch (error) {
            // Gestion des erreurs
            console.error('Erreur dans handleAddFriend:', error);
            //displayErrorMessage('add-friend-error', error.message || 'Une erreur est survenue lors de l\'ajout de l\'ami.');
        }
    }
}
    
    