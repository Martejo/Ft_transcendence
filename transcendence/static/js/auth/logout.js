// auth/logout.js
import Api from '../api/api.js';

async function performLogout() {
    try {
        const response = await Api.post('/accounts/logout/', null);
        if (response.status === 'success') {
            console.log('Déconnexion réussie');
            document.querySelector('#navbar').innerHTML = '';
            const burgerMenu = document.querySelector('#burger-menu');
            if (burgerMenu) burgerMenu.innerHTML = '';
            document.querySelector('#content').innerHTML = '';
            window.location.href = '/';
        } else {
            console.error('Erreur: Réponse inattendue lors de la déconnexion.');
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
}

export function logoutUser() {
    performLogout();
}
