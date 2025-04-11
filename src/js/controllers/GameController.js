import { Player } from '../models/Player.js';
import { DialogManager } from '../utils/DialogManager.js';

/**
 * Контроллер игры, управляющий игровым процессом и взаимодействием с пользователем
 */
export class GameController {
    constructor(gameState, gameBoardView, playersInfoView, playerHandView) {
        this.gameState = gameState;
        this.gameBoardView = gameBoardView;
        this.playersInfoView = playersInfoView;
        this.playerHandView = playerHandView;
        
        this.selectedCard = null; // Выбранная игроком карта
        this.moveInProgress = false; // Флаг, указывающий на то, что перемещение в процессе
        
        // Создаем менеджер диалогов
        this.dialogManager = new DialogManager();
        
        // Инициализация обработчиков событий
        this.initEventListeners();
    }

    /**
     * Инициализация обработчиков событий
     */
    initEventListeners() {
        // Обработчик клика по клетке игрового поля
        const gameBoardElement = this.gameBoardView.containerElement;
        gameBoardElement.addEventListener('cellClick', (event) => {
            const cell = event.detail.cell;
            this.onCellClick(cell);
        });
        
        // Обработчик клика по карте в руке
        const handElement = this.playerHandView.containerElement;
        handElement.addEventListener('cardClick', (event) => {
            const card = event.detail.card;
            this.onCardClick(card);
        });
        
        // Обработчик нажатия на кнопку "Завершить ход"
        const endTurnButton = document.getElementById('end-turn-btn');
        endTurnButton.addEventListener('click', () => {
            this.endTurn();
        });
        
        // Обработчик нажатия на кнопку "Отменить действие"
        const undoButton = document.getElementById('undo-btn');
        undoButton.addEventListener('click', () => {
            this.undoAction();
        });
    }

    /**
     * Запустить игру
     */
    startGame() {
        // Создаем игроков
        const players = [
            new Player(1, 'Игрок 1', '#ff0000'),
            new Player(2, 'Игрок 2', '#0000ff'),
            new Player(3, 'Игрок 3', '#00ff00')
        ];
        
        // Инициализируем игру
        this.gameState.initGame(players);
        
        // Показываем приветственное сообщение
        this.dialogManager.showMessage(
            'Добро пожаловать в Mad Max',
            'Постапокалиптический мир ждет вас. Собирайте ресурсы, исследуйте пустоши и сражайтесь за выживание!'
        );
    }

    /**
     * Обработчик клика по клетке игрового поля
     * @param {Cell} cell - Клетка, по которой был клик
     */
    onCellClick(cell) {
        // Если выбрана карта перемещения и клик по перекрестку
        if (this.selectedCard && this.selectedCard.type === 'move' && cell.type === 'crossroad') {
            this.handleMove(cell);
            return;
        }
        
        // Если выбрана карта атаки или дипломатии и клик по клетке с игроком
        if (this.selectedCard && (this.selectedCard.type === 'attack' || this.selectedCard.type === 'diplomacy')) {
            this.handleTargetSelection(cell);
            return;
        }
        
        // Если клик по точке интереса и игрок находится на этой клетке
        if (cell.type === 'point-of-interest') {
            const currentPlayer = this.gameState.getCurrentPlayer();
            if (currentPlayer.position && currentPlayer.position.id === cell.id) {
                this.handlePointOfInterest(cell);
                return;
            }
        }
        
        // Если клик по слоту с картой
        if (cell.type === 'card-slot') {
            this.handleCardSlot(cell);
            return;
        }
    }

