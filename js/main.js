let game;
let network;

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация игры
    initializeGame();
    
    // Настройка обработчиков событий
    setupGameEventListeners();
});

function initializeGame() {
    // Создаем экземпляр игры
    game = new Game();
    
    // Инициализируем базовые компоненты игры
    game.initialize();
    
    // Создаем тестовых игроков (временное решение)
    createTestPlayers();
    
    // Начинаем игру
    game.startGame();
}

function createTestPlayers() {
    const players = [
        { id: 'player1', name: 'Воин Пустоши' },
        { id: 'player2', name: 'Механик Дорог' },
        { id: 'player3', name: 'Рейдер Бури' }
    ];
    
    players.forEach(playerData => {
        const player = new Player(playerData.id, playerData.name);
        game.addPlayer(player);
    });
}

function setupGameEventListeners() {
    // Обработчик выбора карты
    document.addEventListener('click', handleCardSelection);
    
    // Обработчик выбора позиции
    document.addEventListener('click', handlePositionSelection);
    
    // Обработчик кнопки завершения хода
    setupEndTurnButton();
}

function handleCardSelection(e) {
    const cardElement = e.target.closest('.card');
    if (!cardElement || game.phase !== 'PLAYER_TURN') return;
    
    const cardId = parseInt(cardElement.dataset.cardId);
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    if (!currentPlayer) {
        console.log('No current player');
        return;
    }
    
    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (card) {
        currentPlayer.selectCard(card);
    }
}

function handlePositionSelection(e) {
    const slotElement = e.target.closest('.player-slot');
    if (slotElement && game.phase === 'PLAYER_TURN') {
        const position = parseInt(slotElement.dataset.position);
        const currentPlayer = game.players[game.currentPlayerIndex];
        
        if (currentPlayer && currentPlayer.selectedCard) {
            // Используем выбранную карту
            if (currentPlayer.useSelectedCard()) {
                // Если карта успешно использована, обновляем UI
                game.updateGameInfo();
            }
        }
    }
}

function setupEndTurnButton() {
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (endTurnBtn) {
        endTurnBtn.addEventListener('click', () => {
            const currentPlayer = game.players[game.currentPlayerIndex];
            if (currentPlayer) {
                // Если есть выбранная карта, используем её
                if (currentPlayer.selectedCard) {
                    currentPlayer.useSelectedCard();
                }
                // Завершаем ход
                currentPlayer.endTurn();
                game.updateGameInfo();
            }
        });
    } else {
        console.error('End Turn button not found');
    }
}

// Функции для сетевой игры
function setupNetworkGame() {
    // Create room button
    document.getElementById('create-room').addEventListener('click', () => {
        const playerName = prompt('Enter your name:');
        if (playerName) {
            network.createRoom(playerName);
        }
    });

    // Join room button
    document.getElementById('join-room').addEventListener('click', () => {
        const roomId = prompt('Enter room ID:');
        const playerName = prompt('Enter your name:');
        if (roomId && playerName) {
            network.joinRoom(roomId, playerName);
        }
    });
} 