import { isTouchDevice, resetScrollPosition } from '../tools/utility.js';
import Animations from '../modules/animations.js';
import Api from '../api/api.js';

export function initializeFriendInvitation() {
    let invitedFriends = 0;
    let participantCount = 1;

    document.addEventListener('click', async function(event) {
        const btn = event.target.closest('.invite-button');
        if (!btn) return;

        if (event.target.classList.contains('cancel-icon')) {
            event.stopPropagation();
            await cancelInvitation(btn);
            return;
        }

        if (!btn.classList.contains('sent')) {
            const friendBtn = btn.parentElement.querySelector('.friend-btn');
            const friendUsername = friendBtn ? friendBtn.textContent : null;
            if (!friendUsername) return;

            const formData = new FormData();
            formData.append('friend_username', friendUsername);

            try {
                const response = await Api.post('/game/send_invitation/', formData);
                if (response.status === 'success') {
                    btn.innerHTML = 'Envoyé <span class="cancel-icon">&times;</span>';
                    btn.classList.add('sent');
                    invitedFriends++;
                    if (invitedFriends >= participantCount) {
                        document.querySelectorAll('.invite-button:not(.sent)').forEach(el => el.classList.add('disabled'));
                        if (participantCount === 1) {
                            document.querySelector('#start-game-btn').removeAttribute('disabled');
                        } else {
                            document.querySelector('#start-tournament-btn').removeAttribute('disabled');
                        }
                    }
                }
            } catch (error) {
                console.error('Erreur envoi invitation:', error);
            }
        }
    });

    async function cancelInvitation(button) {
        const friendBtn = button.parentElement.querySelector('.friend-btn');
        const friendUsername = friendBtn ? friendBtn.textContent : null;
        if (!friendUsername) return;

        const formData = new FormData();
        formData.append('friend_username', friendUsername);

        try {
            const response = await Api.post('/game/cancel_invitation/', formData);
            if (response.status === 'success') {
                button.innerHTML = 'Inviter';
                button.classList.remove('sent');
                invitedFriends--;
                if (invitedFriends < participantCount) {
                    if (participantCount === 1) {
                        document.querySelector('#start-game-btn').setAttribute('disabled', true);
                    } else {
                        document.querySelector('#start-tournament-btn').setAttribute('disabled', true);
                    }
                    document.querySelectorAll('.invite-button').forEach(el => el.classList.remove('disabled'));
                }
            }
        } catch (error) {
            console.error('Erreur annulation invitation:', error);
        }
    }

    document.querySelectorAll('#start-tournament-btn, #start-game-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            startLoading(participantCount);
        });
    });
}

export async function startLoading(participantCount) {
    try {
        const response = await Api.get('/game/loading/');
        $('#content').html(response.html || response);
        Animations.animateLoadingText();
        if (isTouchDevice()) {
            initializeGameControls('touch');
        } else {
            initializeGameControls('keyboard');
        }
        setTimeout(() => {
            if (participantCount === 1) {
                displayGame();
            } else {
                displayTournamentBracket(participantCount);
            }
        }, 20000);
    } catch (error) {
        console.log('Erreur chargement page loading:', error);
    }
}

export async function displayGame() {
    try {
        const response = await Api.get('game.html');
        $('#home').html(response.html || response);
        resetScrollPosition();
    } catch (error) {
        console.log('Erreur chargement jeu:', error);
    }
}

export async function displayTournamentBracket(participantCount) {
    const url = participantCount === 4 ? 'bracket_4.html' : 'bracket_8.html';
    try {
        const response = await Api.get(url);
        $('#home').html(response.html || response);
        resetScrollPosition();
    } catch (error) {
        console.log('Erreur chargement bracket:', error);
    }
}

