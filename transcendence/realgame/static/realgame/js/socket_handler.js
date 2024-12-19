class GameSocket {
    constructor(gameId) {
        // Use the exact path pattern that matches your routing
        const wsScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsUrl = `${wsScheme}${window.location.host}/ws/game/${gameId}/`;
        console.log('Attempting to connect to:', wsUrl);
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket closed');
        };
    }
}

    sendPaddleMove(direction) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'paddle_move',
                direction: direction
            }));
        }
    }

    sendPowerUpAction(action) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'power_up_action',
                action: action
            }));
        }
    }
}