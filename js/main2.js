const {
  Direction,
  randomGenerate,
  getDefaultTableData,
  getDirection,
} = window.utils;
const fxjs = window._;
const { go, range, forEach, map, zipWithIndexL, filter, flat, takeAll } = fxjs;

const dimension = 4;
const cellOuterSize = 100;
const cellSize = 80;
const cellMargin = (cellOuterSize - cellSize) / 2;
const canvasRef = document.getElementById("canvas");
const context = canvasRef.getContext("2d");
let tableData = [];
const scoreRef = document.getElementById("score");
let score = 0;

function drawBackground({ context }) {
  context.strokeRect(0, 0, cellOuterSize * 4, cellOuterSize * 4);
}

function drawCells({ context, tableData }) {
  go(
    tableData,
    zipWithIndexL,
    forEach(([i, row]) => {
      go(
        row,
        zipWithIndexL,
        forEach(([j, cell]) => {
          const top = cellOuterSize * i;
          const left = cellOuterSize * j;

          context.fillStyle = "white";
          context.fillRect(left, top, cellOuterSize, cellOuterSize);
          context.fillStyle = "lightsteelblue";
          context.fillRect(
            left + cellMargin,
            top + cellMargin,
            cellSize,
            cellSize
          );

          if (cell.number > 0) {
            context.fillStyle = "black";
            if (cell.isMerged) {
              context.fillStyle = "tomato";
              cell.isMerged = false;
            }
            if (cell.isNew) {
              context.fillStyle = "blue";
              cell.isNew = false;
            }
            context.font = "36px san-serif";
            context.fillText(
              cell.number,
              left + cellMargin,
              top + cellSize / 2
            );
          }
        })
      );
    })
  );

  return tableData;
}

function init({ context, dimension }) {
  const tableData = getDefaultTableData(dimension);
  render({ context, tableData });

  return tableData;
}

function render({ context, tableData }) {
  // draw background
  drawBackground({ context });
  drawCells({ context, tableData });
  scoreRef.textContent = score.toString();
}

tableData = init({ context, dimension });
randomGenerate({ tableData });
render({ context, tableData });

// 드래그 방향을 계산
// 인강에서는 delta 값의 양음 여부와 기울기로 판단.
let isMouseClicked = false;
let startCoordinate = null;
let endCoordinate = null;

