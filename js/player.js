class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        this.position = null;
        this.score = 0;
        this.isReady = false;
        this.maxHealth = 30;
        this.health = this.maxHealth;
    }

    initializeStarterDeck() {
        // Создаем начальную колоду из 10 карт
        this.deck = [
            new Card(1, "Move!", "MOVE", "COMMON"),
            new Card(2, "Move!", "MOVE", "COMMON"),
            new Card(3, "Move!", "MOVE", "COMMON"),
            new Card(4, "Attack!", "ATTACK", "COMMON"),
            new Card(5, "Attack!", "ATTACK", "COMMON"),
            new Card(6, "Attack!", "ATTACK", "COMMON"),
            new Card(7, "Rest", "REST", "COMMON"),
            new Card(8, "Rest", "REST", "COMMON"),
            new Card(9, "Rest", "REST", "COMMON"),
            new Card(10, "Heal", "HEAL", "RARE")
        ];
        this.shuffleDeck();
        this.drawStartingHand();
    }

    drawStartingHand() {
        // Сбрасываем руку и колоду сброса в начале раунда
        this.discardHand();
        this.reshuffleDiscardIntoDeck();
        this.drawCards(5);
    }

    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length === 0) {
                this.reshuffleDiscardIntoDeck();
                if (this.deck.length === 0) {
                    break; // Если после перемешивания колода все еще пуста
                }
            }
            const card = this.deck.pop();
            this.hand.push(card);
        }
        this.updateUI();
    }

    reshuffleDiscardIntoDeck() {
        while (this.discardPile.length > 0) {
            this.deck.push(this.discardPile.pop());
        }
        this.shuffleDeck();
    }

    discardHand() {
        while (this.hand.length > 0) {
            const card = this.hand.pop();
            this.discardPile.push(card);
        }
        this.updateUI();
    }

    endTurn() {
        // Сбрасываем текущую руку
        this.discardHand();
        
        // Определяем, сколько карт нужно взять
        const cardsToDraw = 5;
        
        // Если в колоде недостаточно карт
        if (this.deck.length < cardsToDraw) {
            // Берем оставшиеся карты из колоды
            const remainingCards = this.deck.length;
            this.drawCards(remainingCards);
            
            // Перемешиваем сброс в колоду
            this.reshuffleDiscardIntoDeck();
            
            // Добираем оставшиеся карты
            this.drawCards(cardsToDraw - remainingCards);
        } else {
            // Если карт достаточно, просто берем 5
            this.drawCards(cardsToDraw);
        }
        
        // Сообщаем игре о завершении хода
        if (game) {
            game.onPlayerEndTurn(this);
        }
    }

    drawCard() {
        // Если колода пуста, перемешиваем сброс
        if (this.deck.length === 0 && this.discardPile.length > 0) {
            while (this.discardPile.length > 0) {
                this.deck.push(this.discardPile.pop());
            }
            this.shuffleDeck();
        }

        if (this.deck.length > 0) {
            const card = this.deck.pop();
            this.hand.push(card);
            this.updateUI();
            return card;
        }
        return null;
    }

    discardCard(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.hand.length) {
            const card = this.hand.splice(cardIndex, 1)[0];
            this.discardPile.push(card);
            this.updateUI();
            return card;
        }
        return null;
    }

    playCard(cardIndex, targetPosition) {
        if (cardIndex < 0 || cardIndex >= this.hand.length) return false;
        
        const card = this.hand[cardIndex];
        if (!card.canPlay(this)) return false;

        if (card.play(this, targetPosition)) {
            const playedCard = this.hand.splice(cardIndex, 1)[0];
            this.discardPile.push(playedCard);
            if (card.type === 'UNIT' || card.type === 'BUILDING') {
                this.field[targetPosition] = card;
            }
            this.updateUI();
            return true;
        }
        return false;
    }

    addCardToDeck(card) {
        this.deck.push(card);
        this.updateStats();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    setReady(ready) {
        this.isReady = ready;
        // Отправляем состояние готовности на сервер
        game.socket.emit('playerReady', { ready });
    }

    setStartPosition(position) {
        if (this.position === null) {
            this.position = position;
            // Отправляем позицию на сервер
            game.socket.emit('setStartPosition', { position });
            return true;
        }
        return false;
    }

    updateUI() {
        // Обновляем статистику игрока
        const statsElement = document.getElementById('player-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="player-name">${this.name}</div>
                <div class="player-health">Health: ${this.health}/${this.maxHealth}</div>
                <div class="player-score">Score: ${this.score}</div>
                <div class="deck-count">Deck: ${this.deck.length}</div>
                <div class="hand-count">Hand: ${this.hand.length}</div>
                <div class="discard-count">Discard: ${this.discardPile.length}</div>
                <div class="status">${this.isReady ? 'Ready' : 'Not Ready'}</div>
            `;
        }

        // Обновляем отображение колод и руки
        // Обновляем колоду
        const drawPile = document.querySelector('.draw-pile');
        if (drawPile) {
            drawPile.dataset.count = this.deck.length;
            drawPile.innerHTML = this.deck.length > 0 ? '<div class="card card-back"></div>' : '';
        }

        // Обновляем руку
        const handContainer = document.querySelector('.hand-container');
        if (handContainer) {
            handContainer.innerHTML = '';
            this.hand.forEach((card, index) => {
                const cardElement = card.createCardElement();
                cardElement.dataset.index = index;
                cardElement.classList.add('drawing');
                handContainer.appendChild(cardElement);
            });
        }

        // Обновляем сброс
        const discardPile = document.querySelector('.discard-pile');
        if (discardPile) {
            discardPile.dataset.count = this.discardPile.length;
            if (this.discardPile.length > 0) {
                const topCard = this.discardPile[this.discardPile.length - 1];
                discardPile.innerHTML = '';
                discardPile.appendChild(topCard.createCardElement());
            } else {
                discardPile.innerHTML = '';
            }
        }
    }

    calculateScore() {
        // Подсчет очков на основе захваченных карт
        this.score = this.deck.reduce((total, card) => {
            const rarityPoints = {
                'COMMON': 1,
                'RARE': 2,
                'EPIC': 3,
                'LEGENDARY': 5
            };
            return total + (rarityPoints[card.rarity] || 0);
        }, 0);
    }

    renderHand() {
        const handElement = document.getElementById(`${this.id}-hand`);
        if (handElement) {
            handElement.innerHTML = '';
            this.hand.forEach(card => {
                handElement.appendChild(card.createCardElement());
            });
        }
    }

    renderField() {
        const fieldElement = document.getElementById(`${this.id}-field`);
        if (fieldElement) {
            fieldElement.innerHTML = '';
            this.field.forEach((card, index) => {
                if (card) {
                    const cardElement = card.createCardElement();
                    cardElement.dataset.position = index;
                    fieldElement.appendChild(cardElement);
                } else {
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'field-slot';
                    emptySlot.dataset.position = index;
                    fieldElement.appendChild(emptySlot);
                }
            });
        }
    }

    getAvailableMoves() {
        return game.board.getAvailableMoves(this.position);
    }

    getAdjacentCards() {
        return game.board.getAdjacentCards(this.position);
    }
} 