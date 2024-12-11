import { Api } from './Api.js'; // Exemple : Un module qui gère les appels AJAX

export async function handleFriendRequest(requestId, action) {
    const formData = new FormData();
    formData.append('request_id', requestId);
    formData.append('action', action);

    try {
        const response = await Api.post('/accounts/handle_friend_request/', formData);
        
        if (response.status === 'success') {
            return { success: true, message: `Invitation ${action}ée avec succès.` };
        } else {
            return { success: false, message: response.error || 'Une erreur est survenue.' };
        }
    } catch (error) {
        return { success: false, message: error.message || 'Erreur traitement invitation.' };
    }
}
