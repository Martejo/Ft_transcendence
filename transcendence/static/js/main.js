// main.js

// Import des modules "bas niveau" (API, utilitaires)
import Api from './api/api.js';
import * as Utility from './api/utility.js';

// Import des modules transverses
import Animations from './modules/animations.js';
import Events from './modules/events.js';
import Views from './modules/views.js';
import { loadNavbar } from './modules/navbar.js';
import { initializeFriendButtons } from './modules/friends.js';

// Import des vues spécifiques
import { initializeLoginView, initializeRegisterView, logoutUser } from './views/authentication.js';
import { initializeEnable2FAView, initializeLogin2FAView, initializeDisable2FAView } from './views/2fa.js';
import { initializeProfileView, initializeGestionProfileView } from './views/profile.js';
import { initializeFriendInvitation, startLoading, displayGame, displayTournamentBracket, initializeGameControls } from './views/game.js';

// Une fois le DOM chargé, vous pouvez initialiser les éléments communs
document.addEventListener('DOMContentLoaded', () => {
    // Charger la navbar
    loadNavbar();

    // Initialiser les événements globaux (hashchange, resize, etc.)
    Events.initializeAllEvents();

    // Déterminer la vue à afficher en fonction du hash
    Views.initializeViewFromHash();
});
