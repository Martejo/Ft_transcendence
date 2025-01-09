import { requestGet } from '../api/index.js';
import { updateHtmlContent } from '../tools/index.js';

export async function viewFriendProfile(friendName) {
    try {
        console.log(`Chargement du profil de l'ami : ${friendName}`);
        const response = await requestGet('accounts', `friend/${friendName}`);
        
        if (response.status === 'success') {
            const data = response.data;
            console.log('Profil de l\'ami récupéré :', data);

            // Affichez les informations du profil dans une modale ou une autre section
            updateHtmlContent('#content', response.html);
        } else {
            console.error('Erreur lors de la récupération du profil :', response.message);
        }
    } catch (error) {
        console.error('Erreur lors de la requête du profil de l\'ami :', error);
    }
}