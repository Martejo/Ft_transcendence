// authentication views
import { initializeLoginView, initializeRegisterView, logoutUser } from '../auth/index.js';
import { initializeEnable2FAView, initializeLogin2FAView, initializeDisable2FAView } from '../auth/index.js';

// profile views
import { initializeProfileView, initializeManageProfileView } from '../profile/index.js';

// game views
import { initializeFriendInvitation } from '../game/index.js';


const Views = {
    async initializeViewFromHash() {
        const hash = window.location.hash.substring(1) || 'core-home'; // Hash par défaut si vide
        const [app, view] = hash.split('-');
    
        // Si le hash est mal formé, rediriger vers la page par défaut
        if (!app || !view) {
            window.location.hash = '#core-home';
            return;
        }

        // Table de correspondance des vues avec importation dynamique
        const viewInitializers = {
            'accounts-login': async () => (await import('../auth/index.js')).initializeLoginView(),
            'accounts-register': async () => (await import('../auth/index.js')).initializeRegisterView(),
            'accounts-profile': async () => (await import('../profile/index.js')).initializeProfileView(),
            'accounts-gestion_profil': async () => (await import('../profile/index.js')).initializeManageProfileView(),
            'accounts-enable_2fa': async () => (await import('../auth/index.js')).initializeEnable2FAView(),
            'accounts-verify_2fa_login': async () => (await import('../auth/index.js')).initializeLogin2FAView(),
            'accounts-disable_2fa': async () => (await import('../auth/index.js')).initializeDisable2FAView(),
            'game-invite_game': async () => (await import('../game/index.js')).initializeFriendInvitation(),
        };
    
        // Appeler l'initialisateur correspondant, ou ne rien faire par défaut
        const initializer = viewInitializers[`${app}-${view}`];
        if (initializer) await initializer();
    }
};

export default Views;