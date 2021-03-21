class Cell {
  constructor({ number = 0, isNew = false }) {
    this.number = number;
    this.isNew = isNew;
    this.isMerged = false;
  }
}

window.Cell = Cell;
