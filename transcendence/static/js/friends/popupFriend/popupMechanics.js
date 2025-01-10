// Gère la mécanique du popup d'ami

export function showFriendPopup(event, friendName) {
    event.stopPropagation();

    const popup = document.getElementById('friendPopup');
    document.getElementById('popupFriendName').innerText = friendName;

    popup.classList.remove('d-none');

    const menu = document.getElementById('burger-menu');
    const menuRect = menu.getBoundingClientRect();
    const mouseX = event.clientX - menuRect.left + menu.scrollLeft;
    const mouseY = event.clientY - menuRect.top + menu.scrollTop;

    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const top = mouseY < 250 ? mouseY + popupHeight : mouseY;
    const left = mouseX < 175 ? mouseX - popupWidth / 2 : mouseX + popupWidth / 2;

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
}

export function closePopupOnClickOutside(event) {
    const popup = document.getElementById('friendPopup');
    if (!popup.contains(event.target) && !event.target.closest('.friend-item')) {
        popup.classList.add('d-none');
    }
}
