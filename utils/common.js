const Cell = window.Cell;
const fxjs = window._;
const {go, range, forEach, map, zipWithIndexL, filter, flat} = fxjs;

const Direction = {
  RIGHT: 'RIGHT',
  UP: 'UP',
  LEFT: 'LEFT',
  DOWN: 'DOWN',
};

function getDefaultTableData(dimension) {
  return go(
    range(dimension),
    map(_ => {
      const row = new Array(dimension);
      row.fill(new Cell({}));

      return row;
    })
  );
}

function init({table, dimension}) {
  const fragment = document.createDocumentFragment();
  const tableData = getDefaultTableData(dimension);

  tableData[0][0] = new Cell({number: 2});
  tableData[0][2] = new Cell({number: 2});
  tableData[0][3] = new Cell({number: 4});



  go(
    tableData,
    forEach((row) => {
      const tr = document.createElement('tr');

      go(
        row,
        forEach(() => {
          const td = document.createElement('td');
          tr.appendChild(td);
        })
      );

      fragment.appendChild(tr);
    })
  );

  table.appendChild(fragment);

  return tableData;
}

function randomGenerate({tableData}) {
  const filteredIndexedData = go(
    tableData,
    zipWithIndexL,
    map(([i, row]) => go(
      tableData[i],
      zipWithIndexL,
      map(([j, cell]) => [i, j, cell])
    )),
    flat,
    filter(indexedData => indexedData[2].number === 0)
  );

  if (filteredIndexedData.length === 0) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredIndexedData.length);
  const [i, j] = filteredIndexedData[randomIndex];
  tableData[i][j] = new Cell({number: 2, isNew: true});
}

function render({tableData, table}) {
  go(
    tableData,
    zipWithIndexL,
    forEach(([i, row]) => {
      go(
        tableData[i],
        zipWithIndexL,
        forEach(([j, cell]) => {
          const tr = table.children[i].children[j];
          tr.textContent = cell.number === 0 ? '' : cell.number;

          tr.style.color = 'black';
          if(cell.isMerged) {
            tr.style.color = 'lightblue';
            cell.isMerged = false;
          }
          if(cell.isNew) {
            tr.style.color = 'tomato';
            cell.isNew = false;
          }
        })
      )
    })
  );
}

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

window.utils = {
  Direction,
  getDefaultTableData,
  init,
  randomGenerate,
  render,
  getDirection,

};
