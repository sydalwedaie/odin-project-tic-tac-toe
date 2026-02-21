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

// Game controller with players object
function GameController(playerXName = "Player X", playerOName = "Player O") {
  const board = Gameboard();

  const players = [
    { name: playerXName, token: "X" },
    { name: playerOName, token: "O" },
  ];

  let activePlayer = players[0];

  const getActivePlayer = () => activePlayer;
  const switchPlayer = () =>
    (activePlayer = activePlayer === players[0] ? players[1] : players[0]);

  const printNewRound = () => {
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

  const playRound = (cellIndex) => {
    // Don't play a taken cell
    if (board.getValues()[cellIndex] !== null) return;

    // Place a token
    board.placeToken(cellIndex, getActivePlayer().token);

    // Check win condition
    if (checkWin(getActivePlayer().token)) {
      console.log(`${getActivePlayer().name} wins!`);
    } else {
      switchPlayer();
      printNewRound();
    }
  };

  printNewRound();

  return { board: board.getBoard, getActivePlayer, playRound };
}

// Utils
function printTableInConsole(board) {
  const modBoard = board.map((cell) => (cell ? cell : " "));
  const row1 = "| " + modBoard.slice(0, 3).join(" | ") + " |\n";
  const row2 = "| " + modBoard.slice(3, 6).join(" | ") + " |\n";
  const row3 = "| " + modBoard.slice(6).join(" | ") + " |\n";
  const border = "|-" + "---".split("").join("-+-") + "-|\n";

  return row1 + border + row2 + border + row3;
}

// Calls
const game = GameController();
