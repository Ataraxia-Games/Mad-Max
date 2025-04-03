class Game {
    constructor() {
        this.players = new Map();
        this.currentPlayer = null;
        this.turn = 0;
        this.phase = 'DRAW'; // DRAW, PLAY, COMBAT, END
        this.socket = null;
    }

    initialize(socket) {
        this.socket = socket;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('gameState', (state) => this.updateGameState(state));
        this.socket.on('playerJoined', (player) => this.addPlayer(player));
        this.socket.on('playerLeft', (playerId) => this.removePlayer(playerId));
        this.socket.on('turnStart', (playerId) => this.startTurn(playerId));
        this.socket.on('cardPlayed', (data) => this.handleCardPlayed(data));
    }

    addPlayer(playerData) {
        const player = new Player(playerData.id, playerData.name);
        this.players.set(playerData.id, player);
        this.updateUI();
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.updateUI();
    }

    startTurn(playerId) {
        this.currentPlayer = this.players.get(playerId);
        this.phase = 'DRAW';
        this.currentPlayer.maxMana = Math.min(10, this.turn + 1);
        this.currentPlayer.mana = this.currentPlayer.maxMana;
        this.currentPlayer.drawCard();
        this.updateUI();
    }

    handleCardPlayed(data) {
        const { playerId, cardIndex, targetPosition } = data;
        const player = this.players.get(playerId);
        if (player) {
            player.playCard(cardIndex, targetPosition);
            this.updateUI();
        }
    }

    updateGameState(state) {
        // Update local game state with server state
        this.turn = state.turn;
        this.phase = state.phase;
        this.currentPlayer = state.currentPlayer;
        
        // Update players
        state.players.forEach(playerData => {
            const player = this.players.get(playerData.id);
            if (player) {
                Object.assign(player, playerData);
            }
        });

        this.updateUI();
    }

    updateUI() {
        // Update all players' UI
        this.players.forEach(player => {
            player.updateStats();
            player.renderHand();
            player.renderField();
        });

        // Update game phase and turn information
        const gameInfo = document.getElementById('game-info');
        if (gameInfo) {
            gameInfo.innerHTML = `
                <div>Turn: ${this.turn}</div>
                <div>Phase: ${this.phase}</div>
                <div>Current Player: ${this.currentPlayer?.name || 'None'}</div>
            `;
        }
    }

    playCard(cardIndex, targetPosition) {
        if (this.currentPlayer !== this.players.get(this.socket.id)) return;
        
        this.socket.emit('playCard', {
            cardIndex,
            targetPosition
        });
    }
} 