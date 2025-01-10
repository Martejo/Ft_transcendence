import { handleEnable2FA, handleDisable2FA, handleDeleteAccount } from './actions.js';

export function attachProfileEvents() {
    // Bouton Activer 2FA
    const enable2FABtn = document.querySelector('#enable-2fa-btn');
    if (enable2FABtn && !enable2FABtn.dataset.bound) {
        enable2FABtn.addEventListener('click', handleEnable2FA);
        enable2FABtn.dataset.bound = true;
    }

    // Bouton Désactiver 2FA
    const disable2FABtn = document.querySelector('#disable-2fa-btn');
    if (disable2FABtn && !disable2FABtn.dataset.bound) {
        disable2FABtn.addEventListener('click', handleDisable2FA);
        disable2FABtn.dataset.bound = true;
    }

    // Bouton Supprimer le compte
    const deleteAccountBtn = document.querySelector('#delete-account-btn');
    if (deleteAccountBtn && !deleteAccountBtn.dataset.bound) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
        deleteAccountBtn.dataset.bound = true;
    }
}
