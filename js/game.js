class Game {
    constructor() {
        this.players = new Map();
        this.currentPlayer = null;
        this.turn = 0;
        this.phase = 'SETUP'; // SETUP -> POSITION -> PLAY -> END
        this.socket = null;
        this.board = new Board();
        this.fieldDeck = [];
        this.round = 1;
        this.positionedPlayers = new Set();
        this.messageTimeout = null;
    }

    setupEventListeners() {
        const endTurnBtn = document.getElementById('end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.addEventListener('click', () => {
                if (this.currentPlayer) {
                    this.currentPlayer.endTurn();
                }
            });
        }
    }

    initialize(socket = null) {
        // Инициализируем игровое поле
        this.board.initialize();
        
        // Создаем полевую колоду
        this.fieldDeck = Card.createFieldDeck();
        
        // Устанавливаем начальную фазу
        this.phase = 'SETUP';
        
        // Настраиваем обработчики событий
        this.setupEventListeners();
        
        // Если передан сокет, настраиваем сетевую игру
        if (socket) {
            this.socket = socket;
            this.setupSocketListeners();
        }
        
        this.updateGameInfo();
    }

    setupSocketListeners() {
        this.socket.on('gameState', (state) => this.updateGameState(state));
        this.socket.on('playerJoined', (player) => this.addPlayer(player));
        this.socket.on('playerLeft', (playerId) => this.removePlayer(playerId));
        this.socket.on('allPlayersReady', () => this.startGame());
        this.socket.on('allPlayersPositioned', () => this.startRound());
        this.socket.on('playerReady', (data) => this.handlePlayerReady(data));
        this.socket.on('playerPositioned', (data) => this.handlePlayerPositioned(data));
    }

    addPlayer(player) {
        this.players.set(player.id, player);
        player.initializeStarterDeck();
        this.board.renderBoard();
        this.updateUI();
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.updateUI();
    }

    startGame() {
        if (this.players.size < 1) {
            console.log('Нет игроков для начала игры');
            return;
        }

        // Создаем и перемешиваем полевую колоду
        this.fieldDeck = Card.createFieldDeck();
        
        // Раздаем 8 карт на поле
        for (let i = 0; i < 8; i++) {
            if (this.fieldDeck.length > 0) {
                const card = this.fieldDeck.pop();
                this.board.placeCard(i, card);
            }
        }

        // Инициализируем колоды всех игроков
        for (const player of this.players.values()) {
            player.initializeStarterDeck();
        }

        // Первый игрок начинает размещение
        this.currentPlayer = this.players.values().next().value;
        this.phase = 'POSITION';
        this.showMessage('Game started! Players, choose your positions!');
        this.board.renderBoard();
        this.updateGameInfo();
    }

    showMessage(text, duration = 3000) {
        // Remove existing message if any
        this.clearMessage();
        
        const message = document.createElement('div');
        message.className = 'game-message';
        message.textContent = text;
        document.body.appendChild(message);
        
        this.messageTimeout = setTimeout(() => {
            this.clearMessage();
        }, duration);
    }
    
    clearMessage() {
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
        const existingMessage = document.querySelector('.game-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    updateGameInfo() {
        document.getElementById('current-phase').textContent = this.phase;
        document.getElementById('current-round').textContent = this.round;
        document.getElementById('current-player-name').textContent = 
            this.currentPlayer ? this.currentPlayer.name : '-';
    }

    handlePlayerPosition(player, position) {
        if (this.phase !== 'POSITION') return;
        
        // Проверяем, не занята ли позиция
        for (const [_, player] of this.players) {
            if (player.position === position) {
                console.log('Эта позиция уже занята');
                return;
            }
        }

        // Размещаем игрока
        player.position = position;
        this.positionedPlayers.add(player.id);
        this.board.initializePlayerPosition(player.id, position);

        // Переходим к следующему игроку или к фазе игры
        if (this.positionedPlayers.size === this.players.size) {
            this.startPlayPhase();
        } else {
            // Находим следующего игрока
            const playerArray = Array.from(this.players.values());
            const currentIndex = playerArray.indexOf(player);
            this.currentPlayer = playerArray[(currentIndex + 1) % playerArray.length];
            this.showMessage(`${this.currentPlayer.name}, разместите свой отряд на поле`);
        }

        this.showMessage(`${player.name} has taken position ${position}`);
        if (this.allPlayersPositioned()) {
            this.phase = 'PLAY';
            this.showMessage('All players positioned! Starting the game...');
        }
        this.updateGameInfo();
    }

    startPlayPhase() {
        this.phase = 'PLAY';
        this.currentPlayer = Array.from(this.players.values())[0];
        this.updateUI();
    }

    handleCardPlay(cardIndex, targetPosition) {
        if (this.phase !== 'PLAY') return;

        const card = this.currentPlayer.hand[cardIndex];
        if (!card) return;

        if (card.play(this.currentPlayer, targetPosition)) {
            this.currentPlayer.discardCard(cardIndex);
            this.nextTurn();
        }
    }

    nextTurn() {
        const playerArray = Array.from(this.players.values());
        const currentIndex = playerArray.indexOf(this.currentPlayer);
        this.currentPlayer = playerArray[(currentIndex + 1) % playerArray.length];
        this.showMessage(`${this.currentPlayer.name}'s turn!`);
        this.updateGameInfo();
    }

    handlePlayerReady(data) {
        const { playerId, ready } = data;
        const player = this.players.get(playerId);
        if (player) {
            player.isReady = ready;
            this.updateUI();
        }
    }

    handlePlayerPositioned(data) {
        const { playerId, position } = data;
        const player = this.players.get(playerId);
        if (player) {
            this.board.initializePlayerPosition(playerId, position);
            this.updateUI();
        }
    }

    startRound() {
        this.round++;
        this.showMessage(`Round ${this.round} begins!`);
        this.updateGameInfo();
        this.phase = 'PLAY';
        // Определяем первого игрока (например, случайным образом)
        const playerIds = Array.from(this.players.keys());
        const firstPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
        this.startTurn(firstPlayerId);
    }

    startTurn(playerId) {
        this.currentPlayer = this.players.get(playerId);
        this.updateUI();
    }

    updateGameState(state) {
        this.turn = state.turn;
        this.phase = state.phase;
        this.currentPlayer = this.players.get(state.currentPlayerId);
        
        // Обновляем состояние поля
        state.board.cardSlots.forEach((cardData, index) => {
            if (cardData) {
                const card = new Card(
                    cardData.id,
                    cardData.name,
                    cardData.type,
                    cardData.rarity,
                    cardData.cost,
                    cardData.stats
                );
                this.board.placeCard(index, card);
            }
        });
        
        // Обновляем позиции игроков
        state.board.playerPositions.forEach((position, playerId) => {
            this.board.playerPositions.set(playerId, position);
        });
        
        this.updateUI();
    }

    updateUI() {
        // Обновляем информацию о фазе и ходе
        const turnInfo = document.getElementById('turn-info');
        if (turnInfo) {
            const endTurnBtn = document.getElementById('end-turn-btn');
            if (endTurnBtn) {
                endTurnBtn.style.display = this.phase === 'PLAY' ? 'block' : 'none';
            }
            
            turnInfo.innerHTML = `
                <div class="phase-info">Фаза: ${this.getPhaseDescription()}</div>
                <div class="round-info">Раунд: ${this.round}</div>
                <div class="current-player">Текущий игрок: ${this.currentPlayer?.name || 'Ожидание...'}</div>
                ${endTurnBtn?.outerHTML || ''}
            `;
        }

        // Обновляем статистику всех игроков
        for (const player of this.players.values()) {
            player.updateUI();
        }

        // Обновляем доску
        this.board.renderBoard();
    }

    // Обработка кликов по игровому полю
    handleBoardClick(event) {
        if (this.phase === 'POSITION') {
            const playerSlot = event.target.closest('.player-slot');
            if (playerSlot) {
                const position = parseInt(playerSlot.dataset.position);
                const player = this.players.get(this.socket.id);
                if (player && !player.position) {
                    player.setStartPosition(position);
                }
            }
        } else if (this.phase === 'PLAY' && this.currentPlayer?.id === this.socket.id) {
            // Логика хода игрока
        }
    }

    onPlayerEndTurn(player) {
        if (player !== this.currentPlayer) {
            console.log('Сейчас не ваш ход');
            return;
        }

        this.nextTurn();
    }

    getPhaseDescription() {
        switch (this.phase) {
            case 'SETUP':
                return 'Подготовка';
            case 'POSITION':
                return 'Размещение отрядов';
            case 'PLAY':
                return 'Игровая фаза';
            case 'END':
                return 'Конец игры';
            default:
                return this.phase;
        }
    }

    allPlayersPositioned() {
        return this.positionedPlayers.size === this.players.size;
    }
} 