class Network {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.playerName = null;
    }

    connect() {
        this.socket = io(CONFIG.SERVER_URL);
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('roomCreated', (roomId) => {
            this.roomId = roomId;
            this.showGameRoom();
        });

        this.socket.on('roomJoined', (roomId) => {
            this.roomId = roomId;
            this.showGameRoom();
        });

        this.socket.on('error', (error) => {
            console.error('Server error:', error);
            alert(error);
        });
    }

    createRoom(playerName) {
        this.playerName = playerName;
        this.socket.emit('createRoom', { playerName });
    }

    joinRoom(roomId, playerName) {
        this.playerName = playerName;
        this.socket.emit('joinRoom', { roomId, playerName });
    }

    showGameRoom() {
        document.getElementById('lobby').classList.add('hidden');
        document.getElementById('game-room').classList.remove('hidden');
    }

    showLobby() {
        document.getElementById('game-room').classList.add('hidden');
        document.getElementById('lobby').classList.remove('hidden');
    }
} 