const fxjs = window._;
const { go, range, forEach, map, filter, flat, when, each, some } = fxjs;
const CONSTANTS = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  RESTART: 4,
};

function random(list) {
  return list[Math.floor(Math.random() * list.length)];
}

class Grid {
  constructor(size) {
    this.size = size;
    this.cells = this.init();
  }

  init() {
    const cells = [];

    go(
      range(this.size),
      forEach((row) => {
        cells.push([]);

        go(
          range(this.size),
          forEach((column) => {
            cells[row].push(null);
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
    return this.mapCell((row, column, cell) => {
      if (!cell) {
        return {
          row,
          column,
        };
      }
    });
  }

  getAvailablePosition() {
    const positions = this.getAvailablePositions();

    return go(
      positions,
      flat,
      when((flatten) => flatten.length, random)
    );
  }

  isExistAvailableCell() {
    return !!this.getAvailablePositions().length;
  }

  isCellEmpty(cell) {
    return !this.isCellOccupied(cell);
  }

  isCellOccupied(cell) {
    return !!this.getCellContent(cell);
  }

  getCellContent(cell) {
    if (this.withinBounds(cell)) {
      return this.cells[cell.row][cell.column];
    } else {
      return null;
    }
  }

  withinBounds(cell) {
    const isInAboutRow = cell.row >= 0 && cell.row < this.size;
    const isInAboutColumn = cell.column >= 0 && cell.column < this.size;
    return isInAboutRow && isInAboutColumn;
  }

  insertTile(tile) {
    this.cells[tile.row][tile.column] = tile;
  }

  removeTile(tile) {
    this.cells[tile.row][tile.column] = null;
  }
}

class Tile {
  constructor(position, value) {
    this.row = position.row;
    this.column = position.column;
    this.value = value || 2;

    this.previousPosition = null;
    this.mergedFrom = null;
  }

  savePosition() {
    this.previousPosition = { row: this.row, column: this.column };
  }

  updatePosition(position) {
    this.row = position.row;
    this.column = position.column;
  }
}

class GameManager {
  constructor(size, InputManager, Actuator) {
    this.size = size; // Size of the grid
    this.inputManager = new InputManager();
    this.actuator = new Actuator();

    this.startTiles = 1;

    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    // this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

    this.setup();
  }

  isPositionEqual(first, second) {
    return first.row === second.row && first.column === second.column;
  }

  // Restart the game
  restart() {
    // this.actuator.continueGame(); // Clear the game won/lost message
    this.setup();
  }

  // Keep playing after winning (allows going over 2048)
  keepPlaying() {
    this.keepPlaying = true;
    // this.actuator.continueGame(); // Clear the game won/lost message
  }

  // Return true if the game is lost, or has won and the user hasn't kept playing
  isGameTerminated() {
    return this.over || (this.won && !this.keepPlaying);
  }

  // Set up the game
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

  // Set up the initial tiles to start the game with
  addStartTiles() {
    go(range(this.startTiles), each(this.addRandomTile.bind(this)));
  }

  // Adds a tile in a random position
  addRandomTile() {
    if (this.grid.isExistAvailableCell()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const availablePosition = this.grid.getAvailablePosition();
      const tile = new Tile(availablePosition, value);
      this.grid.insertTile(tile);
    }
  }

  // Sends the updated grid to the actuator
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

  // Save all tile positions and remove merger info
  prepareTiles() {
    this.grid.eachCell(function (row, column, tile) {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  // Move a tile and its representation
  moveTile(tile, cell) {
    this.grid.cells[tile.row][tile.column] = null;
    this.grid.cells[cell.row][cell.column] = tile;
    tile.updatePosition(cell);
  }

  movesAvailable() {
    return this.grid.isExistAvailableCell() || this.isCanMergeWithNeighbor();
  }

  isCanMergeWithNeighbor() {
    const self = this;
    let isCanMerge = false;

    this.grid.eachCell((row, column, cell) => {
      const tile = this.grid.getCellContent({ row, column });

      if (tile) {
        const result = go(
          CONSTANTS,
          Object.values,
          filter((value) => value < 4),
          map(self.getVector),
          some((vector) => {
            const cell = { row: row + vector.y, column: column + vector.x };
            const next = self.grid.getCellContent(cell);
            return next && next.value === tile.value;
          })
        );

        isCanMerge = isCanMerge || result;
      }
    });

    return isCanMerge;
  }

  // Move tiles on the grid in the specified direction
  move(direction) {
    const self = this;

    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.row.forEach(function (row) {
      traversals.column.forEach(function (column) {
        const cell = { row, column };
        const tile = self.grid.getCellContent(cell);

        if (tile) {
          const farthestPosition = self.getFarthestPosition(cell, vector);
          const next = self.grid.getCellContent(farthestPosition.nextCell);
          const isCanMerge =
            next && next.value === tile.value && !next.mergedFrom;

          if (isCanMerge) {
            const merged = new Tile(farthestPosition.nextCell, tile.value * 2);
            merged.mergedFrom = [tile, next];

            self.grid.insertTile(merged);
            self.grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(farthestPosition.nextCell);

            // Update the score
            self.score += merged.value;

            // The mighty 2048 tile
            if (merged.value === 2048) self.won = true;
          } else {
            self.moveTile(tile, farthestPosition.farthest);
          }

          // tile's position can be updated by updatePosition()
          if (!self.isPositionEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });

    if (moved) {
      this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true; // Game over!
      }

      this.actuate();
    }
  }

  // Get the vector representing the chosen direction
  getVector(direction) {
    // don't confuse vector.x , vector.y.
    // vector.x is delta about column axis, vector.y is delta about row axis
    const vectorMap = {
      [CONSTANTS.UP]: { x: 0, y: -1 },
      [CONSTANTS.RIGHT]: { x: 1, y: 0 },
      [CONSTANTS.DOWN]: { x: 0, y: 1 },
      [CONSTANTS.LEFT]: { x: -1, y: 0 },
    };

    return vectorMap[direction];
  }

  // Build a list of positions to traverse in the right order
  buildTraversals(vector) {
    const traversals = { row: [], column: [] };

    for (let pos = 0; pos < this.size; pos++) {
      traversals.row.push(pos);
      traversals.column.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.column = traversals.column.reverse();
    if (vector.y === 1) traversals.row = traversals.row.reverse();

    return traversals;
  }

  getFarthestPosition(cell, vector) {
    let previous;

    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;
      cell = {
        row: previous.row + vector.y,
        column: previous.column + vector.x,
      };
    } while (this.grid.withinBounds(cell) && this.grid.isCellEmpty(cell));

    return {
      farthest: previous,
      nextCell: cell, // Used to check if a merge is required
    };
  }
}

class HTMLActuator {
  constructor() {
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    // this.messageContainer = document.querySelector(".game-message");

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
    console.log("addTile", tile, positionClass);

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

class InputManager {
  constructor() {
    this.events = {};

    if (window.navigator.msPointerEnabled) {
      //Internet Explorer 10 style
      this.eventTouchstart = "MSPointerDown";
      this.eventTouchmove = "MSPointerMove";
      this.eventTouchend = "MSPointerUp";
    } else {
      this.eventTouchstart = "touchstart";
      this.eventTouchmove = "touchmove";
      this.eventTouchend = "touchend";
    }

    this.listen();
  }

  targetIsInput(event) {
    return event.target.tagName.toLowerCase() === "input";
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    const callbacks = this.events[event];
    console.log("input manager emit", this.events, event, data);
    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data);
      });
    }
  }

  restart(event) {
    event.preventDefault();
    this.emit("restart");
  }

  listen() {
    const self = this;

    const keyMap = {
      ArrowUp: CONSTANTS.UP,
      ArrowRight: CONSTANTS.RIGHT,
      ArrowDown: CONSTANTS.DOWN,
      ArrowLeft: CONSTANTS.LEFT,
      r: CONSTANTS.RESTART,
    };

    // Respond to direction keys
    document.addEventListener("keydown", function (event) {
      const modifiers =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      const key = keyMap[event.key];

      // Ignore the event if it's happening in a text field
      if (self.targetIsInput(event)) return;

      if (!modifiers && key !== undefined) {
        event.preventDefault();
        self.emit("move", key);
      }

      // R key restarts the game
      if (!modifiers && key === CONSTANTS.RESTART) {
        self.restart.call(self, event);
      }
    });

    // Respond to button presses
    // this.bindButtonPress(".retry-button", this.restart);
    // this.bindButtonPress(".restart-button", this.restart);
    // this.bindButtonPress(".keep-playing-button", this.keepPlaying);

    // Respond to swipe events
    let touchStartClientX, touchStartClientY;
    const gameContainer = document.getElementsByClassName("game-container")[0];

    gameContainer.addEventListener(
      this.eventTouchstart,
      function (event) {
        if (
          (!window.navigator.msPointerEnabled && event.touches.length > 1) ||
          event.targetTouches.length > 1 ||
          self.targetIsInput(event)
        ) {
          return; // Ignore if touching with more than 1 finger or touching input
        }

        if (window.navigator.msPointerEnabled) {
          touchStartClientX = event.pageX;
          touchStartClientY = event.pageY;
        } else {
          touchStartClientX = event.touches[0].clientX;
          touchStartClientY = event.touches[0].clientY;
        }

        event.preventDefault();
      },
      { passive: true }
    );

    gameContainer.addEventListener(
      this.eventTouchmove,
      function (event) {
        event.preventDefault();
      },
      { passive: true }
    );

    gameContainer.addEventListener(this.eventTouchend, function (event) {
      if (
        (!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches.length > 0 ||
        self.targetIsInput(event)
      ) {
        return; // Ignore if still touching with one or more fingers or input
      }

      let touchEndClientX, touchEndClientY;

      if (window.navigator.msPointerEnabled) {
        touchEndClientX = event.pageX;
        touchEndClientY = event.pageY;
      } else {
        touchEndClientX = event.changedTouches[0].clientX;
        touchEndClientY = event.changedTouches[0].clientY;
      }

      const threshold = 10;
      const dx = touchEndClientX - touchStartClientX;
      const absDx = Math.abs(dx);
      const dy = touchEndClientY - touchStartClientY;
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > threshold) {
        // (right : left) : (down : up)
        self.emit(
          "move",
          absDx > absDy
            ? dx > 0
              ? CONSTANTS.RIGHT
              : CONSTANTS.LEFT
            : dy > 0
            ? CONSTANTS.DOWN
            : CONSTANTS.UP
        );
      }
    });
  }
}

const gameManager = new GameManager(4, InputManager, HTMLActuator);
