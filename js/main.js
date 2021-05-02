const fxjs = window._;
const {
  go,
  range,
  forEach,
  map,
  zipWithIndexL,
  filter,
  flat,
  when,
  tap,
  each,
} = fxjs;

class Grid {
  constructor(size) {
    this.size = size;
    this.cells = this.init();
  }

  init() {
    const cells = [];

    go(
      range(this.size),
      forEach((i) => {
        cells.push([]);

        go(
          range(this.size),
          forEach((j) => {
            cells[i].push(null);
          })
        );
      })
    );

    return cells;
  }

  eachCell(callback) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        callback(i, j, this.cells[i][j]);
      }
    }
  }

  mapCell(callback) {
    const mapped = [];

    for (let i = 0; i < this.size; i++) {
      const mappedRow = [];
      for (let j = 0; j < this.size; j++) {
        const result = callback(i, j, this.cells[i][j]);

        if (result) {
          mappedRow.push(result);
        }
      }
      mapped.push(mappedRow);
    }

    return mapped;
  }

  getAvailablePositions() {
    return this.mapCell((x, y, cell) => {
      if (!cell) {
        return {
          x,
          y,
        };
      }
    });
  }

  getAvailablePosition() {
    const positions = this.getAvailablePositions();

    function random(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    return go(
      positions,
      flat,
      when((flatten) => flatten.length, random)
    );
  }

  isExistAvailableCell() {
    return !!this.getAvailablePositions().length;
  }

  availableCell(cell) {
    return !this.cellOccupied(cell);
  }

  cellOccupied(cell) {
    return !!this.getCell(cell);
  }

  getCell(cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    } else {
      return null;
    }
  }

  withinBounds(cell) {
    return (
      cell.x >= 0 && cell.x < this.size && cell.y >= 0 && cell.y < this.size
    );
  }

  insertTile(tile) {
    this.cells[tile.x][tile.y] = tile;
  }

  removeTile(tile) {
    this.cells[tile.x][tile.y] = null;
  }
}

class Tile {
  constructor(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;

    this.previousPosition = null;
    this.mergedFrom = null;
  }

  savePosition() {
    this.previousPosition = { x: this.x, y: this.y };
  }

  updatePosition(position) {
    this.x = position.x;
    this.y = position.y;
  }
}

class GameManager {
  constructor(size, InputManager, Actuator) {
    this.size = size; // Size of the grid
    // this.inputManager = new InputManager();
    // this.actuator = new Actuator();

    this.startTiles = 2;

    // this.inputManager.on("move", this.move.bind(this));
    // this.inputManager.on("restart", this.restart.bind(this));
    // this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

    this.setup();
  }

  setup() {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();

    // Update the actuator
    // this.actuate();
  }

  addStartTiles() {
    go(range(this.startTiles), each(this.addRandomTile.bind(this)));
  }

  addRandomTile() {
    if (this.grid.isExistAvailableCell()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const availablePosition = this.grid.getAvailablePosition();
      const tile = new Tile(availablePosition, value);
      this.grid.insertTile(tile);
    }
  }
}
const gameManager = new GameManager(4);
console.log(gameManager);
