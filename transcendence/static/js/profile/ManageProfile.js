// profile/viewManageProfile.js
import Api from '../api/api.js';
import { initializeProfileFormHandlers } from './formHandlers.js';

export async function initializeManageProfileView() {
    try {
        const response = await Api.get('/accounts/gestion_profil/');
        const content = document.querySelector('#content');
        if (content) {
            content.innerHTML = response.html || response; 
        }
        initializeProfileFormHandlers();
    } catch (error) {
        console.error('Erreur chargement gestion profil:', error);
        const content = document.querySelector('#content');
        if (content) {
            content.innerHTML = '<p>Erreur chargement profil</p>';
        }
    }
}
