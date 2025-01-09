import { requestPost } from '../api/index.js';

export async function logoutUser() {
    try {
        const formData = new FormData();
        
        // Ajouter le refresh token au formulaire
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            console.error('Aucun refresh token trouvé');
            return;
        }
        formData.append('refresh_token', refreshToken);

        // Envoyer la requête de déconnexion
        const response = await requestPost('accounts', 'logout', formData);
        
        if (response.status === 'success') {
            console.log('Déconnexion réussie');
            
            // Supprimer les tokens du localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            // Nettoyer l'interface utilisateur
            document.querySelector('#navbar').innerHTML = '';
            const burgerMenu = document.querySelector('#burger-menu');
            if (burgerMenu) burgerMenu.innerHTML = '';
            document.querySelector('#content').innerHTML = '';
            window.location.href = 'core-home';
        } else {
            console.error('Erreur: Réponse inattendue lors de la déconnexion.');
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
}
