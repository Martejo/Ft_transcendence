import { initializeLoginView, initializeRegisterView } from '../views/authentication.js';
import { initializeProfileView, initializeGestionProfileView } from '../views/profile.js';
import { initializeEnable2FAView, initializeLogin2FAView, initializeDisable2FAView } from '../views/2fa.js';
import { initializeFriendInvitation } from '../views/game.js';

const Views = {
    initializeViewFromHash() {
        const hash = window.location.hash.substring(1);
        if (!hash) {
            window.location.hash = '#core-home';
            return;
        }

        const [app, view] = hash.split('-');
        if (!app || !view) {
            window.location.hash = '#core-home';
            return;
        }
        
        //
        switch (`${app}-${view}`) {
            case 'accounts-login':
                initializeLoginView();
                break;
            case 'accounts-register':
                initializeRegisterView();
                break;
            case 'accounts-profile':
                initializeProfileView();
                break;
            case 'accounts-gestion_profil':
                initializeGestionProfileView();
                break;
            case 'accounts-enable_2fa':
                initializeEnable2FAView();
                break;
            case 'accounts-verify_2fa_login':
                initializeLogin2FAView();
                break;
            case 'accounts-disable_2fa':
                initializeDisable2FAView();
                break;
            case 'game-invite_game':
                initializeFriendInvitation();
                break;
            default:
                // Vue par défaut
                break;
        }
    }
};

export default Views;

