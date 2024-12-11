// navbar/loadNavbar.js
import Api from '../api/api.js';
import { loadBurgerMenuData } from './loadBurgerMenuData.js';
import { toggleBurgerMenu } from './toggleBurgerMenu.js';

// Fonction pour récupérer les données JSON de la navbar
async function fetchNavbarData() {
    return await Api.get('/core/get_navbar/');
}

// Fonction pour mettre à jour la navbar dans le DOM à partir de données JSON
function updateNavbarHtml(data) {
    const navbarElem = document.querySelector('#navbar');
    if (navbarElem) {
        // On suppose que data.html contient la structure HTML à injecter
        navbarElem.innerHTML = data.html || JSON.stringify(data);
    }
}

// Fonction pour initialiser le burger menu (événements, rechargements périodiques, etc.)
async function initializeBurgerMenu() {
    const burgerToggle = document.querySelector('#burger-menu-toggle');
    if (burgerToggle) {
        await loadBurgerMenuData();
        burgerToggle.addEventListener('click', toggleBurgerMenu);
        setInterval(loadBurgerMenuData, 10000);
    }
}

// Fonction principale pour charger et afficher la navbar
export async function loadNavbar() {
    try {
        const data = await fetchNavbarData();
        updateNavbarHtml(data);
        await initializeBurgerMenu();
    } catch (error) {
        console.error('Erreur chargement navbar:', error);
    }
}
