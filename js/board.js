class Board {
    constructor() {
        this.boardElement = document.querySelector('.unified-grid');
        this.cardSlots = new Map();
        this.playerSlots = new Map();
        this.emojiPool = ['⛰️', '💧', '♠️', '🧨', '🚧', '🛢️', '🏹'];
        this.initializeBoard();
    }

    initialize() {
        this.createBoardStructure();
        this.renderBoard();
        
        // Добавляем эмодзи в пустые слоты
        const emptySlots = document.querySelectorAll('.card-slot:empty');
        emptySlots.forEach(slot => {
            const randomEmoji = Card.EMOJIS[Math.floor(Math.random() * Card.EMOJIS.length)];
            slot.setAttribute('data-emoji', randomEmoji);
        });
    }

    createBoardStructure() {
        if (!this.boardElement) {
            console.error('Board element not found');
            return;
        }

        // Создаем структуру для карт
        for (let i = 1; i <= 9; i++) {
            const slot = document.querySelector(`.card-slot[data-slot="${i}"]`);
            if (slot) {
                this.cardSlots.set(i, {
                    element: slot,
                    card: null
                });
            }
        }

        // Создаем структуру для игроков
        for (let i = 1; i <= 16; i++) {
            const slot = document.querySelector(`.player-slot[data-position="${i}"]`);
            if (slot) {
                this.playerSlots.set(i, {
                    element: slot,
                    player: null
                });
            }
        }
    }

    renderBoard() {
        // Очищаем все слоты
        const slots = this.boardElement.querySelectorAll('.card-slot, .player-slot');
        slots.forEach(slot => {
            if (slot.classList.contains('card-slot')) {
                slot.innerHTML = '';
                if (!slot.querySelector('.card')) {
                    // Если слот пустой, добавляем эмодзи
                    const randomEmoji = Card.EMOJIS[Math.floor(Math.random() * Card.EMOJIS.length)];
                    const emojiSpan = document.createElement('span');
                    emojiSpan.textContent = randomEmoji;
                    emojiSpan.className = 'slot-emoji';
                    slot.appendChild(emojiSpan);
                    slot.classList.add('empty');
                } else {
                    slot.className = 'card-slot';
                }
            } else {
                slot.className = 'player-slot';
                slot.removeAttribute('data-player-id');
            }
        });

        // Размещаем карты
        this.cardSlots.forEach((slotInfo, index) => {
            const slot = document.querySelector(`.card-slot[data-slot="${index}"]`);
            if (slot && slotInfo.card) {
                slot.innerHTML = '';
                slot.appendChild(slotInfo.card.createCardElement());
                slot.classList.remove('empty');
            }
        });

        // Размещаем игроков
        this.playerSlots.forEach((slotInfo, position) => {
            const slot = document.querySelector(`.player-slot[data-position="${position}"]`);
            if (slot) {
                slot.classList.add('occupied');
                slot.setAttribute('data-player-id', String(position));
            }
        });
    }

    placeCard(slotIndex, card) {
        if (slotIndex >= 1 && slotIndex <= 9) {
            const slot = document.querySelector(`.card-slot[data-slot="${slotIndex}"]`);
            if (slot) {
                this.cardSlots.set(slotIndex, {
                    element: slot,
                    card: card
                });
                this.renderBoard();
            } else {
                console.error(`Card slot ${slotIndex} not found`);
            }
        } else {
            console.error(`Invalid slot index: ${slotIndex}`);
        }
    }

    initializePlayerPosition(playerId, position) {
        this.playerSlots.set(position, {
            element: this.boardElement.querySelector(`[data-position="${position}"]`),
            player: playerId
        });
        this.renderBoard();
    }

    getPlayerPosition(playerId) {
        for (const [position, slotInfo] of this.playerSlots.entries()) {
            if (slotInfo.player === playerId) {
                return position;
            }
        }
        return null;
    }

    isPositionOccupied(position) {
        return this.playerSlots.has(position);
    }

    createBoard() {
        const board = document.createElement('div');
        board.className = 'unified-grid';
        
        // Создаем 7x7 сетку
        for (let i = 0; i < 49; i++) {
            const cell = document.createElement('div');
            
            // Определяем тип ячейки
            if (i === 0 || i === 6 || i === 42 || i === 48) {
                // Угловые ячейки - места для игроков
                cell.className = 'player-slot';
                cell.dataset.slotIndex = i;
            } else if (i % 8 === 0 || (i + 1) % 8 === 0) {
                // Промежуточные ячейки - места для карт
                cell.className = 'card-slot';
                cell.dataset.slotIndex = i;
                
                // Добавляем случайный эмодзи для пустых слотов
                const randomEmoji = Card.EMOJIS[Math.floor(Math.random() * Card.EMOJIS.length)];
                const emojiSpan = document.createElement('span');
                emojiSpan.textContent = randomEmoji;
                emojiSpan.className = 'slot-emoji';
                cell.appendChild(emojiSpan);
                cell.classList.add('empty');
            } else {
                // Пустые ячейки
                cell.className = 'spacer';
            }
            
            board.appendChild(cell);
        }
        
        return board;
    }

    createCellElement() {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        const spacer = document.createElement('div');
        spacer.className = 'spacer';
        spacer.textContent = '💀'; // Добавляем эмодзи черепа
        
        cell.appendChild(spacer);
        return cell;
    }

    initializeBoard() {
        const spacers = document.querySelectorAll('.spacer');
        const totalSpacers = spacers.length;
        const skullCount = 12;
        
        // Создаем массив индексов и перемешиваем его
        const indices = Array.from({length: totalSpacers}, (_, i) => i);
        for (let i = totalSpacers - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Оставляем только первые 12 индексов для эмодзи
        const emojiIndices = indices.slice(0, skullCount);
        
        // Устанавливаем случайные эмодзи из пула в выбранные ячейки
        spacers.forEach((spacer, index) => {
            if (emojiIndices.includes(index)) {
                const randomEmoji = this.emojiPool[Math.floor(Math.random() * this.emojiPool.length)];
                spacer.textContent = randomEmoji;
            } else {
                spacer.textContent = '';
            }
        });
    }
} 