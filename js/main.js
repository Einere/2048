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

  availablePositions() {
    return this.mapCell((i, j, cell) => {
      if (!cell) {
        return {
          i,
          j,
        };
      }
    });
  }

  randomAvailablePosition() {
    const availableCells = this.availablePositions();

    function random(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    return go(
      availableCells,
      flat,
      when((flatten) => flatten.length, random)
    );
  }

  existAvailableCell() {
    return !!this.availablePositions().length;
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

const grid = new Grid(4);
const position = grid.randomAvailablePosition();
console.log(position);
