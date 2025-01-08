// profile/viewProfile.js

import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';
import { initializeProfileFormHandlers } from './formHandlers.js';

// function updateTextContent(selector, text) {
//     const element = document.querySelector(selector);
//     if (element) {
//         element.textContent = text;
//     } else {
//         console.warn(`Élément non trouvé pour le sélecteur : ${selector}`);
//     }
// }

// function updateAttribute(selector, attribute, value) {
//     const element = document.querySelector(selector);
//     if (element) {
//         element.setAttribute(attribute, value);
//     } else {
//         console.warn(`Élément non trouvé pour le sélecteur : ${selector}`);
//     }
// }

// function updateProfileInfo(data) {
//     if (!data) return;
//     updateTextContent('.profile-info h3', `Pseudo : ${data.username || 'Inconnu'}`);
//     updateAttribute('.profile-info img', 'src', data.avatar_url || '/static/images/default-avatar.png');
//     updateAttribute('.profile-info img', 'alt', `Avatar de ${data.username || 'Inconnu'}`);
//     updateTextContent('.profile-info p strong', data.match_count || 'N/A');
// }

// function updateStatistics(data) {
//     if (!data) return;
//     updateTextContent('.statistics .list-group-item:nth-child(1)', `Victoires : ${data.victories || 0}`);
//     updateTextContent('.statistics .list-group-item:nth-child(2)', `Défaites : ${data.defeats || 0}`);
//     updateTextContent('.statistics .list-group-item:nth-child(3)', `Meilleur score : ${data.best_score || 0} pts`);
// }

// function updateFriendsSection(data) {
//     if (!data) return;
//     updateTextContent('.friends-section p strong', data.friends_count || 0);
// }

// function setupGestionButton() {
//     const gestionBtn = document.querySelector('#gestion-btn');
//     if (gestionBtn) {
//         gestionBtn.addEventListener('click', () => {
//             window.location.hash = '#accounts-gestion_profil';
//         });
//     } else {
//         console.warn("Bouton de gestion introuvable (#gestion-btn).");
//     }
// }

export async function initializeProfileView() {
    try {
        const response = await requestGet('accounts', 'profile');
        if (response.status === 'success' && response.html) {
            updateHtmlContent('#content', response.html);
            initializeProfileFormHandlers();
        } else {
            console.error('Erreur dans la réponse du serveur:', response);
        }

        // updateProfileInfo(response.data);
        // updateStatistics(response.data);
        // updateFriendsSection(response.data);
        // setupGestionButton();
    } catch (error) {
        console.error('Erreur lors du chargement de la vue du profil:', error);
    }
}
