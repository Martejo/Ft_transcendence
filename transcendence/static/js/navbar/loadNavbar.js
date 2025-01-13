// navbar/loadNavbar.js
import { toggleBurgerMenu } from './toggleBurgerMenu.js';
import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';
import { eventsHandlerBurgerMenu } from '../burgerMenu/index.js';

/**
 * Initialise le burger menu : attache les événements et configure le rechargement périodique.
 */
async function initializeBurgerMenu() {
    const burgerToggle = document.querySelector('#burger-menu-toggle');
    if (burgerToggle && !burgerToggle.dataset.bound) {
        burgerToggle.addEventListener('click', toggleBurgerMenu);
        burgerToggle.dataset.bound = true; // Marque comme attaché
    }
}

/**
 * Charge et affiche la navbar, puis initialise le burger menu.
 */
async function loadNavbar() {
    console.log('Début de loadNavbar');
    try {
        // Faire une requête GET pour obtenir les données de la navbar
        const data = await requestGet('core', 'navbar');

        // Vérifie si les données HTML existent
        if (data && data.html) {
            // Met à jour le contenu HTML de la navbar
            updateHtmlContent('#navbar', data.html);
            return data.is_authenticated;

            // [IMPROVE] gérer retour d'erreur
            
        } else {
            console.error('Les données HTML de la navbar sont manquantes.');
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la navbar:', error);
    }
    console.log('Fin de loadNavbar');
}

/**
 * Gestionnaire pour charger et afficher la navbar.
 * Gère les erreurs et affiche des messages appropriés en cas de problème.
 */
export async function handleNavbar() {
    console.log('Chargement de la navbar...');
    try {
        const is_authenticated = await loadNavbar(); // Charge le contenu de la navbar et initialise les événements
        if (is_authenticated)
        {
            await initializeBurgerMenu();
            eventsHandlerBurgerMenu();

        }
        console.log('Navbar chargée avec succès.');
    } catch (error) {
        console.error('Erreur lors du chargement de la navbar dans handleNavbar:', error);
        //displayNavbarError('Erreur lors du chargement de la navbar. Veuillez réessayer.');
    }
}