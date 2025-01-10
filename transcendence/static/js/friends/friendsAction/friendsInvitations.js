

async function friendInvitation(requestId, action) {
    console.log(`handleFriendRequestAction: Demande d'ami ID ${requestId}, action : ${action}`);
    
    const formData = new FormData();
    formData.append('request_id', requestId);
    formData.append('action', action);

    try {
        const response = await requestPost('accounts', 'friends/handle-request', formData);
        if (response.status !== 'success') {
            throw new Error(response.message || 'Erreur lors du traitement de la demande d\'ami.');
        }
        return response; // Retourne la réponse en cas de succès
    } catch (error) {
        console.error('Erreur dans handleFriendRequestAction:', error);
        throw error; // Relance l'erreur pour la gérer dans le gestionnaire
    }
}

export async function handleFriendInvitation(requestId, action) {
    console.log(`Gestionnaire: handleFriendRequest - ID : ${requestId}, action : ${action}`);
    try {
        // Appelle la fonction principale pour traiter la demande
        const response = await friendInvitation(requestId, action);
        
        // Affiche un message de succès
        displaySuccessMessage('friend-request-success', response.message || 'Action effectuée avec succès.');
        clearErrorMessage('friend-request-error'); // Nettoie les anciens messages d'erreur
    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur dans handleFriendRequest:', error);
        displayErrorMessage('friend-request-error', error.message || 'Une erreur est survenue lors du traitement de la demande.');
    }
}