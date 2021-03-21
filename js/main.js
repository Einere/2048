const {init, randomGenerate, render, getDefaultTableData} = window.utils;

const table = document.getElementById('table');
let tableData = [];
const dimension = 4;

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
});

// 드래그 방향을 계산
// 인강에서는 delta 값의 양음 여부와 기울기로 판단.
let isMouseClicked = false;
let isMouseMoved = false;
let startCoordinate = null;
let endCoordinate = null;
const Direction = {
  RIGHT: 'RIGHT',
  UP: 'UP',
  LEFT: 'LEFT',
  DOWN: 'DOWN',
};

window.addEventListener('mousedown', (e) => {
  isMouseClicked = true;
  startCoordinate = [e.clientX, e.clientY];
});

window.addEventListener('mousemove', (e) => {
  if(!isMouseClicked) {
    isMouseMoved = true;
    return;
  }
});

function getTheta (deltaX, deltaY) {
  // 데카르트 좌표계 -> 각 좌표계
  // https://ko.wikipedia.org/wiki/%EA%B7%B9%EC%A2%8C%ED%91%9C%EA%B3%84#%EA%B7%B9%EC%A2%8C%ED%91%9C%EC%99%80_%EB%8D%B0%EC%B9%B4%EB%A5%B4%ED%8A%B8_%EC%A2%8C%ED%91%9C_%EC%82%AC%EC%9D%B4%EC%9D%98_%EB%B3%80%ED%99%98
  if(deltaX > 0 && deltaY >= 0) {
    return Math.atan(deltaY / deltaX);
  }
  else if (deltaX > 0 && deltaY < 0) {
    return Math.atan(deltaY / deltaX) + 2 * Math.PI;
  }
  else if (deltaX < 0) {
    return Math.atan(deltaY / deltaX) + Math.PI;
  }
  else if (deltaX === 0 && deltaY > 0) {
    return Math.PI / 2;
  }
  else if (deltaX === 0 && deltaY < 0) {
    return Math.PI * 3 / 2;
  }
}

function getDirection(startCoordinate, endCoordinate) {
  const deltaX = endCoordinate[0] - startCoordinate[0];
  // 브라우저에서 y는 아래로 갈수록 양의 무한대에 가까워지기 때문에, 데카르트 좌표계로 조건을 판단하기 위해서는 뒤집어줘야 한다.
  const deltaY = -(endCoordinate[1] - startCoordinate[1]);

  const theta =  getTheta(deltaX, deltaY);
  const isLower45 = theta < 1 / 4 * Math.PI;
  const isUpper45 = theta > 1 / 4 * Math.PI;
  const isLower135 = theta < 3 / 4 * Math.PI;
  const isUpper135 = theta > 3 / 4 * Math.PI;
  const isLower225 = theta < 5 / 4 * Math.PI;
  const isUpper225 = theta > 5 / 4 * Math.PI;
  const isLower315 = theta < 7 / 4 * Math.PI;
  const isUpper315 = theta > 7 / 4 * Math.PI;

  if(isUpper45 && isLower135) {
    return Direction.UP;
  }
  else if (isUpper135 && isLower225) {
    return Direction.LEFT;
  }
  else if (isUpper225 && isLower315) {
    return Direction.DOWN;
  }
  else if (isUpper315 || isLower45) {
    return Direction.RIGHT;
  }
}

window.addEventListener('mouseup', (e) => {
  endCoordinate = [e.clientX, e.clientY];

  if(isMouseMoved) {
    const direction = getDirection(startCoordinate, endCoordinate);
    console.log(direction);

    switch(direction) {
      case Direction.LEFT: {
        const shiftedRows = [
          [],
          [],
          [],
          []
        ];

        tableData.forEach((row, i) => {
          row.forEach((cell, j) => {
            if(cell.number > 0) {
              const shiftedRow = shiftedRows[i];
              const shiftedLastCell = shiftedRow[shiftedRow.length - 1];
              const isCanMerge = shiftedLastCell instanceof Cell && shiftedLastCell.number === cell.number;

              if(isCanMerge) {
                shiftedLastCell.number *= 2;
              }
              else {
                // 순회 방향(L->R) 과 리렌더 방향(L->R) 이 같으므로 Push
                shiftedRow.push(cell);
              }
            }
          });
        });

        tableData = getDefaultTableData(dimension);

        shiftedRows.forEach((column, i) => {
          column.forEach((cell, j) => {
            tableData[i][j] = cell;
          });
        });

        break;
      }
      case Direction.RIGHT: {
        const shiftedRows = [
          [],
          [],
          [],
          []
        ];

        tableData.forEach((row, i) => {
          row.forEach((cell, j) => {
            if(cell.number > 0) {
              const shiftedRow = shiftedRows[i];
              const shiftedLastCell = shiftedRow[shiftedRow.length - 1];
              const isCanMerge = shiftedLastCell instanceof Cell && shiftedLastCell.number === cell.number;

              if(isCanMerge) {
                shiftedLastCell.number *= 2;
              }
              else {
                // 순회 방향(L->R) 과 리렌더 방향(R->L) 이 다르므로 unshift
                shiftedRow.unshift(cell);
              }
            }
          });
        });

        tableData = getDefaultTableData(dimension);

        shiftedRows.forEach((column, i) => {
          column.forEach((cell, j) => {
            tableData[i][dimension - 1 - j] = cell;
          });
        });

        break;
      }
      case Direction.UP: {
        const shiftedColumns = [
          [], [], [], []
        ];

        tableData.forEach((row, i) => {
          row.forEach((cell, j) => {
            if(cell.number > 0) {
              const shiftedColumn = shiftedColumns[j];
              const lastShiftedCell = shiftedColumn[shiftedColumn.length - 1];
              const isCanMerge = lastShiftedCell instanceof Cell && lastShiftedCell.number === cell.number;

              if(isCanMerge) {
                lastShiftedCell.number *= 2;
              }
              else {
                // 순회 방향(U->D)과 리렌더 방향(U->D) 이 같으므로 push
                shiftedColumn.push(cell);
              }
            }
          });
        });

        tableData = getDefaultTableData(dimension);

        shiftedColumns.forEach((column, j) => {
          column.forEach((cell, i) => {
            tableData[i][j] = cell;
          });
        });

        break;
      }
      case Direction.DOWN: {
        const shiftedColumns = [
          [], [], [], []
        ];

        tableData.forEach((row, i) => {
          row.forEach((cell, j) => {
            if(cell.number > 0) {
              const shiftedColumn = shiftedColumns[j];
              const lastShiftedCell = shiftedColumn[shiftedColumn.length - 1];
              const isCanMerge = lastShiftedCell instanceof Cell && lastShiftedCell.number === cell.number;

              if(isCanMerge) {
                lastShiftedCell.number *= 2;
              }
              else {
                // 순회 방향(U->D)과 리렌더 방향(U->D) 이 같으므로 push
                shiftedColumn.unshift(cell);
              }
            }
          });
        });

        tableData = getDefaultTableData(dimension);

        shiftedColumns.forEach((column, j) => {
          column.forEach((cellData, i) => {
            tableData[dimension - 1 - i][j] = cellData;
          });
        });

        break;
      }
    }

    randomGenerate({
      tableData,
    });
    render({
      tableData,
      table,
    });
  }

  isMouseClicked = false;
  isMouseMoved = false;
});
