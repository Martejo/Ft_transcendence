import { clearSessionAndUI, displayErrorMessage, displaySuccessMessage } from '../tools/index.js';
import { requestPost } from '../api/index.js';

async function logoutUser() {
    try {
        const formData = new FormData();
        
        // Vérification du refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('Aucun refresh token trouvé.');
        }
        formData.append('refresh_token', refreshToken);

        // Requête pour déconnexion
        const response = await requestPost('accounts', 'logout', formData);

        if (response.status !== 'success') {
            throw new Error('La déconnexion a échoué côté serveur.');
        }
    } catch (error) {
        console.error('Erreur lors de logoutUser :', error);
        throw error; // Relancer l'erreur pour que handleLogout puisse la gérer
    }
}



export async function handleLogout() {
    console.log('Déconnexion en cours...');
    try {
        await logoutUser(); // Appel de la logique technique
        displaySuccessMessage('delete-success', 'Votre compte a été supprimé avec succès.');
        setTimeout(() => {
            clearSessionAndUI(); // Attache les événements nécessaires à la modale
        }, 5000);
        clearSessionAndUI(); // Nettoie la session et l'interface utilisateur
        console.log('Déconnexion réussie.');
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);

        //[IMPROVE] Quel id utiliser pour l'erreur ou le success?
        // Afficher un message d'erreur personnalisé à l'utilisateur
        displayErrorMessage('logout-error', 'La déconnexion a échoué. Veuillez réessayer.');
    }
}
