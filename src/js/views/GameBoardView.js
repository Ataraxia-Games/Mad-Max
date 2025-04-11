/**
 * Класс представления игрового поля
 */
export class GameBoardView {
    constructor(gameState, containerElement) {
        this.gameState = gameState;
        this.containerElement = containerElement;
        this.cellElements = []; // Массив ссылок на HTML-элементы клеток
        
        // Подписываемся на события изменения состояния игры
        this.gameState.addEventListener('gameStateChanged', () => this.render());
        this.gameState.addEventListener('playerMoved', (data) => this.updatePlayerPosition(data.player));
    }

    /**
     * Отрисовать игровое поле
     */
    render() {
        // Очищаем контейнер
        this.containerElement.innerHTML = '';
        this.cellElements = [];
        
        // Создаем клетки игрового поля
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = this.gameState.gameBoard[row][col];
                const cellElement = cell.render();
                
                // Добавляем обработчик клика
                cellElement.addEventListener('click', () => this.onCellClick(cell));
                
                // Добавляем элемент в DOM
                this.containerElement.appendChild(cellElement);
                
                // Сохраняем ссылку на элемент для быстрого доступа
                this.cellElements.push(cellElement);
            }
        }
        
        // Отрисовываем позиции игроков
        this.renderPlayerPositions();
    }

    /**
     * Отрисовать позиции игроков на поле
     */
    renderPlayerPositions() {
        // Удаляем все маркеры игроков
        const existingMarkers = this.containerElement.querySelectorAll('.player-marker');
        existingMarkers.forEach(marker => marker.remove());
        
        // Добавляем маркеры для каждого игрока
        for (const player of this.gameState.players) {
            if (player.position) {
                const cellId = player.position.id;
                const cellElement = this.containerElement.querySelector(`.cell-${cellId}`);
                
                if (cellElement) {
                    // Добавляем класс для позиции игрока
                    cellElement.classList.add('player-position');
                    
                    // Создаем маркер игрока
                    const markerElement = document.createElement('div');
                    markerElement.className = 'player-marker';
                    markerElement.style.backgroundColor = player.color;
                    markerElement.dataset.playerId = player.id;
                    
                    // Добавляем маркер в клетку
                    cellElement.appendChild(markerElement);
                }
            }
        }
    }

    /**
     * Обновить позицию игрока на поле
     * @param {Player} player - Игрок, чья позиция изменилась
     */
    updatePlayerPosition(player) {
        // Удаляем старую позицию
        const oldMarker = this.containerElement.querySelector(`.player-marker[data-player-id="${player.id}"]`);
        if (oldMarker) {
            const oldCell = oldMarker.parentElement;
            oldCell.classList.remove('player-position');
            oldMarker.remove();
        }
        
        // Добавляем новую позицию
        if (player.position) {
            const cellId = player.position.id;
            const cellElement = this.containerElement.querySelector(`.cell-${cellId}`);
            
            if (cellElement) {
                // Добавляем класс для позиции игрока
                cellElement.classList.add('player-position');
                
                // Создаем маркер игрока
                const markerElement = document.createElement('div');
                markerElement.className = 'player-marker';
                markerElement.style.backgroundColor = player.color;
                markerElement.dataset.playerId = player.id;
                
                // Добавляем маркер в клетку
                cellElement.appendChild(markerElement);
            }
        }
    }

    /**
     * Подсветить доступные для перемещения клетки
     * @param {Player} player - Игрок, для которого подсвечиваются клетки
     */
    highlightAvailableMoves(player) {
        // Сначала удаляем существующую подсветку
        const highlightedCells = this.containerElement.querySelectorAll('.cell.highlighted');
        highlightedCells.forEach(cell => cell.classList.remove('highlighted'));
        
        // Если игрок не имеет текущей позиции, то нет доступных ходов
        if (!player.position) {
            return;
        }
        
        // Получаем список соединенных с текущей позицией перекрестков
        const connectedCrossroads = player.position.connectedCrossroads || [];
        
        // Подсвечиваем соединенные перекрестки
        for (const crossroad of connectedCrossroads) {
            const cellId = crossroad.id;
            const cellElement = this.containerElement.querySelector(`.cell-${cellId}`);
            
            if (cellElement) {
                cellElement.classList.add('highlighted');
            }
        }
    }

    /**
     * Обработчик клика по клетке
     * @param {Cell} cell - Клетка, по которой был клик
     */
    onCellClick(cell) {
        // Генерируем пользовательское событие
        const event = new CustomEvent('cellClick', { detail: { cell } });
        this.containerElement.dispatchEvent(event);
    }
} 