// navbar/loadNavbar.js
import { loadBurgerMenuData } from './loadBurgerMenuData.js';
import { toggleBurgerMenu } from './toggleBurgerMenu.js';
import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js'




// Fonction pour initialiser le burger menu (événements, rechargements périodiques, etc.)
async function initializeBurgerMenu() {
    const burgerToggle = document.querySelector('#burger-menu-toggle');
    if (burgerToggle) {
        await loadBurgerMenuData();
        burgerToggle.addEventListener('click', toggleBurgerMenu);
        setInterval(loadBurgerMenuData, 20000);
    }
}

// Fonction principale pour charger et afficher la navbar
export async function loadNavbar() {
    console.log('loadNavbar');
    let data;
    try {
        // Faire une requête GET pour obtenir les données de la navbar
        data = await requestGet('core', 'navbar');
        
        // Vérifier si les données HTML existent
        if (data && data.html) {
            // Mettre à jour le contenu HTML de la navbar
            updateHtmlContent('#navbar', data.html);
            
            
            // Initialiser le burger menu
            await initializeBurgerMenu();
        } else {
            console.error('Les données HTML de la navbar sont manquantes.');
        }
    } catch (error) {
        // Gérer les erreurs de la requête GET
        console.error('Erreur lors du chargement de la navbar:', error);
    }
    console.log('Fin de loadNavbar');
}