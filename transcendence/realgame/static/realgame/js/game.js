class PongGame {
    constructor(gameId) {
        console.log('Initializing PongGame:', gameId);
        console.log('Canvas element:', this.canvas);
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize WebSocket connection
        this.socket = new GameSocket(gameId);
        this.socket.onStateUpdate = (state) => this.updateGameState(state);
        
        // Set up input handling
        this.setupControls();
        
        // Game state
        this.gameState = null;

        // Setup game loop for smooth rendering
        this.lastRenderTime = 0;
        this.startRenderLoop();
    }

    startRenderLoop() {
        const renderLoop = (timestamp) => {
            // Calculate delta time
            const dt = timestamp - this.lastRenderTime;
            this.lastRenderTime = timestamp;
            
            // Interpolate positions for smooth movement
            if (this.gameState) {
                this.interpolatePositions(dt);
            }
            
            // Render game
            this.render();
            
            // Request next frame
            requestAnimationFrame(renderLoop);
        };
        
        requestAnimationFrame(renderLoop);
    }

    interpolatePositions(dt) {
        // Smooth out movement between server updates
        if (this.previousState) {
            const alpha = Math.min(dt / (1000 / 60), 1);
            
            // Interpolate ball position
            this.gameState.ball.x = this.lerp(
                this.previousState.ball.x,
                this.gameState.ball.x,
                alpha
            );
            this.gameState.ball.y = this.lerp(
                this.previousState.ball.y,
                this.gameState.ball.y,
                alpha
            );
            
            // Interpolate paddle positions
            ['left', 'right'].forEach(side => {
                this.gameState.paddles[side].y = this.lerp(
                    this.previousState.paddles[side].y,
                    this.gameState.paddles[side].y,
                    alpha
                );
            });
        }
    }

    lerp(start, end, alpha) {
        return start + (end - start) * alpha;
    }
    setupControls() {
        document.addEventListener('keydown', (event) => {
            let direction = null;
            
            switch(event.key) {
                case 'w':
                case 'ArrowUp':
                    direction = 'up';
                    break;
                case 's':
                case 'ArrowDown':
                    direction = 'down';
                    break;
                case ' ':  // Spacebar
                    this.socket.sendPowerUpAction('activate');
                    break;
            }
            
            if (direction) {
                this.socket.sendPaddleMove(direction);
            }
        });
    }

    updateGameState(state) {
        this.gameState = state;
        this.render();
    }

    render() {
        if (!this.gameState) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw paddles
        this.ctx.fillStyle = 'white';
        const paddles = this.gameState.paddles;
        this.ctx.fillRect(paddles.left.x, paddles.left.y, 
                         paddles.left.width, paddles.left.height);
        this.ctx.fillRect(paddles.right.x, paddles.right.y, 
                         paddles.right.width, paddles.right.height);
        
        // Draw ball
        const ball = this.gameState.ball;
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.size/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw power-ups
        this.gameState.power_ups.orbs.forEach(orb => {
            if (orb.active) {
                this.ctx.fillStyle = this.getPowerUpColor(orb.type);
                this.ctx.beginPath();
                this.ctx.arc(orb.x + orb.size/2, orb.y + orb.size/2, 
                           orb.size/2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Update score display
        document.getElementById('score').textContent = 
            `${this.gameState.score.left} - ${this.gameState.score.right}`;
    }

    getPowerUpColor(type) {
        const colors = {
            'invert': '#9300D3',  // Purple
            'shrink': '#FF0000',  // Red
            'ice': '#00BFFF',     // Blue
            'speed': '#FFFF00',   // Yellow
            'flash': '#FFFFFF',   // White
            'sticky': '#00FF00'   // Green
        };
        return colors[type] || '#FFFFFF';
    }
}