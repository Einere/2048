const fxjs = window._;
const {go, range, forEach, map, zipWithIndexL, filter, flat} = fxjs;

function getDefaultTableData(dimension) {
  return go(
    range(dimension),
    map(_ => {
      const row = new Array(dimension);
      row.fill(0);

      return row;
    })
  );
}

function init({table, dimension}) {
  const fragment = document.createDocumentFragment();
  const tableData = getDefaultTableData(dimension);

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
      map(([j, column]) => [i, j, column])
    )),
    flat,
    filter(indexedData => indexedData[2] === 0)
  );

  const randomIndex = Math.floor(Math.random() * filteredIndexedData.length);
  const [i, j] = filteredIndexedData[randomIndex];
  tableData[i][j] = 2;
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
          table.children[i].children[j].textContent = cell === 0 ? '' : cell;
        })
      )
    })
  );
}

window.utils = {
  getDefaultTableData,
  init,
  randomGenerate,
  render,
};
