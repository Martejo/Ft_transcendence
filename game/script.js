function resizeTerrain() {
    const container = document.getElementById('game'); // Conteneur principal
    const terrain = document.querySelector('.terrain'); // Terrain

    // Dimensions maximales disponibles dans la fenêtre
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight - 50;

    // Ratio fixe du terrain (2:1)
    const terrainRatio = 2 / 1;

    // Calculer la largeur et la hauteur idéales
    let terrainWidth = windowWidth * 0.9; // Par défaut, 90% de la largeur de la fenêtre
    let terrainHeight = terrainWidth / terrainRatio;

    // Si la hauteur dépasse la hauteur disponible, ajuster
    if (terrainHeight > windowHeight * 0.8) {
        terrainHeight = windowHeight * 0.8; // 90% de la hauteur de la fenêtre
        terrainWidth = terrainHeight * terrainRatio; // Ajuster la largeur pour respecter le ratio
    }

    // Appliquer les dimensions calculées
    terrain.style.width = `${terrainWidth}px`;
    terrain.style.height = `${terrainHeight}px`;
}

// Appeler la fonction au chargement et lors du redimensionnement de la fenêtre
window.addEventListener('load', resizeTerrain);
window.addEventListener('resize', resizeTerrain);