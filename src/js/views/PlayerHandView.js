/**
 * Класс представления руки игрока
 */
export class PlayerHandView {
    constructor(gameState, containerElement, deckElement, discardElement) {
        this.gameState = gameState;
        this.containerElement = containerElement;
        this.deckElement = deckElement;
        this.discardElement = discardElement;
        
        // Подписываемся на события
        this.gameState.addEventListener('gameStateChanged', () => this.render());
        this.gameState.addEventListener('currentPlayerChanged', () => this.render());
        this.gameState.addEventListener('cardUsed', (data) => this.onCardUsed(data));
    }

    /**
     * Отрисовать руку игрока
     */
    render() {
        // Очищаем контейнер
        this.containerElement.innerHTML = '';
        
        // Получаем текущего игрока
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        // Отрисовываем карты в руке
        for (const card of currentPlayer.hand) {
            const cardElement = card.render();
            
            // Добавляем обработчик клика
            cardElement.addEventListener('click', () => this.onCardClick(card));
            
            // Добавляем элемент в DOM
            this.containerElement.appendChild(cardElement);
        }
        
        // Обновляем информацию о колоде и сбросе
        this.updateDeckInfo(currentPlayer);
        this.updateDiscardInfo(currentPlayer);
    }

    /**
     * Обновить информацию о колоде игрока
     * @param {Player} player - Игрок, чья колода отображается
     */
    updateDeckInfo(player) {
        // Очищаем контейнер колоды
        this.deckElement.innerHTML = '';
        
        // Создаем элемент для отображения количества карт в колоде
        const deckCountElement = document.createElement('div');
        deckCountElement.className = 'deck-count';
        deckCountElement.textContent = player.deck.length;
        
        // Добавляем элемент в DOM
        this.deckElement.appendChild(deckCountElement);
    }

    /**
     * Обновить информацию о сбросе игрока
     * @param {Player} player - Игрок, чей сброс отображается
     */
    updateDiscardInfo(player) {
        // Очищаем контейнер сброса
        this.discardElement.innerHTML = '';
        
        // Если в сбросе есть карты, отображаем верхнюю карту
        if (player.discard.length > 0) {
            const topCard = player.discard[player.discard.length - 1];
            const cardElement = topCard.render();
            
            // Добавляем элемент в DOM
            this.discardElement.appendChild(cardElement);
        }
        
        // Создаем элемент для отображения количества карт в сбросе
        const discardCountElement = document.createElement('div');
        discardCountElement.className = 'discard-count';
        discardCountElement.textContent = player.discard.length;
        
        // Добавляем элемент в DOM
        this.discardElement.appendChild(discardCountElement);
    }

    /**
     * Обработчик клика по карте
     * @param {Card} card - Карта, по которой был клик
     */
    onCardClick(card) {
        // Генерируем пользовательское событие
        const event = new CustomEvent('cardClick', { detail: { card } });
        this.containerElement.dispatchEvent(event);
    }

    /**
     * Обработчик использования карты
     * @param {Object} data - Данные о использованной карте
     */
    onCardUsed(data) {
        // Перерисовываем руку после использования карты
        this.render();
    }
} 