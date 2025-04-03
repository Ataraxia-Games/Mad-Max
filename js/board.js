class Board {
    constructor() {
        this.cardSlots = new Array(8).fill(null);
        this.playerPositions = new Map();
        this.boardElement = document.getElementById('game-board');
    }

    initialize() {
        this.createBoardStructure();
        this.renderBoard();
    }

    createBoardStructure() {
        this.boardElement.innerHTML = `
            <div class="board-container">
                <div class="unified-grid">
                    <!-- Row 1 -->
                    <div class="player-slot" data-position="0"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="1"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="2"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="3"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="4"></div>

                    <!-- Row 2 -->
                    <div class="spacer"></div>
                    <div class="card-slot" data-slot="0"></div>
                    <div class="spacer"></div>
                    <div class="card-slot" data-slot="1"></div>
                    <div class="spacer"></div>
                    <div class="card-slot" data-slot="2"></div>
                    <div class="spacer"></div>
                    <div class="card-slot" data-slot="3"></div>
                    <div class="spacer"></div>

                    <!-- Row 3 -->
                    <div class="player-slot" data-position="5"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="6"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="7"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="8"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="9"></div>

                    <!-- Row 4 -->
                    <div class="spacer"></div>
                    <div class="card-slot" data-slot="4"></div>
                    <div class="spacer"></div>
                    <div class="card-slot" data-slot="5"></div>
                    <div class="spacer"></div>
                    <div class="card-slot" data-slot="6"></div>
                    <div class="spacer"></div>
                    <div class="card-slot" data-slot="7"></div>
                    <div class="spacer"></div>

                    <!-- Row 5 -->
                    <div class="player-slot" data-position="10"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="11"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="12"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="13"></div>
                    <div class="spacer"></div>
                    <div class="player-slot" data-position="14"></div>
                </div>
            </div>
        `;
    }

    renderBoard() {
        // Очищаем все слоты
        const slots = this.boardElement.querySelectorAll('.card-slot, .player-slot');
        slots.forEach(slot => {
            slot.innerHTML = '';
            if (slot.classList.contains('card-slot')) {
                slot.className = 'card-slot';
            } else {
                slot.className = 'player-slot';
                slot.removeAttribute('data-player-id');
            }
        });

        // Размещаем карты
        this.cardSlots.forEach((card, index) => {
            if (card) {
                const slot = this.boardElement.querySelector(`[data-slot="${index}"]`);
                if (slot) {
                    slot.appendChild(card.createCardElement());
                }
            }
        });

        // Размещаем игроков
        this.playerPositions.forEach((position, playerId) => {
            const slot = this.boardElement.querySelector(`[data-position="${position}"]`);
            if (slot) {
                slot.classList.add('occupied');
                slot.setAttribute('data-player-id', playerId);
            }
        });
    }

    placeCard(slotIndex, card) {
        if (slotIndex >= 0 && slotIndex < this.cardSlots.length) {
            this.cardSlots[slotIndex] = card;
            this.renderBoard();
        }
    }

    initializePlayerPosition(playerId, position) {
        this.playerPositions.set(playerId, position);
        this.renderBoard();
    }

    getPlayerPosition(playerId) {
        return this.playerPositions.get(playerId);
    }

    isPositionOccupied(position) {
        return Array.from(this.playerPositions.values()).includes(position);
    }
} 