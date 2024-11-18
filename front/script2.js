function initializeGame() {
    const player = document.querySelector('.player');
    const gameContainer = document.querySelector('.game-container');
    let containerWidth = gameContainer.offsetWidth;
    let containerHeight = gameContainer.offsetHeight;
    const collectibleCount = 9;
    const collectibles = [];
    const keysPressed = {};
    let direction = { x: 1, y: 0 }; // Par défaut, déplacement vers la droite
    const playerSpeed = 3;
    let playerX = 0;
    let playerY = containerHeight / 2 - 15; // Milieu vertical
    let lastDiagonalDirection = null; // Stocke la dernière direction diagonale

    // Initialisation de la position du joueur
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;

    function updateContainerDimensions() {
		containerWidth = gameContainer.offsetWidth;
		containerHeight = gameContainer.offsetHeight;
	
		// Réajuster les collectibles pour rester dans les limites du conteneur
		collectibles.forEach(collectible => {
			let collectibleX = parseFloat(collectible.style.left);
			let collectibleY = parseFloat(collectible.style.top);
	
			// Repositionner si le collectible est hors des nouvelles limites
			if (collectibleX + 30 > containerWidth) {
				collectible.style.left = `${containerWidth - 30}px`;
			}
			if (collectibleY + 30 > containerHeight) {
				collectible.style.top = `${containerHeight - 30}px`;
			}
		});
	}

    function createCollectibles() {
        collectibles.forEach(col => col.remove()); // Supprime les collectibles existants
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

    function updateDirection() {
        if (keysPressed['ArrowUp'] && keysPressed['ArrowLeft']) {
            direction = { x: -1, y: -1 };
            lastDiagonalDirection = { x: -1, y: -1 }; 
        } else if (keysPressed['ArrowUp'] && keysPressed['ArrowRight']) {
            direction = { x: 1, y: -1 };
            lastDiagonalDirection = { x: 1, y: -1 };
        } else if (keysPressed['ArrowDown'] && keysPressed['ArrowLeft']) {
            direction = { x: -1, y: 1 };
            lastDiagonalDirection = { x: -1, y: 1 };
        } else if (keysPressed['ArrowDown'] && keysPressed['ArrowRight']) {
            direction = { x: 1, y: 1 };
            lastDiagonalDirection = { x: 1, y: 1 };
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
        lastDiagonalDirection = direction;
    }

    function movePlayer() {
        const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        const normalizedDirection = {
            x: (direction.x / length) * playerSpeed,
            y: (direction.y / length) * playerSpeed,
        };

        playerX += normalizedDirection.x;
        playerY += normalizedDirection.y;

        if (playerX < 0) {
            playerX = containerWidth - player.offsetWidth;
        } else if (playerX > containerWidth - player.offsetWidth) {
            playerX = 0;
        }

        if (playerY < 0) {
            playerY = containerHeight - player.offsetHeight;
        } else if (playerY > containerHeight - player.offsetHeight) {
            playerY = 0;
        }

        player.style.left = `${playerX}px`;
        player.style.top = `${playerY}px`;

        collectibles.forEach((collectible, index) => {
            const collectibleRect = collectible.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            if (
                playerRect.left < collectibleRect.right &&
                playerRect.right > collectibleRect.left &&
                playerRect.top < collectibleRect.bottom &&
                playerRect.bottom > collectibleRect.top
            ) {
                collectible.remove();
                collectibles.splice(index, 1);

                if (collectibles.length === 0) {
                    setTimeout(createCollectibles, 500);
                }
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
        updateDirection();
    });

    document.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
        if (
            !keysPressed['ArrowUp'] &&
            !keysPressed['ArrowDown'] &&
            !keysPressed['ArrowLeft'] &&
            !keysPressed['ArrowRight']
        ) {
            if (lastDiagonalDirection) {
                direction = lastDiagonalDirection;
            }
        }
    });

    function gameLoop() {
        movePlayer();
        requestAnimationFrame(gameLoop);
    }

    window.addEventListener('resize', () => {
        updateContainerDimensions();
    });

    updateContainerDimensions();
    createCollectibles();
    gameLoop();
}


// Fonction pour détecter si l'appareil est tactile
function isTouchDevice() {
    return (
        'ontouchstart' in window || // Événements tactiles natifs
        navigator.maxTouchPoints > 0 || // Points tactiles pris en charge
        navigator.msMaxTouchPoints > 0 // Compatibilité avec les anciens navigateurs
    );
}

// Fonction pour détecter si l'appareil est un mobile ou une tablette
function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

// Configuration des contrôles en fonction de l'appareil
function initializeControls() {
    if (isTouchDevice() || isMobileDevice()) {
        console.log('Mode tactile activé');
        initializeTouchControls();
    } else {
        console.log('Mode clavier activé');
        initializeKeyboardControls();
    }
}

// Initialiser les contrôles clavier
function initializeKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
        updateDirection();
    });

    document.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
        updateDirection();
    });
}

// Initialiser les contrôles tactiles
function initializeTouchControls() {
    const gameContainer = document.querySelector('.game-container');
    gameContainer.addEventListener('touchstart', handleTouchStart, false);
    gameContainer.addEventListener('touchmove', handleTouchMove, false);

    let touchStartX = null;
    let touchStartY = null;

    function handleTouchStart(event) {
        const firstTouch = event.touches[0];
        touchStartX = firstTouch.clientX;
        touchStartY = firstTouch.clientY;
    }

    function handleTouchMove(event) {
        if (!touchStartX || !touchStartY) {
            return;
        }

        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Mouvement horizontal
            direction = diffX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            // Mouvement vertical
            direction = diffY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }

        touchStartX = null;
        touchStartY = null;
    }
}