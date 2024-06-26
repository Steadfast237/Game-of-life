let grid = [];
let gridSize = 32;

function populateGrid() {
  for (let row = 1; row <= gridSize; row++) {
    const arr = [];
    grid.push(arr);

    for (let col = 1; col <= gridSize; col++) {
      arr.push(0);
    }
  }
}

function searchNeighbors(cell, arr, cellID) {
  const cellRow = Number(cell.split('_')[0]);
  const cellCol = Number(cell.split('_')[1]);

  if (grid[cellRow] === undefined) return arr;

  arr = isNaN(grid[cellRow][cellCol - 1])
    ? arr
    : [...arr, `${cellRow}_${cellCol - 1}`];

  arr = cell === cellID ? arr : [...arr, cell];

  arr = isNaN(grid[cellRow][cellCol + 1])
    ? arr
    : [...arr, `${cellRow}_${cellCol + 1}`];

  return arr;
}

function getNeighbors(cell) {
  let cellNeighbors = [];

  const cellRow = Number(cell.split('_')[0]);
  const cellCol = Number(cell.split('_')[1]);
  const topCell = `${cellRow - 1}_${cellCol}`;
  const bottomCell = `${cellRow + 1}_${cellCol}`;

  cellNeighbors = searchNeighbors(topCell, cellNeighbors, cell);
  cellNeighbors = searchNeighbors(cell, cellNeighbors, cell);
  cellNeighbors = searchNeighbors(bottomCell, cellNeighbors, cell);

  return cellNeighbors;
}

function countNeighbors(arr) {
  return arr.reduce((acc, cell) => {
    const cellRow = Number(cell.split('_')[0]);
    const cellCol = Number(cell.split('_')[1]);
    const cellValue = grid[cellRow][cellCol];

    if (cellValue === 1) {
      acc = acc + 1;
    }
    return acc;
  }, 0);
}

function validateCell(numberOfLiveNeighbors, cell) {
  /**
    1. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
    2. Any live cell with two or three live neighbors lives on to the next generation.
    3. Any live cell with fewer than two live neighbors dies, as if by underpopulated.
    4. Any live cell with more than three live neighbors dies, as if by overpopulation.
   * */

  const cellRow = Number(cell.split('_')[0]);
  const cellCol = Number(cell.split('_')[1]);
  const cellValue = grid[cellRow][cellCol];

  if (cellValue === 0 && numberOfLiveNeighbors === 3) {
    return `${cell}/${1}`;
  }

  if (cellValue === 1) {
    if (numberOfLiveNeighbors === 2 || numberOfLiveNeighbors === 3) {
      return `${cell}/${1}`;
    }

    if (numberOfLiveNeighbors < 2 || numberOfLiveNeighbors > 3) {
      return `${cell}/${0}`;
    }
  }
}

function liveOrDeath(cellValue, arr) {
  grid
    .map((row, rowID) =>
      row.map((col, colID) => col === cellValue && `${rowID}_${colID}`)
    )
    .flat(2)
    .filter((el) => el)
    .forEach((cell) => {
      const cellNeighbors = getNeighbors(cell);
      const numberOfLiveNeighbors = countNeighbors(cellNeighbors, cell);

      validateCell(numberOfLiveNeighbors, cell) &&
        arr.push(validateCell(numberOfLiveNeighbors, cell));
    });

  return arr;
}

function playRound() {
  const results = [];

  liveOrDeath(1, results);
  liveOrDeath(0, results);

  results.forEach((element) => {
    const cellRow = Number(element.split('/')[0].split('_')[0]);
    const cellCol = Number(element.split('/')[0].split('_')[1]);
    const cellValue = Number(element.split('/')[1]);

    grid[cellRow][cellCol] = cellValue;
  });

  return results;
}

populateGrid();

// DOM
const container = document.querySelector('.container');
const buttonStart = document.querySelector('.btn-start');

function generateGrid() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const square = document.createElement('div');

      square.style.width = `${535 / gridSize}px`;
      square.style.outline = '1px solid grey';
      square.style.height = 'auto';
      square.dataset.position = `${row}_${col}`;

      container.appendChild(square);
    }
  }
}

generateGrid();

container.addEventListener('click', function (e) {
  const node = e.target;

  const cell = node.dataset.position;
  const cellRow = Number(cell.split('_')[0]);
  const cellCol = Number(cell.split('_')[1]);
  const cellValue = grid[cellRow][cellCol];

  node.classList.toggle('alive');
  grid[cellRow][cellCol] = cellValue === 0 ? 1 : 0;
});

buttonStart.addEventListener('click', function (e) {
  setInterval(() => {
    const domResult = playRound();

    domResult.forEach((element) => {
      const cellRow = Number(element.split('/')[0].split('_')[0]);
      const cellCol = Number(element.split('/')[0].split('_')[1]);
      const cellValue = Number(element.split('/')[1]);

      const node = document.querySelector(
        `div[data-position='${cellRow}_${cellCol}']`
      );

      cellValue === 1
        ? node.classList.add('alive')
        : node.classList.remove('alive');
    });
  }, 20);
});
