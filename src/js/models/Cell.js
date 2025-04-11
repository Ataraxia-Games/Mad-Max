/**
 * Базовый класс для клетки игрового поля
 */
export class Cell {
    constructor(id, row, col) {
        this.id = id;
        this.row = row;
        this.col = col;
        this.type = 'regular'; // По умолчанию обычная клетка
    }

    /**
     * Получить HTML представление клетки
     * @returns {HTMLElement} - HTML элемент клетки
     */
    render() {
        const cellElement = document.createElement('div');
        cellElement.className = `cell cell-${this.id} ${this.type}`;
        cellElement.dataset.id = this.id;
        cellElement.dataset.row = this.row;
        cellElement.dataset.col = this.col;
        return cellElement;
    }
}

/**
 * Класс для клетки-перекрестка
 */
export class CrossroadCell extends Cell {
    constructor(id, row, col) {
        super(id, row, col);
        this.type = 'crossroad';
        this.connectedCrossroads = []; // Список соединенных перекрестков
    }

    /**
     * Добавить соединение с другим перекрестком
     * @param {CrossroadCell} crossroad - Перекресток для соединения
     */
    addConnection(crossroad) {
        if (!this.connectedCrossroads.includes(crossroad)) {
            this.connectedCrossroads.push(crossroad);
        }
    }

    /**
     * Проверить, соединен ли текущий перекресток с указанным
     * @param {CrossroadCell} crossroad - Перекресток для проверки соединения
     * @returns {boolean} - true, если перекрестки соединены
     */
    isConnectedTo(crossroad) {
        return this.connectedCrossroads.includes(crossroad);
    }
}

/**
 * Класс для клетки-слота карты
 */
export class CardSlotCell extends Cell {
    constructor(id, row, col) {
        super(id, row, col);
        this.type = 'card-slot';
        this.card = null; // Карта, размещенная в слоте
    }

    /**
     * Разместить карту в слоте
     * @param {Card} card - Карта для размещения
     */
    placeCard(card) {
        this.card = card;
    }

    /**
     * Удалить карту из слота
     * @returns {Card} - Удаленная карта
     */
    removeCard() {
        const card = this.card;
        this.card = null;
        return card;
    }

    /**
     * Проверить, есть ли карта в слоте
     * @returns {boolean} - true, если слот содержит карту
     */
    hasCard() {
        return this.card !== null;
    }
}

/**
 * Класс для клетки точки интереса
 */
export class PointOfInterestCell extends Cell {
    constructor(id, row, col, effectType) {
        super(id, row, col);
        this.type = 'point-of-interest';
        this.effectType = effectType; // Тип эффекта точки интереса
    }

    /**
     * Активировать эффект точки интереса
     * @param {Player} player - Игрок, активирующий эффект
     * @returns {Object} - Результат активации эффекта
     */
    activateEffect(player) {
        // В зависимости от типа эффекта, возвращаем разные результаты
        switch (this.effectType) {
            case 'nitro':
                return { type: 'move', count: 1 };
            case 'junkyard':
                return { type: 'remove_card' };
            case 'trader':
                return { type: 'exchange_card' };
            case 'death_race':
                return { type: 'victory_points' };
            case 'doc':
                return { type: 'remove_injury' };
            case 'barricade':
                return { type: 'block_movement' };
            case 'polygon':
                return { type: 'gain_attack_card' };
            case 'laboratory':
                return { type: 'upgrade_card' };
            case 'bunker':
                return { type: 'gain_armor_or_heal' };
            case 'radiation_zone':
                return { type: 'mutation_and_injury' };
            case 'oasis':
                return { type: 'recover_discard' };
            default:
                return { type: 'no_effect' };
        }
    }
} 