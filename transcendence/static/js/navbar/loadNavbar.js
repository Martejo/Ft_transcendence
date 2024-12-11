// navbar/loadNavbar.js
import Api from '../api/api.js';
import { loadBurgerMenuData } from './loadBurgerMenuData.js';
import { toggleBurgerMenu } from './toggleBurgerMenu.js';

export async function loadNavbar() {
    try {
        const response = await Api.get('/core/get_navbar/');
        const navbarElem = document.querySelector('#navbar');
        if (navbarElem) {
            navbarElem.innerHTML = response.html || response;
        }

        const burgerToggle = document.querySelector('#burger-menu-toggle');
        if (burgerToggle) {
            await loadBurgerMenuData();
            burgerToggle.addEventListener('click', toggleBurgerMenu);
            setInterval(loadBurgerMenuData, 10000);
        }
    } catch (error) {
        console.error('Erreur chargement navbar:', error);
    }
}
