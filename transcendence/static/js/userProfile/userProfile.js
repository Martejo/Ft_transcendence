import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';

// Fonction pour gérer l'affichage du profil utilisateur
export async function handleViewProfile() {
    console.log('Chargement du profil utilisateur...');
    
    try {
        await viewUserProfile(); // Appel de la fonction principale pour charger le profil
    } catch (error) {
        console.error('Erreur lors du chargement du profil utilisateur dans viewUserProfile:', error);
        displayErrorMessage('content-error', 'Erreur lors du chargement du profil utilisateur.'); // Affiche un message d'erreur
        return; // Arrête l'exécution si le chargement échoue
    }

    try {
        await initializeProfileEvents(); // Initialisation des événements spécifiques au profil
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des événements dans initializeProfileEvents:', error);
        displayErrorMessage('content-error', 'Erreur lors de l\'initialisation des événements du profil.');
    }
}

// Fonction principale qui récupère et affiche le profil utilisateur
export async function viewUserProfile() {
    try {
        const response = await requestGet('accounts', 'userProfile');
        
        if (response.status === 'success' && response.html) {
            console.log('Profil utilisateur chargé avec succès.');
            updateHtmlContent('#content', response.html);
        } else {
            console.error('Erreur lors du chargement du profil utilisateur:', response.message || 'Réponse inattendue.');
            throw new Error(response.message || 'Erreur lors du chargement du profil utilisateur.');
        }
    } catch (error) {
        console.error('Erreur réseau ou réponse lors du chargement du profil utilisateur:', error);
        throw error; // Propagation de l'erreur pour gestion dans handleViewProfile
    }
}
// Fonction pour gérer les événements spécifiques au profil
async function initializeProfileEvents() {
    try {
        const gestionBtn = document.querySelector('#gestion-btn');
        if (!gestionBtn) {
            throw new Error('Bouton de gestion de profil introuvable.');
        }

        gestionBtn.addEventListener('click', () => {
            console.log('Clic sur Gestion de Profil');
            window.location.hash = '#accounts-profile'; // Change le hash de l'URL
        });

        console.log('Événements de profil initialisés.');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des événements de profil:', error);
        throw error; // Relance l'erreur pour qu'elle soit gérée par handleViewProfile
    }
}
