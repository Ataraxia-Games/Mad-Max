import { Cell, CrossroadCell, CardSlotCell, PointOfInterestCell } from './Cell.js';
import { MoveCard, AttackCard, DiplomacyCard, RestCard, EquipmentCard, CharacterCard, EventCard } from './Card.js';

/**
 * Класс состояния игры - основной класс для управления игровым процессом
 */
export class GameState {
    constructor() {
        this.players = []; // Список игроков
        this.currentPlayerIndex = 0; // Индекс текущего игрока
        this.gameBoard = []; // Игровое поле (двумерный массив клеток)
        this.gameCards = []; // Колода игровых карт
        this.cardSlots = []; // Слоты для карт на поле
        this.crossroads = []; // Список перекрестков
        this.pointsOfInterest = []; // Список точек интереса
        this.gameOver = false; // Флаг окончания игры
        this.listeners = {}; // Слушатели событий
        
        // Создаем игровую колоду
        this.createGameDeck();
    }

    /**
     * Инициализировать игру
     * @param {Array} playerData - Информация об игроках
     */
    initGame(playerData) {
        // Создание игроков
        this.createPlayers(playerData);
        
        // Создание игрового поля
        this.createGameBoard();
        
        // Создание и настройка перекрестков
        this.setupCrossroads();
        
        // Создание и настройка слотов для карт
        this.setupCardSlots();
        
        // Создание и настройка точек интереса
        this.setupPointsOfInterest();
        
        // Инициализация стартовых колод игроков
        this.initPlayerDecks();
        
        // Размещение игроков на начальных позициях
        this.placePlayersAtStartPositions();
        
        // Размещение карт в слотах
        this.placeCardsInSlots();
        
        // Выбор первого игрока случайным образом
        this.selectFirstPlayer();
        
        // Раздача начальных карт
        this.dealInitialCards();
        
        // Уведомляем об изменении состояния
        this.notifyListeners('gameStateChanged');
    }

    /**
     * Создать игроков
     * @param {Array} playerData - Информация об игроках
     */
    createPlayers(playerData) {
        this.players = playerData;
    }

    /**
     * Создать игровое поле
     */
    createGameBoard() {
        // Создаем двумерный массив клеток 7x7
        this.gameBoard = [];
        let cellId = 1;
        
        for (let row = 0; row < 7; row++) {
            const rowCells = [];
            
            for (let col = 0; col < 7; col++) {
                // Создаем клетку с уникальным ID
                const cell = new Cell(cellId, row, col);
                rowCells.push(cell);
                cellId++;
            }
            
            this.gameBoard.push(rowCells);
        }
    }

    /**
     * Настроить перекрестки на поле
     */
    setupCrossroads() {
        // Координаты перекрестков
        const crossroadCoords = [
            [0, 0], [0, 2], [0, 4], [0, 6],
            [2, 0], [2, 2], [2, 4], [2, 6],
            [4, 0], [4, 2], [4, 4], [4, 6],
            [6, 0], [6, 2], [6, 4], [6, 6]
        ];
        
        // Создаем перекрестки
        for (const [row, col] of crossroadCoords) {
            const cell = this.gameBoard[row][col];
            const id = cell.id;
            
            // Заменяем обычную клетку на перекресток
            const crossroad = new CrossroadCell(id, row, col);
            this.gameBoard[row][col] = crossroad;
            this.crossroads.push(crossroad);
        }
        
        // Устанавливаем связи между перекрестками
        // Горизонтальные связи
        for (let row of [0, 2, 4, 6]) {
            for (let col = 0; col < 6; col += 2) {
                const crossroad1 = this.gameBoard[row][col];
                const crossroad2 = this.gameBoard[row][col + 2];
                
                // Связываем перекрестки в обоих направлениях
                crossroad1.addConnection(crossroad2);
                crossroad2.addConnection(crossroad1);
            }
        }
        
        // Вертикальные связи
        for (let col of [0, 2, 4, 6]) {
            for (let row = 0; row < 6; row += 2) {
                const crossroad1 = this.gameBoard[row][col];
                const crossroad2 = this.gameBoard[row + 2][col];
                
                // Связываем перекрестки в обоих направлениях
                crossroad1.addConnection(crossroad2);
                crossroad2.addConnection(crossroad1);
            }
        }
    }

