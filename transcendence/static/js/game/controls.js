// game/controls.js
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
