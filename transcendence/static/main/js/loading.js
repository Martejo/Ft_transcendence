// Fonction pour détecter si l'appareil est tactile
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}


// function initializeGameControls(controlType) {

// 	const player = document.querySelector('.player');
// 	const gameContainer = document.querySelector('.game-container');
// 	let containerWidth = gameContainer.offsetWidth;
// 	let containerHeight = gameContainer.offsetHeight - 50 ;
// 	const collectibleCount = 9;
// 	const collectibles = [];
// 	let direction = { x: 1, y: 0 }; // Par défaut, déplacement vers la droite
// 	const playerSpeed = 3;
// 	let playerX = 0;
// 	let playerY = containerHeight / 2 - 15; // Milieu vertical
// 	const keysPressed = {}; // Stocke les touches enfoncées
// 	let lastDiagonalDirection = null; // Stocke la dernière direction diagonale
// 	let touchStartX = null; // Stocke la position X du toucher initial
// 	let touchStartY = null; // Stocke la position Y du toucher initial


// 	// Initialisation de la position du joueur
// 	player.style.left = `${playerX}px`;
// 	player.style.top = `${playerY}px`;

// 	// Fonction pour éviter que les collectibles ne sortent du conteneur pendant un redimensionnement
// 	function updateContainerDimensions() {
// 		containerWidth = gameContainer.offsetWidth;
// 		containerHeight = gameContainer.offsetHeight - 50;

// 		// Réajuster les collectibles pour rester dans les limites du conteneur
// 		collectibles.forEach(collectible => {
// 			let collectibleX = parseFloat(collectible.style.left);
// 			let collectibleY = parseFloat(collectible.style.top);

// 			// Repositionner si le collectible est hors des nouvelles limites
// 			if (collectibleX + 30 > containerWidth) {
// 				collectible.style.left = `${containerWidth - 30}px`;
// 			}
// 			if (collectibleY + 30 > containerHeight) {
// 				collectible.style.top = `${containerHeight - 30}px`;
// 			}
// 		});
// 	}

// 	function createCollectibles() {
// 		collectibles.forEach(col => col.remove()); // Supprime les collectibles existants
// 		collectibles.length = 0;

// 		for (let i = 0; i < collectibleCount; i++) {
// 			const collectible = document.createElement('div');
// 			collectible.className = 'collectible';
// 			collectible.style.left = `${Math.random() * (containerWidth - 30)}px`;
// 			collectible.style.top = `${Math.random() * (containerHeight - 30)}px`;
// 			gameContainer.appendChild(collectible);
// 			collectibles.push(collectible);
// 		}
// 	}

// 	function movePlayer() {
// 		const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
// 		const normalizedDirection = {
// 			x: (direction.x / length) * playerSpeed,
// 			y: (direction.y / length) * playerSpeed,
// 		};

// 		playerX += normalizedDirection.x;
// 		playerY += normalizedDirection.y;

// 		if (playerX < 0) {
// 			playerX = containerWidth - player.offsetWidth;
// 		} else if (playerX > containerWidth - player.offsetWidth) {
// 			playerX = 0;
// 		}

// 		if (playerY < 0) {
// 			playerY = containerHeight - player.offsetHeight;
// 		} else if (playerY > containerHeight - player.offsetHeight) {
// 			playerY = 0;
// 		}

// 		player.style.left = `${playerX}px`;
// 		player.style.top = `${playerY}px`;

// 		collectibles.forEach((collectible, index) => {
// 			const collectibleRect = collectible.getBoundingClientRect();
// 			const playerRect = player.getBoundingClientRect();

// 			if (
// 				playerRect.left < collectibleRect.right &&
// 				playerRect.right > collectibleRect.left &&
// 				playerRect.top < collectibleRect.bottom &&
// 				playerRect.bottom > collectibleRect.top
// 			) {
// 				collectible.remove();
// 				collectibles.splice(index, 1);

// 				if (collectibles.length === 0) {
// 					setTimeout(createCollectibles, 500);
// 				}
// 			}
// 		});
// 	}

