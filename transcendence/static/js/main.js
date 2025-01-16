// main.js


// Import des modules transverses
import { handleNavbar } from './navbar/index.js';
import { loadPongAnimation, stopPongAnimation } from './modules/groundAnimation.js';
import { adjustBurgerHeight } from './modules/animations.js';
import { adjustSinNavHeight } from './modules/animations.js';
import { adjustContainerIfExists } from './modules/animations.js';
import { adjustAllContainers } from './modules/animations.js';
import { initializeHomeView } from './landing/coreHome.js';
import Views from './modules/views.js';

// Une fois le DOM chargé, vous pouvez initialiser les éléments communs
document.addEventListener('DOMContentLoaded', async () => {
    // Charger la navbar
    console.log('DOMContentLoaded');
    await handleNavbar();
    
    window.addEventListener('hashchange', () => Views.initializeViewFromHash());
    // Appeler fonction landing
    // Charger le contenu de la page initiale (url = /core/home)
    await initializeHomeView();
    
    loadPongAnimation();
	adjustAllContainers(); // Pour resize
    adjustBurgerHeight(); // Pour load, c'est ici qu'il faut appeler ces fonctions
	adjustSinNavHeight(); // Pour load
	adjustContainerIfExists('login'); // Pour load
	adjustContainerIfExists('register'); // Pour load
});