    /**
     * Настроить слоты для карт на поле
     */
    setupCardSlots() {
        // Координаты слотов для карт
        const cardSlotCoords = [
            [1, 1], [1, 3], [1, 5],
            [3, 1], [3, 3], [3, 5],
            [5, 1], [5, 3], [5, 5]
        ];
        
        // Создаем слоты для карт
        for (const [row, col] of cardSlotCoords) {
            const cell = this.gameBoard[row][col];
            const id = cell.id;
            
            // Заменяем обычную клетку на слот для карты
            const cardSlot = new CardSlotCell(id, row, col);
            this.gameBoard[row][col] = cardSlot;
            this.cardSlots.push(cardSlot);
        }
    }

    /**
     * Настроить точки интереса на поле
     */
    setupPointsOfInterest() {
        // Список возможных типов точек интереса
        const poiTypes = [
            'nitro', 'junkyard', 'trader', 'death_race', 'doc',
            'barricade', 'polygon', 'laboratory', 'bunker', 'radiation_zone', 'oasis'
        ];
        
        // Количество точек интереса для размещения
        const poiCount = 8; // Можно настроить по желанию
        
        // Выбираем случайные типы точек интереса
        const selectedTypes = [];
        for (let i = 0; i < poiCount; i++) {
            const randomIndex = Math.floor(Math.random() * poiTypes.length);
            selectedTypes.push(poiTypes.splice(randomIndex, 1)[0]);
        }
        
        // Находим все клетки, которые не являются перекрестками или слотами для карт
        const availableCells = [];
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = this.gameBoard[row][col];
                if (cell.type === 'regular') {
                    availableCells.push({ row, col });
                }
            }
        }
        
        // Случайно выбираем клетки для точек интереса
        for (let i = 0; i < poiCount; i++) {
            if (availableCells.length === 0 || i >= selectedTypes.length) {
                break;
            }
            
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            const { row, col } = availableCells.splice(randomIndex, 1)[0];
            
            const cell = this.gameBoard[row][col];
            const id = cell.id;
            
            // Заменяем обычную клетку на точку интереса
            const poi = new PointOfInterestCell(id, row, col, selectedTypes[i]);
            this.gameBoard[row][col] = poi;
            this.pointsOfInterest.push(poi);
        }
    }

    /**
     * Создать игровую колоду
     */
    createGameDeck() {
        // Создаем колоду игровых карт
        // Снаряжение
        this.gameCards.push(
            new EquipmentCard('eq_1', 'Броня', 'Защита от одной атаки', 'armor', 'Защита от атаки', 1),
            new EquipmentCard('eq_2', 'Оружие', '+1 к силе атаки', 'weapon', '+1 к атаке', 1),
            new EquipmentCard('eq_3', 'Топливо', 'Дополнительное перемещение', 'fuel', '+1 к перемещению', 1),
            new EquipmentCard('eq_4', 'Редкий Модуль', 'Специальная способность', 'module', 'Особый эффект', 2)
        );
        
        // Персонажи
        this.gameCards.push(
            new CharacterCard('char_1', 'Механик', 'Ремонт снаряжения', 'repair', 1),
            new CharacterCard('char_2', 'Разведчик', 'Просмотр верхней карты колоды', 'scout', 1),
            new CharacterCard('char_3', 'Вожак', 'Усиление одного союзника', 'leader', 2),
            new CharacterCard('char_4', 'Легендарный Воин', 'Атака с силой 3', 'warrior', 3)
        );
        
        // События
        this.gameCards.push(
            new EventCard('event_1', 'Песчаная Буря', 'Блокировка перемещения', 'sandstorm', 'block_movement'),
            new EventCard('event_2', 'Набег Мародеров', 'Кража случайной карты', 'raid', 'steal_card'),
            new EventCard('event_3', 'Торговый Караван', 'Дополнительная карта', 'caravan', 'draw_card'),
            new EventCard('event_4', 'Восстание', 'Смена позиций игроков', 'uprising', 'swap_positions')
        );
        
        // Перемешиваем колоду
        this.shuffleGameDeck();
    }

    /**
     * Перемешать игровую колоду
     */
    shuffleGameDeck() {
        for (let i = this.gameCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameCards[i], this.gameCards[j]] = [this.gameCards[j], this.gameCards[i]];
        }
    }

    /**
     * Размещение карт в слотах
     */
    placeCardsInSlots() {
        // Размещаем карты из игровой колоды в слоты
        for (const slot of this.cardSlots) {
            if (this.gameCards.length > 0) {
                const card = this.gameCards.pop();
                slot.placeCard(card);
            }
        }
    }

    /**
     * Взять карту из игровой колоды
     * @returns {Card|null} - Взятая карта или null, если колода пуста
     */
    drawCardFromGameDeck() {
        if (this.gameCards.length === 0) {
            return null;
        }
        
        return this.gameCards.pop();
    }

    /**
     * Создать карту атаки для игрока
     * @param {Player} player - Игрок, для которого создается карта
     * @returns {AttackCard} - Созданная карта атаки
     */
    createAttackCard(player) {
        return new AttackCard(
            `attack_polygon_${player.id}_${Date.now()}`,
            'Мощная Атака',
            'Атака с усиленным эффектом',
            2 // Увеличенная сила атаки
        );
    }

    /**
     * Инициализировать стартовые колоды игроков
     */
    initPlayerDecks() {
        // Для каждого игрока создаем стартовую колоду из 10 карт
        for (const player of this.players) {
            // 3 карты перемещения
            for (let i = 0; i < 3; i++) {
                const moveCard = new MoveCard(
                    `move_${player.id}_${i}`,
                    'Погнали!',
                    'Базовая карта перемещения',
                    1 // Количество шагов для перемещения
                );
                player.addCardToDeck(moveCard);
            }
            
            // 3 карты атаки
            for (let i = 0; i < 3; i++) {
                const attackCard = new AttackCard(
                    `attack_${player.id}_${i}`,
                    'Огонь!',
                    'Базовая карта атаки',
                    1 // Сила атаки
                );
                player.addCardToDeck(attackCard);
            }
            
            // 3 карты дипломатии
            for (let i = 0; i < 3; i++) {
                const diplomacyCard = new DiplomacyCard(
                    `diplomacy_${player.id}_${i}`,
                    'Переговоры',
                    'Базовая карта дипломатии',
                    1 // Сила дипломатии
                );
                player.addCardToDeck(diplomacyCard);
            }
            
            // 1 карта отдыха
            const restCard = new RestCard(
                `rest_${player.id}`,
                'Восстановление',
                'Базовая карта отдыха',
                1 // Количество восстанавливаемых ранений
            );
            player.addCardToDeck(restCard);
            
            // Перемешиваем колоду
            player.shuffleDeck();
        }
    }

    /**
     * Разместить игроков на начальных позициях
     */
    placePlayersAtStartPositions() {
        // Начальные позиции (перекрестки в углах поля)
        const startPositions = [
            this.gameBoard[0][0], // Левый верхний угол
            this.gameBoard[0][6], // Правый верхний угол
            this.gameBoard[6][0]  // Левый нижний угол
        ];
        
        // Размещаем игроков на начальных позициях
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const position = startPositions[i % startPositions.length];
            player.setPosition(position);
        }
    }

    /**
     * Выбрать первого игрока случайным образом
     */
    selectFirstPlayer() {
        this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
    }

    /**
     * Раздать начальные карты игрокам
     */
    dealInitialCards() {
        // Каждый игрок получает по 5 карт
        for (const player of this.players) {
            for (let i = 0; i < 5; i++) {
                player.drawCard();
            }
        }
    }

    /**
     * Получить текущего игрока
     * @returns {Player} - Текущий игрок
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Перейти к следующему игроку
     * @returns {Player} - Следующий игрок
     */
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        // Уведомляем об изменении текущего игрока
        this.notifyListeners('currentPlayerChanged');
        
        return this.getCurrentPlayer();
    }

    /**
     * Переместить игрока на указанную клетку
     * @param {Player} player - Игрок для перемещения
     * @param {Cell} targetCell - Целевая клетка
     * @returns {boolean} - true, если перемещение успешно
     */
    movePlayer(player, targetCell) {
        if (!player.canMoveTo(targetCell)) {
            return false;
        }
        
        player.setPosition(targetCell);
        
        // Уведомляем о перемещении игрока
        this.notifyListeners('playerMoved', { player, targetCell });
        
        return true;
    }

    /**
     * Использовать карту
     * @param {Player} player - Игрок, использующий карту
     * @param {Card} card - Карта для использования
     * @param {Object} target - Цель для карты (если требуется)
     * @returns {Object} - Результат использования карты
     */
    useCard(player, card, target) {
        const result = player.useCard(card, this, target);
        
        if (result.success) {
            // Обрабатываем действие карты в зависимости от типа
            switch (result.action) {
                case 'move':
                    // В этом случае нам нужна дополнительная логика для выбора цели перемещения
                    // Эта логика будет реализована в контроллере
                    break;
                case 'attack':
                    // Обработка атаки
                    break;
                case 'diplomacy':
                    // Обработка дипломатии
                    break;
                case 'heal':
                    // Обработка лечения
                    break;
                case 'event':
                    // Обработка события
                    break;
                case 'equip':
                    // Экипировка карты
                    player.equipCard(card);
                    break;
                case 'character_ability':
                    // Использование способности персонажа
                    break;
            }
            
            // Уведомляем об использовании карты
            this.notifyListeners('cardUsed', { player, card, result });
        }
        
        return result;
    }

    /**
     * Проверить условия окончания игры
     * @returns {boolean} - true, если игра окончена
     */
    checkGameOver() {
        // Проверяем условия окончания игры
        // Например, если игрок набрал определенное количество победных очков
        const victoryPointThreshold = 15; // Порог победных очков для окончания игры
        
        for (const player of this.players) {
            if (player.victoryPoints >= victoryPointThreshold) {
                this.gameOver = true;
                
                // Уведомляем об окончании игры
                this.notifyListeners('gameOver', { winner: player });
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * Активировать эффект точки интереса
     * @param {Player} player - Игрок, активирующий эффект
     * @param {PointOfInterestCell} poiCell - Клетка точки интереса
     * @returns {Object} - Результат активации эффекта
     */
    activatePointOfInterest(player, poiCell) {
        const result = poiCell.activateEffect(player);
        
        // Уведомляем об активации точки интереса
        this.notifyListeners('poiActivated', { player, poiCell, result });
        
        return result;
    }

    /**
     * Добавить слушателя событий
     * @param {string} eventType - Тип события
     * @param {Function} listener - Функция-слушатель
     */
    addEventListener(eventType, listener) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        
        this.listeners[eventType].push(listener);
    }

    /**
     * Удалить слушателя событий
     * @param {string} eventType - Тип события
     * @param {Function} listener - Функция-слушатель для удаления
     */
    removeEventListener(eventType, listener) {
        if (!this.listeners[eventType]) {
            return;
        }
        
        this.listeners[eventType] = this.listeners[eventType]
            .filter(l => l !== listener);
    }

    /**
     * Уведомить слушателей о событии
     * @param {string} eventType - Тип события
     * @param {Object} data - Данные события
     */
    notifyListeners(eventType, data = {}) {
        if (!this.listeners[eventType]) {
            return;
        }
        
        for (const listener of this.listeners[eventType]) {
            listener(data);
        }
    }
} 