// main.js


// Import des modules transverses
import Events from './modules/events.js';
import { handleNavbar } from './navbar/index.js';

// Une fois le DOM chargé, vous pouvez initialiser les éléments communs
document.addEventListener('DOMContentLoaded', async () => {
    // Charger la navbar
    console.log('DOMContentLoaded');
    await handleNavbar();
    
    // Appeler fonction landing
    // Charger le contenu de la page initiale (url = /core/home)
    // await initializeHomeView();
    window.location.hash = '#core-home'; // test

    // Initialiser les événements globaux (hashchange, resize, etc.)
    Events.initializeAllEvents();
});
