// navbar/toggleBurgerMenu.js


// Fonction pour afficher/masquer le burger menu
export function toggleBurgerMenu() {
    console.log('toggleBurgerMenu');
    const menu = document.getElementById('burger-menu');
    const overlay = document.getElementById('overlay');

    if (!menu || !overlay) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        menu.style.display = 'block';
        overlay.style.display = 'block';

        //quand on clique sur un bouton du menu, il se ferme, et effectue l'action associée
        document.querySelectorAll('#profile-btn, #logout-btn, #tournament-link, #settings-link, #play-btn')
            .forEach(button => {
                button.addEventListener('click', () => {
                    menu.style.display = 'none';
                    overlay.style.display = 'none';
                });
            });

        //quand on clique a coté du menu, il se ferme
        function handleOutsideClick(event) {
            const burgerToggle = document.getElementById('burger-menu-toggle');
            if (!menu.contains(event.target) && burgerToggle && !burgerToggle.contains(event.target)) {
                menu.style.display = 'none';
                overlay.style.display = 'none';
                document.removeEventListener('click', handleOutsideClick);
            }
        }

        document.addEventListener('click', handleOutsideClick);
    }
}