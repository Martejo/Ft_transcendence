import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';

export async function handleViewProfile() {
    console.log('Chargement du profil utilisateur...');
    try {
        const response = await requestGet('accounts', 'userProfile');
        if (response.status === 'success' && response.html) {
            console.log('Profil utilisateur chargé avec succès.');
            updateHtmlContent('#content', response.html);
            initializeProfileEvents(); // Appel de l'initialisation des événements
        } else {
            console.error('Erreur lors du chargement du profil utilisateur:', response.message);
        }
    } catch (error) {
        console.error('Erreur réseau lors du chargement du profil utilisateur:', error);
    }
}

// Fonction pour gérer les événements spécifiques au profil
function initializeProfileEvents() {
    const gestionBtn = document.querySelector('#gestion-btn');
    if (gestionBtn) {
        gestionBtn.addEventListener('click', () => {
            console.log('Clic sur Gestion de Profil');
            window.location.hash = '#accounts-profile'; // Change le hash de l'URL
        });
    }
    console.log('Événements de profil initialisés.');
}