    /**
     * Обработчик клика по карте в руке
     * @param {Card} card - Карта, по которой был клик
     */
    onCardClick(card) {
        // Если уже есть выбранная карта, снимаем выбор
        if (this.selectedCard) {
            // Отменяем подсветку доступных ходов
            this.gameBoardView.highlightAvailableMoves(this.gameState.getCurrentPlayer());
            this.selectedCard = null;
        }
        
        // Выбираем новую карту
        this.selectedCard = card;
        
        // Если это карта перемещения, подсвечиваем доступные ходы
        if (card.type === 'move') {
            this.moveInProgress = true;
            this.gameBoardView.highlightAvailableMoves(this.gameState.getCurrentPlayer());
            
            // Показываем подсказку игроку
            this.dialogManager.showMessage(
                'Перемещение',
                'Выберите перекресток, на который хотите переместиться.'
            );
            return;
        }
        
        // Если это карта, которую можно экипировать
        if (card.type === 'equipment' || card.type === 'character') {
            this.handleEquip(card);
            return;
        }
        
        // Если это карта отдыха
        if (card.type === 'rest') {
            this.handleRest(card);
            return;
        }
        
        // Если это карта атаки или дипломатии
        if (card.type === 'attack' || card.type === 'diplomacy') {
            // Показываем подсказку игроку
            this.dialogManager.showMessage(
                card.type === 'attack' ? 'Атака' : 'Дипломатия',
                'Выберите игрока, на которого хотите воздействовать.'
            );
            return;
        }
    }

    /**
     * Обработка перемещения игрока
     * @param {Cell} targetCell - Целевая клетка для перемещения
     */
    handleMove(targetCell) {
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        // Проверяем, может ли игрок переместиться на эту клетку
        if (currentPlayer.canMoveTo(targetCell)) {
            // Используем карту перемещения
            const result = this.gameState.useCard(currentPlayer, this.selectedCard);
            
            if (result.success) {
                // Перемещаем игрока
                this.gameState.movePlayer(currentPlayer, targetCell);
                
                // Отменяем выбор карты и подсветку
                this.selectedCard = null;
                this.moveInProgress = false;
                this.gameBoardView.highlightAvailableMoves(currentPlayer);
                
                // Проверяем, не находится ли игрок на точке интереса
                if (targetCell.type === 'point-of-interest') {
                    // Показываем сообщение о точке интереса
                    this.dialogManager.showMessage(
                        'Точка интереса',
                        `Вы обнаружили точку интереса: ${this.getPointOfInterestName(targetCell)}. Нажмите на клетку, чтобы активировать.`
                    );
                }
            }
        } else {
            // Показываем сообщение о невозможности перемещения
            this.dialogManager.showMessage(
                'Невозможно переместиться',
                'Выбранная клетка недоступна для перемещения. Выберите соседний перекресток.'
            );
        }
    }

    /**
     * Обработка выбора цели для карты атаки или дипломатии
     * @param {Cell} cell - Клетка, по которой был клик
     */
    handleTargetSelection(cell) {
        // Находим игрока, который находится на этой клетке
        const targetPlayer = this.gameState.players.find(p => p.position && p.position.id === cell.id);
        
        if (targetPlayer) {
            const currentPlayer = this.gameState.getCurrentPlayer();
            
            // Если игрок пытается атаковать себя
            if (targetPlayer.id === currentPlayer.id) {
                this.dialogManager.showMessage(
                    'Ошибка',
                    'Вы не можете выбрать себя целью.'
                );
                return;
            }
            
            // Сохраняем тип карты перед тем, как использовать ее
            const cardType = this.selectedCard.type;
            
            // Используем карту с указанной целью
            const result = this.gameState.useCard(currentPlayer, this.selectedCard, targetPlayer);
            
            if (result.success) {
                // Отменяем выбор карты
                this.selectedCard = null;
                
                // Обновляем информацию об игроках
                this.playersInfoView.updatePlayerInfo(currentPlayer);
                this.playersInfoView.updatePlayerInfo(targetPlayer);
                
                // Показываем сообщение о результате
                if (cardType === 'attack') {
                    this.dialogManager.showMessage(
                        'Атака успешна',
                        `Вы нанесли ${result.power} урона игроку ${targetPlayer.name}.`
                    );
                } else {
                    this.dialogManager.showMessage(
                        'Дипломатия успешна',
                        `Вы улучшили отношения с игроком ${targetPlayer.name}.`
                    );
                }
            }
        } else {
            // Показываем сообщение об ошибке
            this.dialogManager.showMessage(
                'Ошибка',
                'На выбранной клетке нет игрока. Выберите клетку с игроком.'
            );
        }
    }

