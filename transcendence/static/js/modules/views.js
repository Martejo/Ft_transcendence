import { initializeLoginView, initializeRegisterView, logoutUser } from '../auth/index.js';
import { initializeEnable2FAView, initializeLogin2FAView, initializeDisable2FAView } from '../auth/index.js';

// import { initializeLoginView, initializeRegisterView } from '../views/authentication.js';
import { initializeProfileView, initializeGestionProfileView } from '../views/profile.js';
import { initializeEnable2FAView, initializeLogin2FAView, initializeDisable2FAView } from '../views/2fa.js';
import { initializeFriendInvitation } from '../views/game.js';

const Views = {
    initializeViewFromHash() {
        const hash = window.location.hash.substring(1) || 'core-home'; // Hash par défaut si vide
        const [app, view] = hash.split('-');
    
        // Si le hash est mal formé, rediriger vers la page par défaut (en changeant le hash cette fonction sera automatiquement rappelee)
        if (!app || !view) {
            window.location.hash = '#core-home';
            return;
        }
    
        // Charger le contenu de la page avec un appel GET sur la bonne URL
        loadContent(app, view);
    
        // Table de correspondance des vues
        const viewInitializers = {
            'accounts-login': initializeLoginView,
            'accounts-register': initializeRegisterView,
            'accounts-profile': initializeProfileView,
            'accounts-gestion_profil': initializeGestionProfileView,
            'accounts-enable_2fa': initializeEnable2FAView,
            'accounts-verify_2fa_login': initializeLogin2FAView,
            'accounts-disable_2fa': initializeDisable2FAView,
            'game-invite_game': initializeFriendInvitation,
        };
    
        // Appeler l'initialisateur correspondant, ou ne rien faire par défaut
        const initializer = viewInitializers[`${app}-${view}`];
        if (initializer) initializer();
    }
};

export default Views;