export function initializeGameControls(controlType) {
    const player = document.querySelector('.player');
    const gameContainer = document.querySelector('.game-container');
    if (!player || !gameContainer) return;

    let containerWidth = gameContainer.offsetWidth;
    let containerHeight = gameContainer.offsetHeight;
    const collectibleCount = 9;
    const collectibles = [];
    let direction = { x: 1, y: 0 };
    const playerSpeed = 3;
    let playerX = 0;
    let playerY = containerHeight / 2 - 15;
    const keysPressed = {};
    let lastDiagonalDirection = null;
    let touchStartX = null;
    let touchStartY = null;

    function updateContainerDimensions() {
        containerWidth = gameContainer.offsetWidth;
        containerHeight = gameContainer.offsetHeight - 50;
        collectibles.forEach(collectible => {
            let cX = parseFloat(collectible.style.left);
            let cY = parseFloat(collectible.style.top);
            if (cX + 30 > containerWidth) {
                collectible.style.left = `${containerWidth - 30}px`;
            }
            if (cY + 30 > containerHeight) {
                collectible.style.top = `${containerHeight - 30}px`;
            }
        });
    }

    function createCollectibles() {
        collectibles.forEach(col => col.remove());
        collectibles.length = 0;
        for (let i = 0; i < collectibleCount; i++) {
            const collectible = document.createElement('div');
            collectible.className = 'collectible';
            collectible.style.left = `${Math.random() * (containerWidth - 30)}px`;
            collectible.style.top = `${Math.random() * (containerHeight - 30)}px`;
            gameContainer.appendChild(collectible);
            collectibles.push(collectible);
        }
    }

    function movePlayer() {
        const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        const normalized = { x: (direction.x / length) * playerSpeed, y: (direction.y / length) * playerSpeed };
        playerX += normalized.x;
        playerY += normalized.y;

        if (playerX < 0) playerX = containerWidth - player.offsetWidth;
        else if (playerX > containerWidth - player.offsetWidth) playerX = 0;

        if (playerY < 0) playerY = containerHeight - player.offsetHeight;
        else if (playerY > containerHeight - player.offsetHeight) playerY = 0;

        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;

        collectibles.forEach((c, i) => {
            const cRect = c.getBoundingClientRect();
            const pRect = player.getBoundingClientRect();
            if (pRect.left < cRect.right && pRect.right > cRect.left && pRect.top < cRect.bottom && pRect.bottom > cRect.top) {
                c.remove();
                collectibles.splice(i, 1);
                if (collectibles.length === 0) {
                    setTimeout(createCollectibles, 500);
                }
            }
        });
    }

    function updateDirection() {
        if (keysPressed['ArrowUp'] && keysPressed['ArrowLeft']) {
            direction = { x: -1, y: -1 };
            lastDiagonalDirection = direction;
        } else if (keysPressed['ArrowUp'] && keysPressed['ArrowRight']) {
            direction = { x: 1, y: -1 };
            lastDiagonalDirection = direction;
        } else if (keysPressed['ArrowDown'] && keysPressed['ArrowLeft']) {
            direction = { x: -1, y: 1 };
            lastDiagonalDirection = direction;
        } else if (keysPressed['ArrowDown'] && keysPressed['ArrowRight']) {
            direction = { x: 1, y: 1 };
            lastDiagonalDirection = direction;
        } else if (keysPressed['ArrowUp']) {
            direction = { x: 0, y: -1 };
        } else if (keysPressed['ArrowDown']) {
            direction = { x: 0, y: 1 };
        } else if (keysPressed['ArrowLeft']) {
            direction = { x: -1, y: 0 };
        } else if (keysPressed['ArrowRight']) {
            direction = { x: 1, y: 0 };
        } else if (lastDiagonalDirection) {
            direction = lastDiagonalDirection;
        }
    }

    if (controlType === 'keyboard') {
        document.addEventListener('keydown', (e) => {
            keysPressed[e.key] = true;
            updateDirection();
        });
        document.addEventListener('keyup', (e) => {
            keysPressed[e.key] = false;
            if (!keysPressed['ArrowUp'] && !keysPressed['ArrowDown'] && !keysPressed['ArrowLeft'] && !keysPressed['ArrowRight']) {
                if (lastDiagonalDirection) direction = lastDiagonalDirection;
            }
        });
    }

    if (controlType === 'touch') {
        gameContainer.addEventListener('touchstart', e => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: false });

        gameContainer.addEventListener('touchmove', e => {
            if (!touchStartX || !touchStartY) return;
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const threshold = 5;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffY) > threshold) {
                    direction = { x: diffX > 0 ? 1 : -1, y: diffY > 0 ? 1 : -1 };
                } else {
                    direction = { x: diffX > 0 ? 1 : -1, y: 0 };
                }
            } else {
                if (Math.abs(diffX) > threshold) {
                    direction = { x: diffX > 0 ? 1 : -1, y: diffY > 0 ? 1 : -1 };
                } else {
                    direction = { x: 0, y: diffY > 0 ? 1 : -1 };
                }
            }
            touchStartX = touchEndX;
            touchStartY = touchEndY;
        }, { passive: false });
    }

    function gameLoop() {
        movePlayer();
        requestAnimationFrame(gameLoop);
    }

    window.addEventListener('resize', () => updateContainerDimensions());
    updateContainerDimensions();
    createCollectibles();
    gameLoop();
}
