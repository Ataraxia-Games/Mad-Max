class Card {
    constructor(id, name, type, rarity, cost, stats = {}) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.cost = cost;
        this.stats = stats;
        this.element = null;
    }

    createCardElement() {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.cardId = this.id;
        
        cardElement.innerHTML = `
            <div class="card-cost">${this.cost}</div>
            <div class="card-name">${this.name}</div>
            <div class="card-type">${this.type}</div>
            ${this.renderStats()}
        `;

        this.element = cardElement;
        return cardElement;
    }

    renderStats() {
        if (Object.keys(this.stats).length === 0) return '';
        
        return `
            <div class="card-stats">
                ${Object.entries(this.stats)
                    .map(([key, value]) => `<div>${key}: ${value}</div>`)
                    .join('')}
            </div>
        `;
    }

    canPlay(player) {
        return player.mana >= this.cost;
    }

    play(player, target) {
        if (!this.canPlay(player)) return false;
        
        player.mana -= this.cost;
        // Additional play logic will be implemented in specific card types
        return true;
    }
} 