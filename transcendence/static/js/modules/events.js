import Animations from './animations.js';
import Views from './views.js';

const Events = {
    initializeGlobalEvents() {
        console.log('initializeGlobalEvents');
        window.addEventListener('resize', () => {
            Animations.adjustBurgerHeight();
            Animations.adjustSinNavHeight();
            // Animations.adjustContainer('invite-container');
            Animations.adjustContainer('login');
            Animations.adjustContainer('register');
        });

        window.addEventListener('load', () => {
            Animations.adjustBurgerHeight();
            Animations.adjustSinNavHeight();
            // Animations.adjustContainer('invite-container');
            Animations.adjustContainer('login');
            Animations.adjustContainer('register');
        });

        window.addEventListener('hashchange', () => Views.initializeViewFromHash());

    },

    // [IMPROVE] gerer les boutons directement dans le html
    // initializeButtonEvents() {
    //     document.addEventListener('click', event => {
    //         if (event.target.id === 'logout-btn') {
    //             event.preventDefault();
    //             window.location.hash = '#accounts-logout';
    //         }
    //         // if (event.target.id === 'enable-2fa-btn') {
    //         //     event.preventDefault();
    //         //     window.location.hash = '#accounts-enable_2fa';
    //         // }
    //         // if (event.target.id === 'disable-2fa-btn') {
    //         //     event.preventDefault();
    //         //     window.location.hash = '#accounts-disable_2fa';
    //         // }
    //     });
    // },

    //[IMPROVE] fonction inutile si on a deplace la gestion des boutons dans le html
    initializeAllEvents() {
        this.initializeGlobalEvents();
        //this.initializeButtonEvents();
    }
};

export default Events;
