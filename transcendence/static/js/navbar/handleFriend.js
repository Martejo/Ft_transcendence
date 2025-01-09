// ./handleFriend.js
import { requestPost } from '../api/index.js';
import { loadNavbar } from './loadNavbar.js';

export async function handleFriendRequest(requestId, action) {
    const formData = new FormData();
    formData.append('request_id', requestId);
    formData.append('action', action);

    try {
        const response = await requestPost('accounts', 'friends/handle-request', formData);

        if (response.status === 'success') {
            console.log(`Invitation ${action}ée avec succès.`);
            loadNavbar();
            return { success: true, message: `Invitation ${action}ée avec succès.` };
        } else {
            console.error('Erreur lors de la gestion de l\'invitation:', response.error);
            return { success: false, message: response.error || 'Une erreur est survenue.' };
        }
    } catch (error) {
        console.error('Erreur de réseau ou de traitement:', error);
        return { success: false, message: error.message || 'Erreur lors du traitement de l\'invitation.' };
    }
}