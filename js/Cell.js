class Cell {
  constructor({
    number = 0,
    isNew = false
              }) {
    this.number = number;
    this.isNew = isNew;
  }
}

window.Cell = Cell;
