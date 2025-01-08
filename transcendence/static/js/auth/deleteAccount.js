import { requestPost } from '../api/index.js';

export function handleDeleteAccount() {
    console.log('Handling delete account');
    
    const modal = document.getElementById('delete-account-modal'); // La modale
    const closeBtn = modal.querySelector('.close-btn'); // Bouton de fermeture
    const deleteAccountForm = document.getElementById('delete-account-form'); // Formulaire de suppression

    // Affiche la modale
    if (modal) {
        modal.style.display = 'flex';
    }

    // Fermer la modale via le bouton de fermeture
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Fermer la modale en cliquant en dehors de son contenu
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Gestion de la soumission du formulaire
    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Empêche le comportement par défaut
            const formData = new FormData(deleteAccountForm);

            try {
                const response = await requestPost('accounts', 'profile/delete_account', formData);
                if (response.status === 'success') {
                    showDeleteSuccess(response.message);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setTimeout(() => {
                        window.location.href = ''; // Redirection après suppression
                    }, 2000);
                } else {
                    showDeleteError(response.message || 'Erreur lors de la suppression du compte.');
                }
            } catch (error) {
                console.error('Erreur réseau lors de la suppression du compte:', error);
                showDeleteError('Erreur réseau ou serveur.');
            }
        });
    }

    // Affiche un message de succès
    function showDeleteSuccess(message) {
        const successElem = modal.querySelector('.delete-success');
        if (successElem) {
            successElem.textContent = message;
            successElem.style.display = 'block';
        }
    }

    // Affiche un message d'erreur
    function showDeleteError(message) {
        const errorElem = modal.querySelector('.delete-error');
        if (errorElem) {
            errorElem.textContent = message;
            errorElem.style.display = 'block';
        }
    }
}
