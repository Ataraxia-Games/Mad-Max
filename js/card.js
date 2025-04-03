class Card {
    constructor(id, name, type, rarity, description = '') {
        this.id = id;
        this.name = name;
        this.type = type.toUpperCase(); // MOVE, ATTACK, REST, HEAL
        this.rarity = rarity.toUpperCase(); // COMMON, RARE
        this.description = description || this.getDefaultDescription();
        this.element = null;
    }

    getDefaultDescription() {
        switch (this.type) {
            case 'MOVE':
                return 'Передвиньтесь на соседнюю позицию';
            case 'ATTACK':
                return 'Атакуйте соседнюю карту или игрока';
            case 'REST':
                return 'Отдохните и восстановите силы';
            case 'HEAL':
                return 'Восстановите 2 единицы здоровья';
            default:
                return '';
        }
    }

    static createStarterDeck() {
        const deck = [
            // 3 карты Move
            new Card(1, "Move!", "MOVE", "COMMON"),
            new Card(2, "Move!", "MOVE", "COMMON"),
            new Card(3, "Move!", "MOVE", "COMMON"),
            // 3 карты Attack
            new Card(4, "Attack!", "ATTACK", "COMMON"),
            new Card(5, "Attack!", "ATTACK", "COMMON"),
            new Card(6, "Attack!", "ATTACK", "COMMON"),
            // 3 карты Rest
            new Card(7, "Rest", "REST", "COMMON"),
            new Card(8, "Rest", "REST", "COMMON"),
            new Card(9, "Rest", "REST", "COMMON"),
            // 1 карта Heal
            new Card(10, "Heal", "HEAL", "COMMON")
        ];
        return deck;
    }

    static createFieldDeck() {
        const cards = [];
        let id = 1;

        // Персонажи
        const characters = [
            { name: "Макс Рокатански", description: "Одинокий воин дорог", rarity: "RARE" },
            { name: "Фуриоса", description: "Бесстрашная воительница", rarity: "RARE" },
            { name: "Несмертный Джо", description: "Жестокий правитель Цитадели", rarity: "RARE" },
            { name: "Накс", description: "Преданный воин-камикадзе", rarity: "UNCOMMON" },
            { name: "Говорящий Пулемет", description: "Меткий стрелок из пустошей", rarity: "UNCOMMON" },
            { name: "Механик Мертвых", description: "Гениальный механик", rarity: "UNCOMMON" },
            { name: "Рейдер Пустыни", description: "Безжалостный охотник", rarity: "COMMON" },
            { name: "Мусорщик", description: "Искатель ценных ресурсов", rarity: "COMMON" }
        ];

        // События
        const events = [
            { name: "Война за Бензин", description: "Захватите топливный склад", rarity: "RARE" },
            { name: "Песчаная Буря", description: "Стихийное бедствие пустыни", rarity: "RARE" },
            { name: "Засада в Каньоне", description: "Внезапная атака рейдеров", rarity: "UNCOMMON" },
            { name: "Гонка Смерти", description: "Смертельная гонка за ресурсы", rarity: "UNCOMMON" },
            { name: "Торговый Караван", description: "Возможность обмена ресурсами", rarity: "COMMON" },
            { name: "Руины Старого Мира", description: "Поиск древних технологий", rarity: "COMMON" }
        ];

        // Локации
        const locations = [
            { name: "Цитадель", description: "Крепость с запасами воды", rarity: "RARE" },
            { name: "Газтаун", description: "Город-завод по производству топлива", rarity: "RARE" },
            { name: "Пуля-Ферма", description: "Производство боеприпасов", rarity: "UNCOMMON" },
            { name: "Убежище Механиков", description: "Мастерская выживших", rarity: "UNCOMMON" },
            { name: "Застава Разбойников", description: "Опорный пункт рейдеров", rarity: "COMMON" },
            { name: "Водяная Станция", description: "Источник чистой воды", rarity: "COMMON" }
        ];

        // Добавляем карты персонажей
        characters.forEach(char => {
            const count = char.rarity === 'RARE' ? 3 : (char.rarity === 'UNCOMMON' ? 4 : 5);
            for (let i = 0; i < count; i++) {
                cards.push(new Card(id++, char.name, 'ATTACK', char.rarity, char.description));
            }
        });

        // Добавляем карты событий
        events.forEach(event => {
            const count = event.rarity === 'RARE' ? 3 : (event.rarity === 'UNCOMMON' ? 4 : 5);
            for (let i = 0; i < count; i++) {
                cards.push(new Card(id++, event.name, 'MOVE', event.rarity, event.description));
            }
        });

        // Добавляем карты локаций
        locations.forEach(location => {
            const count = location.rarity === 'RARE' ? 3 : (location.rarity === 'UNCOMMON' ? 4 : 5);
            for (let i = 0; i < count; i++) {
                cards.push(new Card(id++, location.name, 'REST', location.rarity, location.description));
            }
        });

        // Перемешиваем колоду
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        return cards;
    }

    createCardElement() {
        const cardElement = document.createElement('div');
        cardElement.className = `card`;
        cardElement.dataset.type = this.type.toLowerCase();
        cardElement.dataset.rarity = this.rarity.toLowerCase();
        cardElement.dataset.cardId = this.id;
        
        cardElement.innerHTML = `
            <div class="card-name">${this.name}</div>
            <div class="card-type">${this.type}</div>
            <div class="card-description">${this.description}</div>
            <div class="card-rarity">${this.rarity}</div>
        `;

        this.element = cardElement;
        return cardElement;
    }

    canPlay(player) {
        // Проверяем, может ли карта быть сыграна
        switch (this.type) {
            case 'MOVE':
                return player.getAvailableMoves().length > 0;
            case 'ATTACK':
                return player.getAdjacentCards().length > 0;
            case 'REST':
                return player.deck.length > 0;
            case 'HEAL':
                return player.health < player.maxHealth;
            default:
                return false;
        }
    }

    play(player, target) {
        // Выполняем действие карты
        switch (this.type) {
            case 'MOVE':
                return game.board.movePlayer(player.id, target);
            case 'ATTACK':
                return game.board.captureCard(player.id, target);
            case 'REST':
                const card = player.drawCard();
                return card !== null;
            case 'HEAL':
                if (player.health < player.maxHealth) {
                    player.health += 2;
                    if (player.health > player.maxHealth) {
                        player.health = player.maxHealth;
                    }
                    return true;
                }
                return false;
            default:
                return false;
        }
    }
} 