function operate() {
  const direction = getDirection(startCoordinate, endCoordinate);

  if (direction === null) {
    return;
  }
  console.log(direction);

  switch (direction) {
    case Direction.LEFT: {
      const shiftedRows = [[], [], [], []];

      tableData.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.number > 0) {
            const shiftedRow = shiftedRows[i];
            // 순회 방향(L->R) 과 리렌더 방향(L->R) 이 같으므로 맨 끝 요소
            const lastShiftedCell = shiftedRow[shiftedRow.length - 1];
            const isCanMerge =
              lastShiftedCell instanceof Cell &&
              lastShiftedCell.number === cell.number &&
              !lastShiftedCell.isMerged;

            if (isCanMerge) {
              lastShiftedCell.number *= 2;
              lastShiftedCell.isMerged = true;
            } else {
              // 순회 방향(L->R) 과 리렌더 방향(L->R) 이 같으므로 Push
              shiftedRow.push(cell);
            }
          }
        });
      });

      tableData = getDefaultTableData(dimension);

      shiftedRows.forEach((column, i) => {
        column.forEach((cell, j) => {
          // 행(i)는 고정
          tableData[i][j] = cell;
        });
      });

      break;
    }
    case Direction.RIGHT: {
      const shiftedRows = [[], [], [], []];

      tableData.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.number > 0) {
            const shiftedRow = shiftedRows[i];
            // 순회 방향(L->R) 과 리렌더 방향(R->L) 이 다르므로 0번 요소
            const lastShiftedCell = shiftedRow[0];
            const isCanMerge =
              lastShiftedCell instanceof Cell &&
              lastShiftedCell.number === cell.number &&
              !lastShiftedCell.isMerged;

            if (isCanMerge) {
              lastShiftedCell.number *= 2;
              lastShiftedCell.isMerged = true;
            } else {
              // 순회 방향(L->R) 과 리렌더 방향(R->L) 이 다르므로 unshift
              shiftedRow.unshift(cell);
            }
          }
        });
      });

      tableData = getDefaultTableData(dimension);

      shiftedRows.forEach((column, i) => {
        column.forEach((cell, j) => {
          // 행(i)는 고정
          tableData[i][dimension - 1 - j] = cell;
        });
      });

      break;
    }
    case Direction.UP: {
      const shiftedColumns = [[], [], [], []];

      tableData.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.number > 0) {
            const shiftedColumn = shiftedColumns[j];
            // 순회 방향(U->D)과 리렌더 방향(U->D) 이 같으므로 맨 끝 요소
            const lastShiftedCell = shiftedColumn[shiftedColumn.length - 1];
            const isCanMerge =
              lastShiftedCell instanceof Cell &&
              lastShiftedCell.number === cell.number &&
              !lastShiftedCell.isMerged;

            if (isCanMerge) {
              lastShiftedCell.number *= 2;
              lastShiftedCell.isMerged = true;
            } else {
              // 순회 방향(U->D)과 리렌더 방향(U->D) 이 같으므로 push
              shiftedColumn.push(cell);
            }
          }
        });
      });

      tableData = getDefaultTableData(dimension);

      shiftedColumns.forEach((column, j) => {
        column.forEach((cell, i) => {
          // 열(j)은 고정
          tableData[i][j] = cell;
        });
      });

      break;
    }
    case Direction.DOWN: {
      const shiftedColumns = [[], [], [], []];

      tableData.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell.number > 0) {
            const shiftedColumn = shiftedColumns[j];
            // 순회 방향(U->D)과 리렌더 방향(U->D) 이 같으므로 0번 요소
            const lastShiftedCell = shiftedColumn[0];
            const isCanMerge =
              lastShiftedCell instanceof Cell &&
              lastShiftedCell.number === cell.number &&
              !lastShiftedCell.isMerged;

            if (isCanMerge) {
              lastShiftedCell.number *= 2;
              lastShiftedCell.isMerged = true;
            } else {
              // 순회 방향(U->D)과 리렌더 방향(U->D) 이 같으므로 push
              shiftedColumn.unshift(cell);
            }
          }
        });
      });

      tableData = getDefaultTableData(dimension);

      shiftedColumns.forEach((column, j) => {
        column.forEach((cellData, i) => {
          // 열(j)은 고정
          tableData[dimension - 1 - i][j] = cellData;
        });
      });

      break;
    }
  }

  const isEnd = randomGenerate({
    tableData,
  });

  if (isEnd) {
    document.removeEventListener("mousedown", mouseDownHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
    document.removeEventListener("touchstart", mouseDownHandler);
    document.removeEventListener("touchend", mouseUpHandler);
    return;
  }

  score += 1;

  render({
    context,
    tableData,
  });

  isMouseClicked = false;
}

function mouseDownHandler(e) {
  isMouseClicked = true;
  startCoordinate = [e.clientX, e.clientY];
}

function mouseUpHandler(e) {
  endCoordinate = [e.clientX, e.clientY];

  operate();
}

function touchStartHandler(e) {
  isMouseClicked = true;
  const touch = e.touches[0];
  startCoordinate = [touch.clientX, touch.clientY];
}

function touchEndHandler(e) {
  const touch = e.changedTouches[0];
  endCoordinate = [touch.clientX, touch.clientY];

  operate();
}

document.addEventListener("mousedown", mouseDownHandler);
document.addEventListener("mouseup", mouseUpHandler);
document.addEventListener("touchstart", touchStartHandler, false);
document.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});
document.addEventListener("touchend", touchEndHandler, false);
