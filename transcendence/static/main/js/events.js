// Ce fichier gère les événements globaux et spécifiques de l'application web.
// Il centralise les écouteurs d'événements

import Animations from './animations.js';
import Views from './views.js';

const Events = {
    // Initialise les événements globaux au chargement de la page
    initializeGlobalEvents() {
        // Gestion des événements liés au redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            Animations.adjustBurgerHeight();
            Animations.adjustSinNavHeight();
            Animations.adjustContainer('invite-container');
            Animations.adjustContainer('login');
            Animations.adjustContainer('register');
        });

        // Appelle les ajustements initiaux lors du chargement de la page
        window.addEventListener('load', () => {
            Animations.adjustBurgerHeight();
            Animations.adjustSinNavHeight();
            Animations.adjustContainer('invite-container');
            Animations.adjustContainer('login');
            Animations.adjustContainer('register');
        });

        // Gestion des changements de hash dans l'URL
        window.addEventListener('hashchange', () => Views.initializeViewFromHash());
        Views.initializeViewFromHash(); // Initialisation initiale des vues
    },

    // Gestion des événements pour les boutons spécifiques
    initializeButtonEvents() {
        // Gestion du bouton de déconnexion
        document.addEventListener('click', event => {
            if (event.target.id === 'logout-btn') {
                event.preventDefault();
                console.log('Logout button clicked');
                window.location.hash = '#accounts-logout';
            }
        });

        // Gestion des boutons d'activation et de désactivation de la 2FA
        document.addEventListener('click', event => {
            if (event.target.id === 'enable-2fa-btn') {
                event.preventDefault();
                console.log('Enable 2FA button clicked');
                window.location.hash = '#accounts-enable_2fa';
            } else if (event.target.id === 'disable-2fa-btn') {
                event.preventDefault();
                console.log('Disable 2FA button clicked');
                window.location.hash = '#accounts-disable_2fa';
            }
        });

        // Gestion des invitations d'amis
        document.addEventListener('click', event => {
            if (event.target.classList.contains('invite-button')) {
                event.preventDefault();
                console.log('Invite button clicked');
                // Logique spécifique pour gérer l'invitation
            }
        });
    },

    // Initialisation de tous les événements
    initializeAllEvents() {
        this.initializeGlobalEvents();
        this.initializeButtonEvents();
    },
};

export default Events;
