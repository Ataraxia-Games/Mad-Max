let game;
let network;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize network and game
    network = new Network();
    game = new Game();
    
    // Connect to server
    network.connect();
    
    // Setup UI event listeners
    setupEventListeners();
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

    // Card click handlers
    document.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        if (card) {
            const cardId = card.dataset.cardId;
            const cardIndex = Array.from(card.parentElement.children).indexOf(card);
            const targetPosition = event.target.closest('.field-slot')?.dataset.position;
            
            if (targetPosition !== undefined) {
                game.playCard(cardIndex, parseInt(targetPosition));
            }
        }
    });
} 