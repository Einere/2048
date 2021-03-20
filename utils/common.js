const Cell = window.Cell;
const fxjs = window._;
const {go, range, forEach, map, zipWithIndexL, filter, flat} = fxjs;

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
          if(cell.isNew) {
            tr.style.color = 'tomato';
            cell.isNew = false;
          }
          else {
            tr.style.color = 'black';
          }
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
