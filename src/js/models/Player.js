/**
 * Класс игрока
 */
export class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.position = null; // Текущая позиция на поле (ссылка на клетку)
        this.victoryPoints = 0; // Количество победных очков
        this.injuries = []; // Список полученных ранений
        
        // Карты
        this.deck = []; // Колода карт
        this.hand = []; // Карты в руке
        this.discard = []; // Стопка сброса
        this.equipped = []; // Экипированные карты (снаряжение, персонажи)
    }

    /**
     * Установить позицию игрока на поле
     * @param {Cell} cell - Клетка, на которую перемещается игрок
     */
    setPosition(cell) {
        this.position = cell;
    }

    /**
     * Проверить, может ли игрок переместиться на указанную клетку
     * @param {Cell} targetCell - Целевая клетка для перемещения
     * @returns {boolean} - true, если перемещение возможно
     */
    canMoveTo(targetCell) {
        // Проверяем, является ли целевая клетка перекрестком
        if (targetCell.type !== 'crossroad') {
            return false;
        }
        
        // Проверяем, есть ли соединение между текущей и целевой клеткой
        if (this.position && this.position.type === 'crossroad') {
            return this.position.isConnectedTo(targetCell);
        }
        
        return false;
    }

    /**
     * Добавить карту в колоду
     * @param {Card} card - Карта для добавления в колоду
     */
    addCardToDeck(card) {
        this.deck.push(card);
    }

    /**
     * Взять карту из колоды в руку
     * @returns {Card|null} - Взятая карта или null, если колода пуста
     */
    drawCard() {
        if (this.deck.length === 0) {
            // Если колода пуста, перемешиваем сброс и делаем новую колоду
            if (this.discard.length === 0) {
                return null; // Нет карт для взятия
            }
            
            this.deck = [...this.discard];
            this.discard = [];
            this.shuffleDeck();
        }
        
        const card = this.deck.pop();
        this.hand.push(card);
        return card;
    }

    /**
     * Сбросить карту из руки
     * @param {Card} card - Карта для сброса
     * @returns {Card|null} - Сброшенная карта или null, если карта не найдена
     */
    discardCard(card) {
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index === -1) {
            return null; // Карта не найдена в руке
        }
        
        const [discardedCard] = this.hand.splice(index, 1);
        this.discard.push(discardedCard);
        return discardedCard;
    }

    /**
     * Использовать карту
     * @param {Card} card - Карта для использования
     * @param {GameState} gameState - Текущее состояние игры
     * @param {Object} target - Цель для карты (если требуется)
     * @returns {Object} - Результат использования карты
     */
    useCard(card, gameState, target) {
        // Проверяем, есть ли карта в руке
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index === -1) {
            return { success: false, message: 'Карта не найдена в руке' };
        }
        
        // Активируем эффект карты
        const result = card.activate(this, gameState, target);
        
        if (result.success) {
            // Если карта успешно сыграна, сбрасываем ее
            this.discardCard(card);
        }
        
        return result;
    }

    /**
     * Экипировать карту снаряжения или персонажа
     * @param {Card} card - Карта для экипировки
     * @returns {boolean} - true, если карта успешно экипирована
     */
    equipCard(card) {
        if (card.type !== 'equipment' && card.type !== 'character') {
            return false; // Только карты снаряжения и персонажей можно экипировать
        }
        
        // Удаляем карту из руки
        const index = this.hand.findIndex(c => c.id === card.id);
        if (index === -1) {
            return false; // Карта не найдена в руке
        }
        
        const [equippedCard] = this.hand.splice(index, 1);
        this.equipped.push(equippedCard);
        
        // Добавляем победные очки, если есть
        if (equippedCard.victoryPoints) {
            this.victoryPoints += equippedCard.victoryPoints;
        }
        
        return true;
    }

    /**
     * Получить ранение
     * @param {Object} injury - Ранение
     */
    addInjury(injury) {
        this.injuries.push(injury);
    }

    /**
     * Вылечить ранение
     * @param {Object} injury - Ранение для лечения
     * @returns {boolean} - true, если ранение успешно вылечено
     */
    healInjury(injury) {
        const index = this.injuries.findIndex(i => i.id === injury.id);
        if (index === -1) {
            return false; // Ранение не найдено
        }
        
        this.injuries.splice(index, 1);
        return true;
    }

    /**
     * Перемешать колоду
     */
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    /**
     * Добавить победные очки
     * @param {number} points - Количество очков для добавления
     */
    addVictoryPoints(points) {
        this.victoryPoints += points;
    }
    
    /**
     * Получить информацию об игроке для отображения
     * @returns {Object} - Информация об игроке
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            victoryPoints: this.victoryPoints,
            handSize: this.hand.length,
            deckSize: this.deck.length,
            discardSize: this.discard.length,
            injuries: this.injuries.length
        };
    }
} 