// 	// Mettre à jour la direction du joueur en fonction des touches enfoncées
// 	function updateDirection() {
// 		if (keysPressed['ArrowUp'] && keysPressed['ArrowLeft']) {
// 			direction = { x: -1, y: -1 };
// 			lastDiagonalDirection = { x: -1, y: -1 }; 
// 		} else if (keysPressed['ArrowUp'] && keysPressed['ArrowRight']) {
// 			direction = { x: 1, y: -1 };
// 			lastDiagonalDirection = { x: 1, y: -1 };
// 		} else if (keysPressed['ArrowDown'] && keysPressed['ArrowLeft']) {
// 			direction = { x: -1, y: 1 };
// 			lastDiagonalDirection = { x: -1, y: 1 };
// 		} else if (keysPressed['ArrowDown'] && keysPressed['ArrowRight']) {
// 			direction = { x: 1, y: 1 };
// 			lastDiagonalDirection = { x: 1, y: 1 };
// 		} else if (keysPressed['ArrowUp']) {
// 			direction = { x: 0, y: -1 };
// 		} else if (keysPressed['ArrowDown']) {
// 			direction = { x: 0, y: 1 };
// 		} else if (keysPressed['ArrowLeft']) {
// 			direction = { x: -1, y: 0 };
// 		} else if (keysPressed['ArrowRight']) {
// 			direction = { x: 1, y: 0 };
// 		} else if (lastDiagonalDirection) {
// 			direction = lastDiagonalDirection;
// 		}
// 		lastDiagonalDirection = direction;
// 	}

// 	function handleTouchStart(event) {
// 		const touch = event.touches[0];
// 		touchStartX = touch.clientX;
// 		touchStartY = touch.clientY;
// 	}

// 	function handleTouchMove(event) {
// 		if (!touchStartX || !touchStartY) return;
	
// 		const touchEndX = event.touches[0].clientX;
// 		const touchEndY = event.touches[0].clientY;
	
// 		const diffX = touchEndX - touchStartX;
// 		const diffY = touchEndY - touchStartY;
	
// 		const threshold = 5; // Ajustez ce seuil pour contrôler la sensibilité des diagonales
	
// 		// Détection de la direction avec le seuil pour les diagonales
// 		if (Math.abs(diffX) > Math.abs(diffY)) {
// 			if (Math.abs(diffY) > threshold) {
// 				// Mouvement horizontal avec diagonale
// 				direction = {
// 					x: diffX > 0 ? 1 : -1,
// 					y: diffY > 0 ? 1 : -1,
// 				};
// 			} else {
// 				// Mouvement strictement horizontal
// 				direction = { x: diffX > 0 ? 1 : -1, y: 0 };
// 			}
// 		} else {
// 			if (Math.abs(diffX) > threshold) {
// 				// Mouvement vertical avec diagonale
// 				direction = {
// 					x: diffX > 0 ? 1 : -1,
// 					y: diffY > 0 ? 1 : -1,
// 				};
// 			} else {
// 				// Mouvement strictement vertical
// 				direction = { x: 0, y: diffY > 0 ? 1 : -1 };
// 			}
// 		}
	
// 		// Mettre à jour les coordonnées de départ pour le prochain mouvement
// 		touchStartX = touchEndX;
// 		touchStartY = touchEndY;
// 	}

// 	if (controlType === 'keyboard') {
// 		document.addEventListener('keydown', (e) => {
// 			keysPressed[e.key] = true;
// 			updateDirection();
// 		});
	
// 		document.addEventListener('keyup', (e) => {
// 			keysPressed[e.key] = false;
// 			if (
// 				!keysPressed['ArrowUp'] &&
// 				!keysPressed['ArrowDown'] &&
// 				!keysPressed['ArrowLeft'] &&
// 				!keysPressed['ArrowRight']
// 			) {
// 				if (lastDiagonalDirection) {
// 					direction = lastDiagonalDirection;
// 				}
// 			}
// 		});
// 	}

// 	function gameLoop() {
// 		movePlayer();
// 		requestAnimationFrame(gameLoop);
// 	}

// 	if (controlType === 'touch') {
// 		gameContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
// 		gameContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
// 	}

// 	window.addEventListener('resize', () => {
// 		updateContainerDimensions();
// 	});

// 	updateContainerDimensions();
// 	createCollectibles();
// 	gameLoop();
// }




