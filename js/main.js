const {
  Direction,
  init,
  randomGenerate,
  render,
  getDefaultTableData,
  getDirection,
} = window.utils;

const table = document.getElementById("table");
let tableData = [];
const dimension = 4;
const scoreRef = document.getElementById("score");
let score = 0;

tableData = init({
  table,
  dimension,
});
randomGenerate({
  tableData,
});
render({
  tableData,
  table,
  scoreRef,
  score,
});

// 드래그 방향을 계산
// 인강에서는 delta 값의 양음 여부와 기울기로 판단.
let isMouseClicked = false;
let isMouseMoved = false;
let startCoordinate = null;
let endCoordinate = null;

function mouseDownHandler(e) {
  isMouseClicked = true;
  startCoordinate = [e.clientX, e.clientY];
}

function mouseMoveHandler(e) {
  if (!isMouseClicked) {
    isMouseMoved = true;
    return;
  }
}

function mouseUpHandler(e) {
  endCoordinate = [e.clientX, e.clientY];

  if (isMouseMoved) {
    const direction = getDirection(startCoordinate, endCoordinate);
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
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      return;
    }

    score += 1;

    render({
      tableData,
      table,
      scoreRef,
      score,
    });
  }

  isMouseClicked = false;
  isMouseMoved = false;
}

window.addEventListener("mousedown", mouseDownHandler);

window.addEventListener("mousemove", mouseMoveHandler);

window.addEventListener("mouseup", mouseUpHandler);