    /**
     * Обработка активации точки интереса
     * @param {Cell} cell - Клетка точки интереса
     */
    handlePointOfInterest(cell) {
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        // Проверяем, находится ли игрок на этой точке интереса
        if (currentPlayer.position && currentPlayer.position.id === cell.id) {
            // Активируем эффект точки интереса
            const result = this.gameState.activatePointOfInterest(currentPlayer, cell);
            
            // Обработка результата активации
            this.processPointOfInterestEffect(result, currentPlayer, cell);
        }
    }

    /**
     * Обработка результата активации точки интереса
     * @param {Object} result - Результат активации
     * @param {Player} player - Игрок, активировавший точку интереса
     * @param {PointOfInterestCell} cell - Клетка точки интереса
     */
    processPointOfInterestEffect(result, player, cell) {
        if (!result) return;
        
        const poiName = this.getPointOfInterestName(cell);
        
        switch (result.type) {
            case 'move':
                // Дополнительное перемещение
                this.dialogManager.showMessage(
                    'Нитро активировано',
                    `Вы можете сделать дополнительное перемещение на ${result.count} шагов.`,
                    () => {
                        // После закрытия диалога подсвечиваем доступные ходы
                        const moveCard = player.hand.find(card => card.type === 'move');
                        if (moveCard) {
                            this.selectedCard = moveCard;
                            this.moveInProgress = true;
                            this.gameBoardView.highlightAvailableMoves(player);
                        }
                    }
                );
                break;
                
            case 'remove_card':
                // Удаление карты из колоды
                this.dialogManager.showMessage(
                    'Свалка активирована',
                    'Вы можете удалить одну карту из вашей колоды. Выберите карту для удаления.',
                    () => {
                        // Здесь будет реализована логика выбора карты для удаления
                        // В прототипе просто удаляем случайную карту из сброса, если он не пуст
                        if (player.discard.length > 0) {
                            const randomIndex = Math.floor(Math.random() * player.discard.length);
                            player.discard.splice(randomIndex, 1);
                            this.playerHandView.render();
                        }
                    }
                );
                break;
                
            case 'exchange_card':
                // Обмен карты
                this.dialogManager.showMessage(
                    'Торговец активирован',
                    'Вы можете обменять карту из руки на карту из игровой колоды.',
                    () => {
                        // Здесь будет реализована логика обмена карт
                        // В прототипе просто добавляем новую карту в руку
                        const newCard = this.gameState.drawCardFromGameDeck();
                        if (newCard) {
                            player.hand.push(newCard);
                            this.playerHandView.render();
                        }
                    }
                );
                break;
                
            case 'victory_points':
                // Получение победных очков
                const points = Math.floor(Math.random() * 3) + 1; // 1-3 случайных очка
                player.addVictoryPoints(points);
                this.playersInfoView.updatePlayerInfo(player);
                
                this.dialogManager.showMessage(
                    'Смертельная Гонка завершена',
                    `Вы участвовали в Смертельной Гонке и заработали ${points} победных очков!`
                );
                break;
                
            case 'remove_injury':
                // Удаление ранения
                if (player.injuries.length > 0) {
                    const injury = player.injuries[0];
                    player.healInjury(injury);
                    this.playersInfoView.updatePlayerInfo(player);
                    
                    this.dialogManager.showMessage(
                        'Док активирован',
                        'Вы вылечили одно ранение.'
                    );
                } else {
                    this.dialogManager.showMessage(
                        'Док активирован',
                        'У вас нет ранений, которые можно вылечить.'
                    );
                }
                break;
                
            case 'block_movement':
                // Блокировка движения (Завал)
                this.dialogManager.showMessage(
                    'Завал обнаружен',
                    'Этот участок пути заблокирован. Движение через него невозможно.'
                );
                break;
                
            case 'gain_attack_card':
                // Получение карты атаки
                this.dialogManager.showMessage(
                    'Полигон активирован',
                    'Вы получили новую карту атаки!',
                    () => {
                        // Здесь будет реализовано получение карты атаки
                        // В прототипе просто добавляем новую карту атаки
                        const attackCard = this.gameState.createAttackCard(player);
                        player.addCardToDeck(attackCard);
                        player.shuffleDeck();
                        this.playerHandView.render();
                    }
                );
                break;
                
            case 'upgrade_card':
                // Улучшение карты
                this.dialogManager.showMessage(
                    'Лаборатория активирована',
                    'Вы можете улучшить одну карту из руки.',
                    () => {
                        // Здесь будет реализована логика улучшения карты
                        // В прототипе просто показываем сообщение
                        this.dialogManager.showMessage(
                            'Улучшение',
                            'Функция улучшения карт будет доступна в полной версии игры.'
                        );
                    }
                );
                break;
                
            case 'gain_armor_or_heal':
                // Получение брони или лечение
                this.dialogManager.showMessage(
                    'Бункер активирован',
                    'Вы можете получить карту брони или вылечить ранение. Выберите действие.',
                    () => {
                        // Здесь будет реализован выбор между броней и лечением
                        // В прототипе просто лечим ранение, если оно есть
                        if (player.injuries.length > 0) {
                            const injury = player.injuries[0];
                            player.healInjury(injury);
                            this.playersInfoView.updatePlayerInfo(player);
                            
                            this.dialogManager.showMessage(
                                'Лечение',
                                'Вы вылечили одно ранение.'
                            );
                        }
                    }
                );
                break;
                
            case 'mutation_and_injury':
                // Мутация и ранение
                this.dialogManager.showMessage(
                    'Радиоактивная Зона активирована',
                    'Вы получили мутацию, дающую новую способность, но также получили ранение.',
                    () => {
                        // В прототипе просто добавляем ранение
                        const injury = { id: Date.now(), type: 'radiation', effect: '-1 к всем действиям' };
                        player.addInjury(injury);
                        this.playersInfoView.updatePlayerInfo(player);
                    }
                );
                break;
                
            case 'recover_discard':
                // Восстановление карт из сброса
                this.dialogManager.showMessage(
                    'Оазис активирован',
                    'Все карты из вашего сброса возвращаются в колоду.',
                    () => {
                        // Восстанавливаем карты из сброса
                        while (player.discard.length > 0) {
                            const card = player.discard.pop();
                            player.deck.push(card);
                        }
                        player.shuffleDeck();
                        this.playerHandView.render();
                    }
                );
                break;
                
            default:
                this.dialogManager.showMessage(
                    'Точка интереса',
                    `Вы активировали: ${poiName}`
                );
                break;
        }
    }

