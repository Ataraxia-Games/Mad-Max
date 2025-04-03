let game;
let network;

document.addEventListener('DOMContentLoaded', () => {
    // Создаем игру
    window.game = new Game();
    
    // Инициализируем игру без сокета (для тестового режима)
    window.game.initialize();
    
    // Создаем трех тестовых игроков
    const player1 = new Player('player1', 'Воин Пустоши');
    const player2 = new Player('player2', 'Механик Дорог');
    const player3 = new Player('player3', 'Рейдер Бури');

    // Добавляем игроков в игру
    window.game.addPlayer(player1);
    window.game.addPlayer(player2);
    window.game.addPlayer(player3);

    // Начинаем игру
    window.game.startGame();

    // Добавляем обработчик для кнопки End Turn
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (endTurnBtn) {
        endTurnBtn.addEventListener('click', () => {
            if (window.game.currentPlayer) {
                window.game.currentPlayer.endTurn();
            }
        });
    }

    // Добавляем обработчик кликов по игровому полю
    document.getElementById('game-board').addEventListener('click', (event) => {
        const playerSlot = event.target.closest('.player-slot');
        if (playerSlot && window.game.phase === 'POSITION') {
            const position = parseInt(playerSlot.dataset.position);
            if (!isNaN(position)) {
                window.game.handlePlayerPosition(window.game.currentPlayer, position);
            }
        }
    });

    // Добавляем обработчик для карт
    document.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        if (card && window.game.phase === 'PLAY') {
            const cardIndex = Array.from(card.parentElement.children).indexOf(card);
            const targetSlot = event.target.closest('.player-slot, .card-slot');
            
            if (targetSlot) {
                const position = parseInt(targetSlot.dataset.position);
                if (!isNaN(position)) {
                    window.game.handleCardPlay(cardIndex, position);
                }
            }
        }
    });
});

function setupEventListeners() {
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