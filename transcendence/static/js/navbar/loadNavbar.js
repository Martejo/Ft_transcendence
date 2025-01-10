// navbar/loadNavbar.js
import { loadBurgerMenuData } from './loadBurgerMenuData.js';
import { toggleBurgerMenu } from './toggleBurgerMenu.js';
import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';

/**
 * Initialise le burger menu : attache les événements et configure le rechargement périodique.
 */
async function initializeBurgerMenu() {
    const burgerToggle = document.querySelector('#burger-menu-toggle');
    if (burgerToggle && !burgerToggle.dataset.bound) {
        await loadBurgerMenuData();
        burgerToggle.addEventListener('click', toggleBurgerMenu);
        burgerToggle.dataset.bound = true; // Marque comme attaché
    }
}

/**
 * Charge et affiche la navbar, puis initialise le burger menu.
 */
export async function loadNavbar() {
    console.log('Début de loadNavbar');
    try {
        // Faire une requête GET pour obtenir les données de la navbar
        const data = await requestGet('core', 'navbar');

        // Vérifie si les données HTML existent
        if (data && data.html) {
            // Met à jour le contenu HTML de la navbar
            updateHtmlContent('#navbar', data.html);

            // [IMPROVE] gérer retour d'erreur
            await initializeBurgerMenu();
        } else {
            console.error('Les données HTML de la navbar sont manquantes.');
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la navbar:', error);
    }
    console.log('Fin de loadNavbar');
}
