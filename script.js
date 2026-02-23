// Gameboard function factory
function Gameboard() {
  const board = [];

  for (let i = 0; i < 9; i++) {
    board.push(Cell());
  }

  const getBoard = () => board;

  const placeToken = (cellIndex, token) => {
    let cell = board[cellIndex];
    if (cell.getValue() === null) {
      cell.setValue(token);
    }
  };

  const getValues = () => board.map((cell) => cell.getValue());

  return { getBoard, placeToken, getValues };
}

// Cell function factory with closure
function Cell() {
  let value = null;
  const setValue = (token) => (value = token);
  const getValue = () => value;
  return { setValue, getValue };
}

// State function factory
function GameState() {
  let currentView = "menu";
  let playerOneScore = 0;
  let playerTwoScore = 0;
  let tieCount = 0;

  const getView = () => currentView;
  const getPlayerOneScore = () => playerOneScore;
  const getPlayerTwoScore = () => playerTwoScore;
  const getTieCount = () => tieCount;

  const setView = (view) => (currentView = view);
  const incPlayerOneScore = () => playerOneScore++;
  const incPlayerTwoScore = () => playerTwoScore++;
  const incTieCount = () => tieCount++;

  return {
    getView,
    getPlayerOneScore,
    getPlayerTwoScore,
    getTieCount,
    setView,
    incPlayerOneScore,
    incPlayerTwoScore,
    incTieCount,
  };
}

// Game controller with players object
function GameController(
  playerOneName = "Player X",
  playerTwoName = "Player O"
) {
  const board = Gameboard();

  const players = [
    { name: playerOneName, token: "X" },
    { name: playerTwoName, token: "O" },
  ];

  let activePlayer = players[0];

  const getActivePlayer = () => activePlayer;
  const switchPlayer = () =>
    (activePlayer = activePlayer === players[0] ? players[1] : players[0]);

  const printNewTurn = () => {
    console.log(`It's ${getActivePlayer().name}'s turn...'`);
    console.log(printTableInConsole(board.getValues()));
  };

  const checkWin = (token) => {
    const boardValues = board.getValues();
    const winCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return winCombos.some((combo) => {
      return combo.every((cell) => boardValues[cell] === token);
    });
  };

  const playTurn = (cellIndex) => {
    // Don't play a taken cell
    if (board.getValues()[cellIndex] !== null) return;

    // Place a token
    board.placeToken(cellIndex, getActivePlayer().token);

    // Check win condition
    if (checkWin(getActivePlayer().token)) {
      console.log(`${getActivePlayer().name} wins!`);
      return;
    } else {
      switchPlayer();
      printNewTurn();
    }
  };

  printNewTurn();

  return { getBoard: board.getBoard, getActivePlayer, playTurn };
}

// Utils
function printTableInConsole(board) {
  // Change null values to an empty space
  const modBoard = board.map((cell) => cell || " ");

  const row1 = "| " + modBoard.slice(0, 3).join(" | ") + " |\n";
  const row2 = "| " + modBoard.slice(3, 6).join(" | ") + " |\n";
  const row3 = "| " + modBoard.slice(6).join(" | ") + " |\n";

  const border = "|-" + "---".split("").join("-+-") + "-|\n";

  return row1 + border + row2 + border + row3;
}

// View
function displayController() {
  const $ = (selector) => document.querySelector(selector);
  const activePlayerEl = $(".active-player");
  const boardEl = $(".board");
  const game = GameController();

  function updateScreen() {
    const board = game.getBoard();

    boardEl.textContent = "";
    activePlayerEl.textContent = `It's ${game.getActivePlayer().name}'s turn...`;

    board.forEach((cell, index) => {
      const tableCell = document.createElement("button");
      tableCell.classList.add("cell");
      tableCell.dataset.cell = index;
      tableCell.textContent = cell.getValue();
      boardEl.appendChild(tableCell);
    });
  }

  function boardClickHandler(e) {
    if (!e.target.dataset.cell) return;
    game.playTurn(e.target.dataset.cell);
    updateScreen();
  }

  boardEl.addEventListener("click", boardClickHandler);

  updateScreen();
}

// Calls
const game = GameController();
displayController();
