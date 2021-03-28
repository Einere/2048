const { Direction, getDirection } = window.utils;
const fxjs = window._;
const { go, range, forEach, map, zipWithIndexL, filter, flat, takeAll } = fxjs;

const dimension = 4;
const cellOuterSize = 100;
const cellSize = 80;
const cellMargin = (cellOuterSize - cellSize) / 2;
const canvasRef = document.getElementById("canvas");
const context = canvasRef.getContext("2d");
let cellData = null;
const scoreRef = document.getElementById("score");
let score = 0;

function randomGenerate({ cellData }) {
  const filteredIndexedData = go(
    cellData,
    zipWithIndexL,
    map(([i, row]) =>
      go(
        cellData[i],
        zipWithIndexL,
        map(([j, cell]) => [i, j, cell])
      )
    ),
    flat,
    filter((indexedData) => indexedData[2] === null)
  );

  if (filteredIndexedData.length === 0) {
    return true;
  }

  const randomIndex = Math.floor(Math.random() * filteredIndexedData.length);
  const [i, j] = filteredIndexedData[randomIndex];
  cellData[i][j] = new Cell({
    number: 2,
    isNew: true,
    top: i * cellOuterSize,
    left: j * cellOuterSize,
  });

  return false;
}

function getDefaultCellData(dimension) {
  return go(
    range(dimension),
    map((i) => {
      /*return go(
        range(dimension),
        map(
          (j) => new Cell({ top: i * cellOuterSize, left: j * cellOuterSize })
        )
      );*/
      return new Array(dimension).fill(null);
    })
  );
}

function drawBackground({ context }) {
  context.fillStyle = "#bbada0";
  context.fillRect(0, 0, cellOuterSize * dimension, cellOuterSize * dimension);

  go(
    range(dimension),
    forEach((i) => {
      go(
        range(dimension),
        forEach((j) => {
          context.fillStyle = "rgba(238, 228, 218, 0.35)";
          context.fillRect(
            i * cellOuterSize + cellMargin,
            j * cellOuterSize + cellMargin,
            cellSize,
            cellSize
          );
        })
      );
    })
  );
}

function drawCells({ context, cellData }) {
  go(
    cellData,
    zipWithIndexL,
    forEach(([i, row]) => {
      go(
        row,
        zipWithIndexL,
        forEach(([j, cell]) => {
          if (!(cell instanceof Cell)) {
            return;
          }

          const deltaTop = cell.deltaTop;
          const deltaLeft = cell.deltaLeft;

          if (deltaTop !== 0) {
            const delta = deltaTop > 0 ? -10 : 10;
            cell.top += delta;
            cell.deltaTop -= delta;
          }
          if (deltaLeft !== 0) {
            const delta = deltaTop > 0 ? 10 : -10;
            cell.left += delta;
            cell.deltaLeft -= delta;
          }

          context.fillStyle = "#eee4da";
          context.fillRect(
            cell.left + cellMargin,
            cell.top + cellMargin,
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
              cell.left + cellMargin,
              cell.top + cellSize / 2
            );
          }
        })
      );
    })
  );

  return cellData;
}

function init({ context, dimension }) {
  const cellData = getDefaultCellData(dimension);
  render({ context, cellData });

  return cellData;
}

function render({ context, cellData }) {
  // draw background
  drawBackground({ context });
  drawCells({ context, cellData });
  scoreRef.textContent = score.toString();
}

cellData = init({ context, dimension });
randomGenerate({ cellData });
console.log(cellData);
// render({ context, cellData });
setInterval(() => {
  console.log(cellData);
  render({ context, cellData });
}, 100);

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

      cellData.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell instanceof Cell && cell.number > 0) {
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

              const afterIndex = shiftedRow.findIndex(
                (shiftedCell) => shiftedCell === cell
              );
              cell.deltaLeft = (afterIndex - j) * cellOuterSize;
            }
          }
        });
      });

      cellData = getDefaultCellData(dimension);

      shiftedRows.forEach((row, i) => {
        row.forEach((cell, j) => {
          // 행(i)는 고정
          cellData[i][j] = cell;
        });
      });

      break;
    }
    /*case Direction.RIGHT: {
      const shiftedRows = [[], [], [], []];

      cellData.forEach((row, i) => {
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

      cellData = getDefaultcellData(dimension);

      shiftedRows.forEach((row, i) => {
        row.forEach((cell, j) => {
          // 행(i)는 고정
          cellData[i][dimension - 1 - j] = cell;
        });
      });

      break;
    }
    case Direction.UP: {
      const shiftedColumns = [[], [], [], []];

      cellData.forEach((row, i) => {
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

      cellData = getDefaultcellData(dimension);

      shiftedColumns.forEach((column, j) => {
        column.forEach((cell, i) => {
          // 열(j)은 고정
          cellData[i][j] = cell;
        });
      });

      break;
    }
    case Direction.DOWN: {
      const shiftedColumns = [[], [], [], []];

      cellData.forEach((row, i) => {
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

      cellData = getDefaultcellData(dimension);

      shiftedColumns.forEach((column, j) => {
        column.forEach((cellData, i) => {
          // 열(j)은 고정
          cellData[dimension - 1 - i][j] = cellData;
        });
      });

      break;
    }*/
  }

  const isEnd = randomGenerate({
    cellData,
  });

  if (isEnd) {
    document.removeEventListener("mousedown", mouseDownHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
    document.removeEventListener("touchstart", mouseDownHandler);
    document.removeEventListener("touchend", mouseUpHandler);
    return;
  }

  score += 1;

  /*render({
    context,
    cellData,
  });*/

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
