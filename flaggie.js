/*
function buildGameField(width, height) {
    const table = document.getElementById('game-field');
    table.innerHTML = '';
    for (let i = 0; i < height; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < width; j++) {
            const cell = document.createElement('td');
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    window.player = new Player(width, height);
}

function setupEventListeners() {
    document.getElementById('build-button').addEventListener('click', () => {
        const width = document.getElementById('width-input').value;
        const height = document.getElementById('height-input').value;
        buildGameField(width, height);
    });
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                player.moveLeft();
                break;
            case 'ArrowRight':
                player.moveRight();
                break;
            case 'ArrowUp':
                player.moveUp();
                break;
            case 'ArrowDown':
                player.moveDown();
                break;
            case 'f':
                player.placeFlag();
                break;
            case 'd':
                player.removeFlag();
                break;
        }
    })
}

class Player {

    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.draw();
    }

    draw() {
        document.getElementsByClassName('player')[0]?.classList.remove('player');
        const table = document.getElementById('game-field');
        const cell = table.rows[this.y].cells[this.x];
        cell.classList.add('player');
    }

    moveLeft() {
        this.x -= 1;
        if (this.x < 0) {
            this.x = 0;
        }
        this.draw();
    }

    moveRight() {
        this.x += 1;
        if (this.x > this.width - 1) {
            this.x = this.width - 1;
        }
        this.draw();
    }

    moveUp() {
        this.y -= 1;
        if (this.y < 0) {
            this.y = 0;
        }
        this.draw();
    }

    moveDown() {
        this.y += 1;
        if (this.y > this.height - 1) {
            this.y = this.height - 1;
        }
        this.draw();
    }

    placeFlag() {
        const flag = new Flag(this.width, this.height);
        flag.place(this.x, this.y);
    }

    removeFlag() {
        const flag = new Flag(this.width, this.height);
        flag.remove(this.x, this.y);
    }

}

class Flag {
    static flags = ['flag-normal', 'flag-hard', 'flag-soft'];

    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
    }

    place(x, y) {
        const table = document.getElementById('game-field');
        const cell = table.rows[y].cells[x];
        if (!Flag.flags.some(flag => cell.classList.contains(flag))) {
            cell.classList.add(Flag.flags[Math.floor(Math.random() * Flag.flags.length)]);
        }
    }

    remove(x, y) {
        const table = document.getElementById('game-field');
        const cell = table.rows[y].cells[x];
        cell.classList.remove('flag');
    }
}

window.addEventListener('load', () => {
    setupEventListeners();
});
    */

window.Flaggie = {};

Flaggie.Cell = class Cell {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.flag = null;
        this.domElement = document.createElement('td');
    }

    newFlag(type) {
        if (this.flag) {
            return;
        }
        this.flag = new Flaggie.Flag(this, type);
        this.domElement.classList.add(this.flag.className());
    }

    removeFlag() {
        if (!this.flag) {
            return;
        }
        this.domElement.classList.remove(this.flag.className());
        this.flag = null;
    }

    playerLeave() {
        this.domElement.classList.remove('player');
    }

    playerEnter() {
        this.domElement.classList.add('player');
    }
}

Flaggie.Field = class Field {

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.build();
        
    }

    build() {
        this.domElement = document.createElement('table');
        this.domElement.classList.add('field');
        this.cells = [];
        for (let y = 0; y < this.height; y++) {
            this.cells.push([]);
            const row = document.createElement('tr');
            for (let x = 0; x < this.width; x++) {
                const cell = new Flaggie.Cell(x, y);
                row.appendChild(cell.domElement);
                this.cells[y].push(cell);
            }
            this.domElement.appendChild(row);
        }
    }

    cell(x, y) {
        return this.cells[y][x];
    }
}

Flaggie.Player = class Player {

    constructor(field, options = {}) {
        let {x, y, autoFlagTimeout} = options;
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.field = field;
        this.autoFlagTimeout = autoFlagTimeout;
        this.draw();
        this.addEventListeners();
        this.addTimeouts();
    }

    addEventListeners() {
        this.keydownListener = event => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
                case 'ArrowUp':
                    this.moveUp();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    break;
                case 'f':
                    this.placeFlag();
                    break;
                case 'd':
                    this.removeFlag();
                    break;
            }
        };
        document.addEventListener('keydown', this.keydownListener);
    }

    addTimeouts() {
        if (this.autoFlagTimeout) {
            this.autoFlagTimer = setTimeout(() => this.placeFlag(), this.autoFlagTimeout);
        }
    }

    removeTimeouts() {
        if (this.autoFlagTimer) {
            clearTimeout(this.autoFlagTimer);
        }
    }

    refreshTimeouts() {
        this.removeTimeouts();
        this.addTimeouts();
    }

    cell() {
        return this.field.cell(this.x, this.y);
    }

    draw() {
        this.cell().playerEnter();
    }

    undraw() {
        this.cell().playerLeave();
    }

    moveLeft() {
        this.undraw();
        this.x--;
        if (this.x < 0) {
            this.x = 0;
        }
        this.draw();
        this.refreshTimeouts();
    }

    moveRight() {
        this.undraw();
        this.x++;
        if (this.x > this.field.width - 1) {
            this.x = this.field.width - 1;
        }
        this.draw();
        this.refreshTimeouts();
    }

    moveUp() {
        this.undraw();
        this.y--;
        if (this.y < 0) {
            this.y = 0;
        }
        this.draw();
        this.refreshTimeouts();
    }

    moveDown() {
        this.undraw();
        this.y++;
        if (this.y > this.field.height - 1) {
            this.y = this.field.height - 1;
        }
        this.draw();
        this.refreshTimeouts();
    }

    placeFlag() {
        this.cell().newFlag();
        this.refreshTimeouts();
    }

    removeFlag() {
        this.cell().removeFlag();
        this.refreshTimeouts();
    }

    destroy() {
        this.undraw();
        document.removeEventListener('keydown', this.keydownListener);
    }

}

Flaggie.Flag = class Flag {
    static CLASSES = 'flag-normal flag-hard flag-soft'.split(' ');

    constructor(cell, type) {
        this.cell = cell;
        this.type = type ?? Math.floor(Math.random() * this.constructor.CLASSES.length);
    }

    className() {
        return this.constructor.CLASSES[this.type];
    }
}

Flaggie.Game = class Game {

    constructor(options = {}) {
        let {width, height} = options;
        width ??= document.getElementById('width-input').value;
        height ??= document.getElementById('height-input').value;
        this.field = new Flaggie.Field(width, height);
        const autoFlagTimeout = document.getElementById('auto-flag-checkbox').checked ? 5000 : undefined;
        this.player = new Flaggie.Player(this.field, {autoFlagTimeout});
        document.getElementById('field-container').appendChild(this.field.domElement);
    }

    destroy() {
        this.player.destroy();
        this.field.domElement.remove();
    }
}

window.addEventListener('load', () => {
    document.getElementById('build-button').addEventListener('click', () => {
        Flaggie.game?.destroy();
        Flaggie.game = new Flaggie.Game();
    });
});
