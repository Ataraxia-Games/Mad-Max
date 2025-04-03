class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.deck = [];
        this.hand = [];
        this.field = [];
        this.mana = 0;
        this.maxMana = 0;
        this.health = 30;
    }

    drawCard() {
        if (this.deck.length === 0) return null;
        const card = this.deck.pop();
        this.hand.push(card);
        return card;
    }

    playCard(cardIndex, targetPosition) {
        if (cardIndex < 0 || cardIndex >= this.hand.length) return false;
        
        const card = this.hand[cardIndex];
        if (!card.canPlay(this)) return false;

        if (card.play(this, targetPosition)) {
            this.hand.splice(cardIndex, 1);
            if (card.type === 'UNIT' || card.type === 'BUILDING') {
                this.field[targetPosition] = card;
            }
            return true;
        }
        return false;
    }

    updateStats() {
        // Update UI with player stats
        const statsElement = document.getElementById(`${this.id}-stats`);
        if (statsElement) {
            statsElement.innerHTML = `
                <div>Health: ${this.health}</div>
                <div>Mana: ${this.mana}/${this.maxMana}</div>
                <div>Cards in hand: ${this.hand.length}</div>
                <div>Cards in deck: ${this.deck.length}</div>
            `;
        }
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
} 