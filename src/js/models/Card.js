/**
 * Базовый класс для игровых карт
 */
export class Card {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = 'basic'; // Базовый тип карты
    }

    /**
     * Активировать эффект карты
     * @param {Player} player - Игрок, использующий карту
     * @param {GameState} gameState - Текущее состояние игры
     * @returns {Object} - Результат применения карты
     */
    activate(player, gameState) {
        // Базовая реализация не делает ничего
        return { success: true, message: 'Карта активирована' };
    }

    /**
     * Получить HTML представление карты
     * @returns {HTMLElement} - HTML элемент карты
     */
    render() {
        const cardElement = document.createElement('div');
        cardElement.className = `card card-${this.type}`;
        cardElement.dataset.id = this.id;
        
        const titleElement = document.createElement('div');
        titleElement.className = 'card-title';
        titleElement.textContent = this.name;
        
        const descElement = document.createElement('div');
        descElement.className = 'card-description';
        descElement.textContent = this.description;
        
        cardElement.appendChild(titleElement);
        cardElement.appendChild(descElement);
        
        return cardElement;
    }
}

/**
 * Карта перемещения
 */
export class MoveCard extends Card {
    constructor(id, name, description, moveCount) {
        super(id, name, description);
        this.type = 'move';
        this.moveCount = moveCount; // Количество шагов для перемещения
    }

    /**
     * Активировать карту перемещения
     * @param {Player} player - Игрок, использующий карту
     * @param {GameState} gameState - Текущее состояние игры
     * @returns {Object} - Результат перемещения
     */
    activate(player, gameState) {
        // Логика перемещения
        return { 
            success: true, 
            message: `Перемещение на ${this.moveCount} шагов`, 
            action: 'move',
            count: this.moveCount
        };
    }
}

/**
 * Карта атаки
 */
export class AttackCard extends Card {
    constructor(id, name, description, attackPower) {
        super(id, name, description);
        this.type = 'attack';
        this.attackPower = attackPower; // Сила атаки
    }

    /**
     * Активировать карту атаки
     * @param {Player} player - Игрок, использующий карту
     * @param {GameState} gameState - Текущее состояние игры
     * @param {Player} target - Цель атаки (другой игрок)
     * @returns {Object} - Результат атаки
     */
    activate(player, gameState, target) {
        if (!target) {
            return { success: false, message: 'Не указана цель атаки' };
        }
        
        // Логика атаки
        return { 
            success: true, 
            message: `Атака с силой ${this.attackPower}`, 
            action: 'attack',
            power: this.attackPower,
            target: target.id
        };
    }
}

/**
 * Карта дипломатии/взаимодействия
 */
export class DiplomacyCard extends Card {
    constructor(id, name, description, diplomacyPower) {
        super(id, name, description);
        this.type = 'diplomacy';
        this.diplomacyPower = diplomacyPower; // Сила дипломатии
    }

    /**
     * Активировать карту дипломатии
     * @param {Player} player - Игрок, использующий карту
     * @param {GameState} gameState - Текущее состояние игры
     * @param {Object} target - Цель дипломатии (игрок или карта на поле)
     * @returns {Object} - Результат дипломатии
     */
    activate(player, gameState, target) {
        if (!target) {
            return { success: false, message: 'Не указана цель дипломатии' };
        }
        
        // Логика дипломатии
        return { 
            success: true, 
            message: `Дипломатия с силой ${this.diplomacyPower}`, 
            action: 'diplomacy',
            power: this.diplomacyPower,
            target: target.id
        };
    }
}

/**
 * Карта отдыха
 */
export class RestCard extends Card {
    constructor(id, name, description, healAmount) {
        super(id, name, description);
        this.type = 'rest';
        this.healAmount = healAmount; // Количество восстанавливаемых ранений
    }

    /**
     * Активировать карту отдыха
     * @param {Player} player - Игрок, использующий карту
     * @param {GameState} gameState - Текущее состояние игры
     * @returns {Object} - Результат отдыха
     */
    activate(player, gameState) {
        // Логика отдыха и восстановления
        return { 
            success: true, 
            message: `Восстановление ${this.healAmount} ранений`, 
            action: 'heal',
            amount: this.healAmount
        };
    }
}

/**
 * Карта события
 */
export class EventCard extends Card {
    constructor(id, name, description, eventType, eventEffect) {
        super(id, name, description);
        this.type = 'event';
        this.eventType = eventType; // Тип события
        this.eventEffect = eventEffect; // Эффект события
    }

    /**
     * Активировать карту события
     * @param {Player} player - Игрок, использующий карту
     * @param {GameState} gameState - Текущее состояние игры
     * @returns {Object} - Результат события
     */
    activate(player, gameState) {
        // Логика события в зависимости от типа
        return { 
            success: true, 
            message: `Событие: ${this.name}`, 
            action: 'event',
            eventType: this.eventType,
            eventEffect: this.eventEffect
        };
    }
}

/**
 * Карта снаряжения
 */
export class EquipmentCard extends Card {
    constructor(id, name, description, equipmentType, effect, victoryPoints) {
        super(id, name, description);
        this.type = 'equipment';
        this.equipmentType = equipmentType; // Тип снаряжения
        this.effect = effect; // Эффект снаряжения
        this.victoryPoints = victoryPoints; // Победные очки
    }

    /**
     * Активировать карту снаряжения
     * @param {Player} player - Игрок, использующий карту
     * @param {GameState} gameState - Текущее состояние игры
     * @returns {Object} - Результат применения снаряжения
     */
    activate(player, gameState) {
        // Логика применения снаряжения
        return { 
            success: true, 
            message: `Снаряжение: ${this.name}`, 
            action: 'equip',
            equipmentType: this.equipmentType,
            effect: this.effect,
            victoryPoints: this.victoryPoints
        };
    }
}

/**
 * Карта персонажа
 */
export class CharacterCard extends Card {
    constructor(id, name, description, ability, victoryPoints) {
        super(id, name, description);
        this.type = 'character';
        this.ability = ability; // Способность персонажа
        this.victoryPoints = victoryPoints; // Победные очки
    }

    /**
     * Активировать карту персонажа
     * @param {Player} player - Игрок, использующий карту
     * @param {GameState} gameState - Текущее состояние игры
     * @param {Object} target - Цель для применения способности персонажа
     * @returns {Object} - Результат применения способности персонажа
     */
    activate(player, gameState, target) {
        // Логика применения способности персонажа
        return { 
            success: true, 
            message: `Персонаж: ${this.name}`, 
            action: 'character_ability',
            ability: this.ability,
            victoryPoints: this.victoryPoints,
            target: target ? target.id : null
        };
    }
} 