    /**
     * Получить название точки интереса по ее типу
     * @param {PointOfInterestCell} cell - Клетка точки интереса
     * @returns {string} - Название точки интереса
     */
    getPointOfInterestName(cell) {
        const typeToName = {
            'nitro': 'Нитро',
            'junkyard': 'Свалка',
            'trader': 'Торговец',
            'death_race': 'Смертельная Гонка',
            'doc': 'Док',
            'barricade': 'Завал',
            'polygon': 'Полигон',
            'laboratory': 'Лаборатория',
            'bunker': 'Бункер',
            'radiation_zone': 'Радиоактивная Зона',
            'oasis': 'Оазис'
        };
        
        return typeToName[cell.effectType] || 'Неизвестная точка интереса';
    }

    /**
     * Обработка взаимодействия со слотом карты
     * @param {Cell} cell - Клетка слота карты
     */
    handleCardSlot(cell) {
        // Проверка, есть ли карта в слоте
        if (cell.hasCard()) {
            const card = cell.card;
            
            this.dialogManager.showMessage(
                'Карта в слоте',
                `В этом слоте находится карта: ${card.name}. Вы можете получить ее, если выполните условия.`
            );
        } else {
            this.dialogManager.showMessage(
                'Пустой слот',
                'В этом слоте нет карты.'
            );
        }
    }

