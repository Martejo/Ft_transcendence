// modules/contentLoader.js
import Api from '../api/api.js';

export async function loadContent(app, view) {
    const url = `/${app}/${view}/`; // Ajustez selon votre structure de routage
    try {
        const response = await Api.get(url);
        document.querySelector('#content').innerHTML = response.html || response;
    } catch (error) {
        console.error(`Erreur lors du chargement de ${app}-${view} :`, error);
        document.querySelector('#content').innerHTML = '<p>Une erreur est survenue lors du chargement du contenu.</p>';
    }
}
