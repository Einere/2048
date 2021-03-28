class Cell {
  constructor({ number = 0, isNew = false, top = 0, left = 0 }) {
    this.number = number;
    this.isNew = isNew;
    this.isMerged = false;
    this.top = top;
    this.left = left;
    this.deltaLeft = 0;
    this.deltaTop = 0;
  }
}

window.Cell = Cell;