function initializeGameControls(controlType) {
    const player = document.querySelector('.player');
    const gameContainer = document.querySelector('.game-container');
    const tutorialBox = document.querySelector('.tutorial-box');
    let containerWidth = gameContainer.offsetWidth;
    let containerHeight = gameContainer.offsetHeight - 50;
    const collectibleCount = 9;
    const collectibles = [];
    let direction = { x: 1, y: 0 }; // Par défaut, déplacement vers la droite
    const playerSpeed = 3;
    let playerX = 0;
    let playerY = containerHeight / 2 - 15; // Milieu vertical
    const keysPressed = {}; // Stocke les touches enfoncées
    let lastDiagonalDirection = null; // Stocke la dernière direction diagonale
    let touchStartX = null; // Stocke la position X du toucher initial
    let touchStartY = null; // Stocke la position Y du toucher initial

    // Calcul des dimensions de la box
    const tutorialRect = {
        left: 0,
        top: 0,
        right: tutorialBox.offsetWidth,
        bottom: tutorialBox.offsetHeight,
    };

    // Initialisation de la position du joueur
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;

    // Fonction pour éviter que les collectibles ne sortent du conteneur pendant un redimensionnement
    function updateContainerDimensions() {
        containerWidth = gameContainer.offsetWidth;
        containerHeight = gameContainer.offsetHeight - 50;

        // Réajuster les collectibles pour rester dans les limites du conteneur
        collectibles.forEach((collectible) => {
            let collectibleX = parseFloat(collectible.style.left);
            let collectibleY = parseFloat(collectible.style.top);

            // Repositionner si le collectible est hors des nouvelles limites
            if (collectibleX + 30 > containerWidth) {
                collectible.style.left = `${containerWidth - 30}px`;
            }
            if (collectibleY + 30 > containerHeight) {
                collectible.style.top = `${containerHeight - 30}px`;
            }

            // Repositionner si le collectible est dans la zone de la tutorial-box
            if (
                collectibleX >= tutorialRect.left &&
                collectibleX <= tutorialRect.right &&
                collectibleY >= tutorialRect.top &&
                collectibleY <= tutorialRect.bottom
            ) {
                collectible.style.left = `${Math.random() * (containerWidth - 30)}px`;
                collectible.style.top = `${Math.random() * (containerHeight - 30)}px`;
            }
        });
    }

    function createCollectibles() {
        collectibles.forEach((col) => col.remove()); // Supprime les collectibles existants
        collectibles.length = 0;

        for (let i = 0; i < collectibleCount; i++) {
            let collectible;
            let isValidPosition = false;

            while (!isValidPosition) {
                collectible = document.createElement('div');
                collectible.className = 'collectible';
                const randomX = Math.random() * (containerWidth - 30);
                const randomY = Math.random() * (containerHeight - 30);

                // Vérifie que le collectible n'est pas dans la zone de la tutorial-box
                if (
                    !(
                        randomX >= tutorialRect.left &&
                        randomX <= tutorialRect.right &&
                        randomY >= tutorialRect.top &&
                        randomY <= tutorialRect.bottom
                    )
                ) {
                    isValidPosition = true;
                    collectible.style.left = `${randomX}px`;
                    collectible.style.top = `${randomY}px`;
                    gameContainer.appendChild(collectible);
                    collectibles.push(collectible);
                }
            }
        }
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

        // Empêcher le joueur d'entrer dans la zone de la tutorial-box
        if (
            playerX + player.offsetWidth >= tutorialRect.left &&
            playerX <= tutorialRect.right &&
            playerY + player.offsetHeight >= tutorialRect.top &&
            playerY <= tutorialRect.bottom
        ) {
            // Vérifier la direction pour rebondir correctement
            if (direction.x > 0) {
                playerX = tutorialRect.right; // Sortir par la droite
            } else if (direction.x < 0) {
                playerX = tutorialRect.left - player.offsetWidth; // Sortir par la gauche
            }

            if (direction.y > 0) {
                playerY = tutorialRect.bottom; // Sortir par le bas
            } else if (direction.y < 0) {
                playerY = tutorialRect.top - player.offsetHeight; // Sortir par le haut
            }
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

    // Gestion des contrôles clavier
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

    function handleTouchStart(event) {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }

    function handleTouchMove(event) {
        if (!touchStartX || !touchStartY) return;

        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        const threshold = 5;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            direction = { x: diffX > 0 ? 1 : -1, y: 0 };
        } else {
            direction = { x: 0, y: diffY > 0 ? 1 : -1 };
        }

        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }

    if (controlType === 'keyboard') {
        document.addEventListener('keydown', (e) => {
            keysPressed[e.key] = true;
            updateDirection();
        });

        document.addEventListener('keyup', (e) => {
            keysPressed[e.key] = false;
        });
    }

    function gameLoop() {
        movePlayer();
        requestAnimationFrame(gameLoop);
    }

    if (controlType === 'touch') {
        gameContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        gameContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    window.addEventListener('resize', () => {
        updateContainerDimensions();
    });

    updateContainerDimensions();
    createCollectibles();
    gameLoop();
}






