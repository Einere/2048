const {Direction, init, randomGenerate, render, getDefaultTableData, getDirection} = window.utils;

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
              // 순회 방향(L->R) 과 리렌더 방향(L->R) 이 같으므로 맨 끝 요소
              const lastShiftedCell = shiftedRow[shiftedRow.length - 1];
              const isCanMerge = lastShiftedCell instanceof Cell && lastShiftedCell.number === cell.number && !lastShiftedCell.isMerged;

              if(isCanMerge) {
                lastShiftedCell.number *= 2;
                lastShiftedCell.isMerged = true;
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
              // 순회 방향(L->R) 과 리렌더 방향(R->L) 이 다르므로 0번 요소
              const lastShiftedCell = shiftedRow[0];
              const isCanMerge = lastShiftedCell instanceof Cell && lastShiftedCell.number === cell.number && !lastShiftedCell.isMerged;

              if(isCanMerge) {
                lastShiftedCell.number *= 2;
                lastShiftedCell.isMerged = true;
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
              // 순회 방향(U->D)과 리렌더 방향(U->D) 이 같으므로 맨 끝 요소
              const lastShiftedCell = shiftedColumn[shiftedColumn.length - 1];
              const isCanMerge = lastShiftedCell instanceof Cell && lastShiftedCell.number === cell.number && !lastShiftedCell.isMerged;

              if(isCanMerge) {
                lastShiftedCell.number *= 2;
                lastShiftedCell.isMerged = true;
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
              // 순회 방향(U->D)과 리렌더 방향(U->D) 이 같으므로 0번 요소
              const lastShiftedCell = shiftedColumn[0];
              const isCanMerge = lastShiftedCell instanceof Cell && lastShiftedCell.number === cell.number && !lastShiftedCell.isMerged;

              if(isCanMerge) {
                lastShiftedCell.number *= 2;
                lastShiftedCell.isMerged = true;
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
        console.log(tableData);

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
