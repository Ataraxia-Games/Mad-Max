const CONFIG = {
    SERVER_URL: 'http://localhost:3000',
    GAME: {
        MAX_PLAYERS: 4,
        MIN_PLAYERS: 2,
        HAND_SIZE: 5,
        FIELD_SIZE: 5,
        TURN_TIME: 30, // seconds
    },
    CARDS: {
        TYPES: ['UNIT', 'SPELL', 'BUILDING'],
        RARITIES: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'],
        MAX_COPIES: 2, // maximum copies of the same card in deck
    }
}; 