import { requestPost } from '../api/index.js';

export async function handleAddFriend(friendUsername) {
    console.log('handleAddFriend:', friendUsername);

    try {
        // Préparation des données avec FormData
        const formData = new FormData();
        formData.append('friend_username', friendUsername);

        // Envoi de la requête avec FormData
        const response = await requestPost('accounts', 'friends/add', formData);

        if (response.status === 'success') {
            console.log('Demande d\'ami envoyée avec succès.');
            displaySuccessMessage('add-friend-success', response.message);
            clearErrorMessage('add-friend-error');
        } else {
            console.error('Erreur lors de l\'envoi de la demande d\'ami:', response.message);
            displayErrorMessage('add-friend-error', response.message);
        }
    } catch (error) {
        console.error('Erreur réseau lors de l\'ajout d\'un ami:', error);
        displayErrorMessage('add-friend-error', 'Une erreur réseau est survenue.');
    }
}

// Fonctions utilitaires pour afficher les messages d'erreur et de succès
function displayErrorMessage(elementId, message) {
    const errorElement = document.querySelector(`#${elementId}`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function displaySuccessMessage(elementId, message) {
    const successElement = document.querySelector(`#${elementId}`);
    if (successElement) {
        successElement.textContent = message;
    }
}

function clearErrorMessage(elementId) {
    const errorElement = document.querySelector(`#${elementId}`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}