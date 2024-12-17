// profile/viewProfile.js

// [IMPROVE] effacer les updates et importer depuis tools 
// Utilitaire pour mettre à jour un élément HTML avec du contenu texte
function updateTextContent(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
}

// Utilitaire pour mettre à jour un attribut d'une balise (exemple : `src`, `alt`, `href`)
function updateAttribute(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.setAttribute(attribute, value);
    }
}

// Met à jour la section "Profil utilisateur"
function updateProfileInfo(data) {
    updateTextContent('.profile-info h3', `Pseudo : ${data.username}`);
    updateAttribute('.profile-info img', 'src', data.avatar_url);
    updateAttribute('.profile-info img', 'alt', `Avatar de ${data.username}`);
    updateTextContent('.profile-info p strong', data.match_count || 'N/A');
}

// Met à jour la section "Statistiques"
function updateStatistics(data) {
    updateTextContent('.statistics .list-group-item:nth-child(1)', `Victoires : ${data.victories}`);
    updateTextContent('.statistics .list-group-item:nth-child(2)', `Défaites : ${data.defeats}`);
    updateTextContent('.statistics .list-group-item:nth-child(3)', `Meilleur score : ${data.best_score} pts`);
}

// Met à jour la section "Amis"
function updateFriendsSection(data) {
    updateTextContent('.friends-section p strong', data.friends_count);
}

// Initialise la gestion de profil (bouton)
function setupGestionButton() {
    const gestionBtn = document.querySelector('#gestion-btn');
    if (gestionBtn) {
        gestionBtn.addEventListener('click', () => {
            window.location.hash = '#accounts-gestion_profil';
        });
    }
}

// Fonction principale pour initialiser la vue du profil
// A voir si le get est effectué ici
export function initializeProfileView(data) {
    
    console.log('initializeProfileView called with data:', data);
    updateProfileInfo(data);
    updateStatistics(data);
    updateFriendsSection(data);
    setupGestionButton();
}