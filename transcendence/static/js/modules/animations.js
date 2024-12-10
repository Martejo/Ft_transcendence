//animations.js
// Ce fichier contient les animations utilisées dans l'application web.
// Il centralise les effets visuels et les transitions pour une meilleure organisation et réutilisabilité.

const Animations = {
    // Animation de la couleur du texte
    // Change périodiquement la couleur du texte d'un élément entre deux couleurs.
    animateTextColor(element, colors = ['#8EC7E1', 'white'], interval = 1000) {
        if (!element) return;
        let currentIndex = 0;
        setInterval(() => {
            element.style.color = colors[currentIndex];
            currentIndex = (currentIndex + 1) % colors.length;
        }, interval);
    },

    // Ajuste dynamiquement la hauteur d'un menu burger avec marges
    adjustBurgerHeight(navAndMarginHeight = 66) {
        const availableHeight = window.innerHeight - navAndMarginHeight;
        document.documentElement.style.setProperty('--burger-height', `${availableHeight}px`);
    },

    // Ajuste dynamiquement la hauteur sans inclure la barre de navigation
    adjustSinNavHeight(navAndMarginHeight = 50) {
        const availableHeight = window.innerHeight - navAndMarginHeight;
        document.documentElement.style.setProperty('--sin-nav-height', `${availableHeight}px`);
    },

    // Ajuste le conteneur de manière responsive
    adjustContainer(containerId, threshold = 50) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID '${containerId}' not found.`);
            return;
        }
        if (container.scrollHeight > window.innerHeight - threshold) {
            container.classList.remove('center-content');
            container.classList.add('normal-content');
        } else {
            container.classList.add('center-content');
            container.classList.remove('normal-content');
        }
    },

    // Animation d'un texte "chargement..." avec des points animés
    animateLoadingText(loadingTextId = 'loading-text', dotsId = 'loading-dots') {
        const loadingText = document.getElementById(loadingTextId);
        const loadingDots = document.getElementById(dotsId);

        if (!loadingText || !loadingDots) {
            console.warn('Loading text or dots element not found.');
            return;
        }

        const dots = [];
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.innerText = '.';
            dot.style.display = 'inline-block';
            dot.style.fontSize = '1.7em';
            dot.style.transition = 'transform 0.3s ease';
            loadingDots.appendChild(dot);
            dots.push(dot);
        }

        let dotIndex = 0;
        setInterval(() => {
            dots.forEach(dot => (dot.style.transform = 'translateY(0)'));
            dots[dotIndex].style.transform = 'translateY(-10px)';
            dotIndex = (dotIndex + 1) % dots.length;
        }, 300);
    },

    // Animation d'un terrain de jeu (exemple Pong)
    animatePongGame(frames, transitionTime = 2200) {
        let currentFrame = 0;
        const maxFrames = frames.length;
        let animationRunning = true;

        const balle = document.querySelector('.balle');
        const traitGauche = document.querySelector('.trait-gauche');
        const traitDroit = document.querySelector('.trait-droit');

        if (!balle || !traitGauche || !traitDroit) {
            console.warn('Elements for Pong game animation not found.');
            return;
        }

        function animateFrame(time) {
            if (!animationRunning) return;

            const current = frames[currentFrame];
            const next = frames[(currentFrame + 1) % maxFrames];
            let startTime = time;

            function animateStep(timestamp) {
                const progress = (timestamp - startTime) / transitionTime;
                if (progress < 1) {
                    balle.style.left = current.balleX + (next.balleX - current.balleX) * progress + '%';
                    balle.style.top = current.balleY + (next.balleY - current.balleY) * progress + '%';
                    traitGauche.style.top = current.raquetteGaucheY + (next.raquetteGaucheY - current.raquetteGaucheY) * progress + '%';
                    traitDroit.style.top = current.raquetteDroiteY + (next.raquetteDroiteY - current.raquetteDroiteY) * progress + '%';
                    requestAnimationFrame(animateStep);
                } else {
                    currentFrame = (currentFrame + 1) % maxFrames;
                    animateFrame();
                }
            }

            requestAnimationFrame(animateStep);
        }

        animateFrame();

        return {
            stop() {
                animationRunning = false;
            },
        };
    },
};

export default Animations;
