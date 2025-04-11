/**
 * Класс представления информации об игроках
 */
export class PlayersInfoView {
    constructor(gameState, containerElement) {
        this.gameState = gameState;
        this.containerElement = containerElement;
        
        // Подписываемся на события
        this.gameState.addEventListener('gameStateChanged', () => this.render());
        this.gameState.addEventListener('currentPlayerChanged', () => this.highlightCurrentPlayer());
    }

    /**
     * Отрисовать информацию обо всех игроках
     */
    render() {
        // Очищаем контейнер
        this.containerElement.innerHTML = '';
        
        // Создаем элементы информации о каждом игроке
        for (const player of this.gameState.players) {
            const playerInfo = player.getInfo();
            
            // Создаем элемент для информации об игроке
            const playerElement = document.createElement('div');
            playerElement.className = 'player-info';
            playerElement.dataset.playerId = player.id;
            
            // Если это текущий игрок, добавляем соответствующий класс
            if (this.gameState.getCurrentPlayer().id === player.id) {
                playerElement.classList.add('current-player');
            }
            
            // Добавляем цветной маркер игрока
            const colorMarker = document.createElement('div');
            colorMarker.className = 'player-color-marker';
            colorMarker.style.backgroundColor = player.color;
            playerElement.appendChild(colorMarker);
            
            // Добавляем имя игрока
            const nameElement = document.createElement('div');
            nameElement.className = 'player-name';
            nameElement.textContent = player.name;
            playerElement.appendChild(nameElement);
            
            // Добавляем информацию о победных очках
            const vpElement = document.createElement('div');
            vpElement.className = 'player-vp';
            vpElement.textContent = `ПО: ${playerInfo.victoryPoints}`;
            playerElement.appendChild(vpElement);
            
            // Добавляем информацию о картах на руке
            const handElement = document.createElement('div');
            handElement.className = 'player-hand-size';
            handElement.textContent = `Карты: ${playerInfo.handSize}`;
            playerElement.appendChild(handElement);
            
            // Добавляем информацию о ранениях
            const injuryElement = document.createElement('div');
            injuryElement.className = 'player-injuries';
            injuryElement.textContent = `Ранения: ${playerInfo.injuries}`;
            playerElement.appendChild(injuryElement);
            
            // Добавляем элемент в DOM
            this.containerElement.appendChild(playerElement);
        }
    }

    /**
     * Подсветить текущего игрока
     */
    highlightCurrentPlayer() {
        // Удаляем подсветку со всех игроков
        const playerElements = this.containerElement.querySelectorAll('.player-info');
        playerElements.forEach(element => {
            element.classList.remove('current-player');
        });
        
        // Добавляем подсветку текущему игроку
        const currentPlayer = this.gameState.getCurrentPlayer();
        const currentPlayerElement = this.containerElement.querySelector(`.player-info[data-player-id="${currentPlayer.id}"]`);
        
        if (currentPlayerElement) {
            currentPlayerElement.classList.add('current-player');
        }
    }

    /**
     * Обновить информацию об игроке
     * @param {Player} player - Игрок, чья информация обновляется
     */
    updatePlayerInfo(player) {
        const playerInfo = player.getInfo();
        const playerElement = this.containerElement.querySelector(`.player-info[data-player-id="${player.id}"]`);
        
        if (playerElement) {
            // Обновляем информацию о победных очках
            const vpElement = playerElement.querySelector('.player-vp');
            if (vpElement) {
                vpElement.textContent = `ПО: ${playerInfo.victoryPoints}`;
            }
            
            // Обновляем информацию о картах на руке
            const handElement = playerElement.querySelector('.player-hand-size');
            if (handElement) {
                handElement.textContent = `Карты: ${playerInfo.handSize}`;
            }
            
            // Обновляем информацию о ранениях
            const injuryElement = playerElement.querySelector('.player-injuries');
            if (injuryElement) {
                injuryElement.textContent = `Ранения: ${playerInfo.injuries}`;
            }
        }
    }
} 