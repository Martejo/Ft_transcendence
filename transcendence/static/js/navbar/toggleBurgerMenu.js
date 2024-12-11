// navbar/toggleBurgerMenu.js

export function toggleBurgerMenu() {
    const menu = document.getElementById('burger-menu');
    const overlay = document.getElementById('overlay');

    if (!menu || !overlay) return;

    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        menu.style.display = 'block';
        overlay.style.display = 'block';

        document.querySelectorAll('#profile-btn, #logout-btn, #tournament-link, #settings-link, #play-btn')
            .forEach(button => {
                button.addEventListener('click', () => {
                    menu.style.display = 'none';
                    overlay.style.display = 'none';
                });
            });

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
