const fxjs = window._;
const {go, range, forEach, map, zipWithIndexL, filter, flat} = fxjs;
const table = document.getElementById('table');
const tableData = [];
const dimension = 4;

function init() {
  const fragment = document.createDocumentFragment();

  go(
    range(dimension),
    forEach(() => {
      const tr = document.createElement('tr');
      const rowData = [];

      go(
        range(dimension),
        forEach(() => {
          const cellData = 0;
          rowData.push(cellData);
          const td = document.createElement('td');
          tr.appendChild(td);
        })
      )

      tableData.push(rowData);
      fragment.appendChild(tr);
    })
  )
  table.appendChild(fragment);
}

function randomGenerate() {
  const filteredIndexedData = go(
    tableData,
    zipWithIndexL,
    map(([i, row]) => go(
      tableData[i],
      zipWithIndexL,
      map(([j, column]) => [i, j, column])
    )),
    flat,
    filter(indexedData => indexedData[2] === 0)
  );

  const randomIndex = Math.floor(Math.random() * filteredIndexedData.length);
  const [i, j] = filteredIndexedData[randomIndex];
  tableData[i][j] = 2;

  render();
}

function render() {
  go(
    tableData,
    zipWithIndexL,
    forEach(([i, row]) => {
      go(
        tableData[i],
        zipWithIndexL,
        forEach(([j, column]) => {
          table.children[i].children[j].textContent = column === 0 ? '' : column;
          // table.children[i].children[j].textContent = column;
        })
      )
    })
  );
}


init();
render();
randomGenerate();

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
  // 브라우저에서 y는 아래로 갈수록 +의 무한대에 가까워지기 때문에, 데카르트 좌표계로 조건을 판단하기 위해서는 뒤집어줘야 한다.
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
  }

  isMouseClicked = false;
  isMouseMoved = false;
});
