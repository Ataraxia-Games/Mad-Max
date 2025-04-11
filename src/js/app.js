import { GameState } from './models/GameState.js';
import { GameBoardView } from './views/GameBoardView.js';
import { PlayersInfoView } from './views/PlayersInfoView.js';
import { PlayerHandView } from './views/PlayerHandView.js';
import { GameController } from './controllers/GameController.js';

/**
 * Инициализация игры после загрузки страницы
 */
document.addEventListener('DOMContentLoaded', () => {
    // Создаем модель состояния игры
    const gameState = new GameState();
    
    // Получаем элементы DOM для представлений
    const gameBoardElement = document.getElementById('game-board');
    const playersInfoElement = document.getElementById('players-info');
    const handElement = document.getElementById('hand');
    const deckElement = document.getElementById('deck');
    const discardElement = document.getElementById('discard');
    
    // Создаем представления
    const gameBoardView = new GameBoardView(gameState, gameBoardElement);
    const playersInfoView = new PlayersInfoView(gameState, playersInfoElement);
    const playerHandView = new PlayerHandView(gameState, handElement, deckElement, discardElement);
    
    // Создаем контроллер игры
    const gameController = new GameController(gameState, gameBoardView, playersInfoView, playerHandView);
    
    // Запускаем игру
    gameController.startGame();
}); 