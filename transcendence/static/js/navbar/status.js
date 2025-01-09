import { requestPost } from '../api/index.js';

export async function updateUserStatus(status) {
    console.log('Mise à jour du statut utilisateur :', status);

    // Créer une instance de FormData
    const formData = new FormData();
    formData.append('status', status);

    try {
        const response = await requestPost('accounts', 'burgerMenu/update-status', formData);
        if (response.status === 'success') {
            console.log(`Statut mis à jour avec succès : ${status}`);
        } else {
            console.error(`Erreur lors de la mise à jour du statut : ${response.message}`);
        }
    } catch (error) {
        console.error('Erreur réseau lors de la mise à jour du statut :', error);
    }
}