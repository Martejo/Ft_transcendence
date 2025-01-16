import { initializeHomeView } from './landing/coreHome.js';
import { handleLogin } from './auth/index.js';
import { initializeRegisterView } from './auth/index.js';
import { initializeLogin2FAView } from './auth/index.js';
import { initializeGameHomeView } from './game/index.js';
import { handleAccountsManagement } from './accountManagement/index.js';
import { handleViewProfile } from './userProfile/index.js';
import {handleGameMenu} from './game/index.js';
import { handleFriendProfile } from './friends/index.js';

// Initialisation du routeur Navigo
const router = new window.Navigo('/', { hash: false });


/**
 * Initialisation des routes Navigo.
 */
export function initializeRouter() {
    router
        .on('/', () => {
            console.log('Route: Home');
            initializeHomeView();
        })
        .on('/login', () => {
            console.log('Route: Login');
            handleLogin();
        })
        .on('/register', () => {
            console.log('Route: Register');
            initializeRegisterView();
        })
        .on('/2fa-login', () => {
            console.log('Route: 2FA Login');
            initializeLogin2FAView();
        })
        .on('/home', () => {
            console.log('Route: Game Home');
            initializeGameHomeView();
        })
        .on('/account', () => {
            console.log('Route: account');
            handleAccountsManagement();
        })
        .on('/profile', () => {
            console.log('Route: profile');
            handleViewProfile();
        })
        .on('/game-options', () => {
            console.log('Route: game-options');
            handleGameMenu();
        })
        .on('/profile/:friendUsername', ({ friendUsername }) => {
            console.log(`Route: Profile for ${friendUsername}`);
            handleFriendProfile(friendUsername); // Appelle la fonction pour gérer le profil de l'ami
        })
        .notFound(() => {
            console.error('Route inconnue : Page non trouvée');
            // Charger une vue 404 ici si nécessaire
        });

    // Résolution de la route actuelle
    router.resolve();
}

/**
 * Navigation dynamique.
 * @param {string} route - La route cible.
 */
export function navigateTo(route) {
    router.navigate(route);
}
