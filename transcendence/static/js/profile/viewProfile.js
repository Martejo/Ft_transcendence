// profile/viewProfile.js
export function initializeProfileView() {
    console.log('initializeProfileView called');
    const gestionBtn = document.querySelector('#gestion-btn');
    if (gestionBtn) {
        gestionBtn.addEventListener('click', () => {
            window.location.hash = '#accounts-gestion_profil';
        });
    }
}
