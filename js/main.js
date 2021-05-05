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
    this.actuator = new Actuator();

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
    this.actuate();
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

  actuate() {
    this.actuator.actuate(this.grid, {
      score: this.score,
      over: this.over,
      won: this.won,
      // bestScore: this.storageManager.getBestScore(),
      bestScore: 0,
      terminated: this.isGameTerminated(),
    });
  }

  isGameTerminated() {
    return this.over || (this.won && !this.keepPlaying);
  }
}

class HTMLActuator {
  constructor() {
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");

    this.score = 0;
  }

  clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  applyClasses(element, classes) {
    element.setAttribute("class", classes.join(" "));
  }

  normalizePosition(position) {
    return { x: position.x + 1, y: position.y + 1 };
  }

  positionClass(position) {
    position = this.normalizePosition(position);
    return `tile-position-${position.x}-${position.y}`;
  }

  addTile(tile) {
    const self = this;

    const wrapper = document.createElement("div");
    const inner = document.createElement("div");
    const position = tile.previousPosition || { x: tile.x, y: tile.y };
    const positionClass = this.positionClass(position);

    // We can't use classlist because it somehow glitches when replacing classes
    const classes = ["tile", `tile-${tile.value}`, positionClass];

    if (tile.value > 2048) classes.push("tile-super");

    this.applyClasses(wrapper, classes);

    inner.classList.add("tile-inner");
    inner.textContent = tile.value;

    // render previous, and make it to move current position
    if (tile.previousPosition) {
      window.requestAnimationFrame(function () {
        classes[2] = self.positionClass({ x: tile.x, y: tile.y });
        self.applyClasses(wrapper, classes);
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);

      // Render the tiles that merged
      tile.mergedFrom.forEach(function (merged) {
        self.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
  }

  actuate(grid, metadata) {
    const self = this;

    function render() {
      self.clearContainer(self.tileContainer);
      grid.eachCell((i, j, cell) => (cell ? self.addTile(cell) : null));

      self.updateScore(metadata.score);
      self.updateBestScore(metadata.bestScore);

      // if (metadata.terminated) {
      //   if (metadata.over) {
      //     self.message(false); // You lose
      //   } else if (metadata.won) {
      //     self.message(true); // You win!
      //   }
      // }
    }

    window.requestAnimationFrame(render);
  }

  updateScore(score) {
    this.clearContainer(this.scoreContainer);

    const difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (difference > 0) {
      const addition = document.createElement("div");
      addition.classList.add("score-addition");
      addition.textContent = `+${difference}`;

      this.scoreContainer.appendChild(addition);
    }
  }

  updateBestScore(bestScore) {
    this.bestContainer.textContent = bestScore;
  }
}

const gameManager = new GameManager(4, null, HTMLActuator);
console.log(gameManager);
