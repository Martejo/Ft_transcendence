import Api from './api.js';

export async function getViewJson(app, view) {
    const url = `/${app}/${view}/`;

    try {
        const data = await Api.get(url);
        return data; // Retourne les données JSON
    } catch (error) {
        console.error(`Erreur lors du chargement de ${app}-${view} :`, error);
        throw error;
    }
}

