const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');

// Serve static files
app.use(express.static('./'));

// Game state
const rooms = new Map();

class Room {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.gameState = {
            turn: 0,
            phase: 'WAITING',
            currentPlayer: null,
            players: []
        };
    }

    addPlayer(playerId, playerName) {
        if (this.players.size >= 4) {
            throw new Error('Room is full');
        }

        this.players.set(playerId, {
            id: playerId,
            name: playerName,
            hand: [],
            field: new Array(5).fill(null),
            deck: [],
            health: 30,
            mana: 0,
            maxMana: 0
        });

        this.updateGameState();
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        this.updateGameState();
    }

    updateGameState() {
        this.gameState.players = Array.from(this.players.values());
        
        // Broadcast updated state to all players in the room
        this.players.forEach((player, playerId) => {
            io.to(playerId).emit('gameState', this.gameState);
        });
    }

    startGame() {
        if (this.players.size < 2) {
            throw new Error('Not enough players');
        }

        this.gameState.phase = 'DRAW';
        this.gameState.turn = 0;
        this.gameState.currentPlayer = Array.from(this.players.keys())[0];
        
        // Initialize player decks and hands
        this.players.forEach(player => {
            // TODO: Initialize deck with cards
            player.deck = [];
            player.hand = [];
            for (let i = 0; i < 5; i++) {
                player.hand.push(player.deck.pop());
            }
        });

        this.updateGameState();
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('createRoom', ({ playerName }) => {
        const roomId = uuidv4();
        const room = new Room(roomId);
        rooms.set(roomId, room);
        
        socket.join(roomId);
        room.addPlayer(socket.id, playerName);
        
        socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', ({ roomId, playerName }) => {
        const room = rooms.get(roomId);
        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }

        try {
            socket.join(roomId);
            room.addPlayer(socket.id, playerName);
            socket.emit('roomJoined', roomId);
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('playCard', ({ cardIndex, targetPosition }) => {
        const room = Array.from(socket.rooms)
            .find(roomId => rooms.has(roomId));
        
        if (!room) return;

        const gameRoom = rooms.get(room);
        const player = gameRoom.players.get(socket.id);
        
        if (gameRoom.gameState.currentPlayer !== socket.id) {
            socket.emit('error', 'Not your turn');
            return;
        }

        // Handle card play logic here
        // TODO: Implement card playing logic

        gameRoom.updateGameState();
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        
        // Find and remove player from their room
        rooms.forEach((room, roomId) => {
            if (room.players.has(socket.id)) {
                room.removePlayer(socket.id);
                if (room.players.size === 0) {
                    rooms.delete(roomId);
                }
            }
        });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 