    /**
     * Обработка экипировки карты
     * @param {Card} card - Карта для экипировки
     */
    handleEquip(card) {
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        // Экипируем карту
        const success = currentPlayer.equipCard(card);
        
        if (success) {
            // Отменяем выбор карты
            this.selectedCard = null;
            
            // Обновляем руку игрока
            this.playerHandView.render();
            
            // Обновляем информацию об игроке
            this.playersInfoView.updatePlayerInfo(currentPlayer);
            
            // Показываем сообщение об успешной экипировке
            this.dialogManager.showMessage(
                'Экипировка',
                `Вы успешно экипировали карту: ${card.name}.`
            );
        }
    }

    /**
     * Обработка использования карты отдыха
     * @param {Card} card - Карта отдыха
     */
    handleRest(card) {
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        // Используем карту отдыха
        const result = this.gameState.useCard(currentPlayer, card);
        
        if (result.success) {
            // Отменяем выбор карты
            this.selectedCard = null;
            
            // Обновляем информацию об игроке
            this.playersInfoView.updatePlayerInfo(currentPlayer);
            
            // Если у игрока есть ранения, лечим одно
            if (currentPlayer.injuries.length > 0) {
                const injury = currentPlayer.injuries[0];
                currentPlayer.healInjury(injury);
                
                this.dialogManager.showMessage(
                    'Отдых',
                    'Вы отдохнули и вылечили одно ранение.'
                );
            } else {
                this.dialogManager.showMessage(
                    'Отдых',
                    'Вы отдохнули и восстановили силы.'
                );
            }
        }
    }

    /**
     * Завершить текущий ход
     */
    endTurn() {
        // Если выбрана карта, отменяем выбор
        if (this.selectedCard) {
            this.selectedCard = null;
            this.moveInProgress = false;
            this.gameBoardView.highlightAvailableMoves(this.gameState.getCurrentPlayer());
        }
        
        // Переходим к следующему игроку
        const nextPlayer = this.gameState.nextPlayer();
        
        // Перерисовываем руку нового текущего игрока
        this.playerHandView.render();
        
        // Показываем сообщение о смене игрока
        this.dialogManager.showMessage(
            'Смена хода',
            `Теперь ход игрока: ${nextPlayer.name}`
        );
        
        // Проверяем условия окончания игры
        if (this.gameState.checkGameOver()) {
            this.handleGameOver();
        }
    }

    /**
     * Отменить последнее действие
     */
    undoAction() {
        // Если выбрана карта, отменяем выбор
        if (this.selectedCard) {
            this.selectedCard = null;
            this.moveInProgress = false;
            this.gameBoardView.highlightAvailableMoves(this.gameState.getCurrentPlayer());
            
            this.dialogManager.showMessage(
                'Отмена',
                'Выбор карты отменен.'
            );
        } else {
            this.dialogManager.showMessage(
                'Отмена',
                'Нечего отменять.'
            );
        }
    }

    /**
     * Обработка окончания игры
     */
    handleGameOver() {
        const winner = this.gameState.players.reduce((prev, current) => 
            (prev.victoryPoints > current.victoryPoints) ? prev : current
        );
        
        this.dialogManager.showMessage(
            'Игра окончена!',
            `Победитель: ${winner.name} с ${winner.victoryPoints} победными очками!`
        );
    }
} 