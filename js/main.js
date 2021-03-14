const fxjs = window._;
const {go, range, forEach, map, zipWithIndexL, filter, flat} = fxjs;
const table = document.getElementById('table');
const data = [];
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

      data.push(rowData);
      fragment.appendChild(tr);
    })
  )
  table.appendChild(fragment);
}

function randomGenerate() {
  const filteredIndexedData = go(
    data,
    zipWithIndexL,
    map(([i, row]) => go(
      data[i],
      zipWithIndexL,
      map(([j, column]) => [i, j, column])
    )),
    flat,
    filter(indexedData => indexedData[2] === 0)
  );

  console.log(filteredIndexedData);

  const randomIndex = Math.floor(Math.random() * filteredIndexedData.length);
  const [i, j] = filteredIndexedData[randomIndex];
  data[i][j] = 2;

  render();
}

function render() {
  go(
    data,
    zipWithIndexL,
    forEach(([i, row]) => {
      console.log('row', i, row);
      go(
        data[i],
        zipWithIndexL,
        forEach(([j, column]) => {
          console.log('column', j, column);
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

