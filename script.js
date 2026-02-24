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
  let currentView = "active"; // menu, active, win, tie, restart
  let playerOneName = "Player X";
  let playerTwoName = "Player O";
  let playerOneScore = 0;
  let playerTwoScore = 0;
  let tieCount = 0;

  const getView = () => currentView;
  const getPlayerOneName = () => playerOneName.toUpperCase();
  const getPlayerTwoName = () => playerTwoName.toUpperCase();
  const getPlayerOneScore = () => playerOneScore;
  const getPlayerTwoScore = () => playerTwoScore;
  const getTieCount = () => tieCount;

  const setView = (view) => (currentView = view);
  const setPlayerOneName = (name) => (playerOneName = name);
  const setPlayerTwoName = (name) => (playerTwoName = name);
  const incPlayerOneScore = () => playerOneScore++;
  const incPlayerTwoScore = () => playerTwoScore++;
  const incTieCount = () => tieCount++;

  return {
    getView,
    getPlayerOneName,
    getPlayerTwoName,
    getPlayerOneScore,
    getPlayerTwoScore,
    getTieCount,
    setView,
    setPlayerOneName,
    setPlayerTwoName,
    incPlayerOneScore,
    incPlayerTwoScore,
    incTieCount,
  };
}

// Game controller with players object
function GameController(gameState) {
  const board = Gameboard();

  const players = [
    { name: gameState.getPlayerOneName(), token: "X" },
    { name: gameState.getPlayerTwoName(), token: "O" },
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
      if (players.indexOf(getActivePlayer()) === 0) {
        gameState.incPlayerOneScore();
      } else {
        gameState.incPlayerTwoScore();
      }
      gameState.setView("win");
    } else if (board.getValues().every((cell) => cell !== null)) {
      console.log("It's a tie!");
      gameState.incTieCount();
      gameState.setView("tie");
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
function displayController(game, gameState) {
  const $ = (selector) => document.querySelector(selector);

  const activePlayerEl = $(".active-player");
  const boardEl = $(".board");
  const nameP1El = $(".stats .name-p1");
  const nameP2El = $(".stats .name-p2");
  const scoreP1El = $(".score-p1 .count");
  const scoreP2El = $(".score-p2 .count");
  const scoreTiesEl = $(".score-ties .count");

  const roundModalEl = $(".round-modal");
  const msgWinnerEl = $(".msg-winner");
  const msgRoundEl = $(".msg-round");
  const nextRoundBtn = $(".round-modal .affirm");
  const quitBtn = $(".round-modal .negative");

  const restartModalEl = $(".restart-modal");
  const restartModalBtn = $(".restart");

  const getPlayerIcon = (token) => {
    if (!token) return "";
    return `<img src="/assets/icon-${token.toLowerCase()}.svg">`;
  };

  function updateScreen() {
    const board = game.getBoard();

    boardEl.textContent = "";
    activePlayerEl.innerHTML = `${getPlayerIcon(game.getActivePlayer().token)} TURN`;

    board.forEach((cell, index) => {
      const tableCell = document.createElement("button");
      tableCell.classList.add("cell");
      tableCell.dataset.cell = index;
      tableCell.innerHTML = getPlayerIcon(cell.getValue());
      boardEl.appendChild(tableCell);
    });

    nameP1El.textContent = gameState.getPlayerOneName();
    nameP2El.textContent = gameState.getPlayerTwoName();
    scoreP1El.textContent = gameState.getPlayerOneScore();
    scoreP2El.textContent = gameState.getPlayerTwoScore();
    scoreTiesEl.textContent = gameState.getTieCount();
  }

  function boardClickHandler(e) {
    if (!e.target.dataset.cell) return;
    game.playTurn(e.target.dataset.cell);
    updateScreen();
    if (gameState.getView() === "win") {
      roundModalEl.showModal();
      msgWinnerEl.textContent = `${game.getActivePlayer().name} WINS!`;
      msgRoundEl.innerHTML = `${getPlayerIcon(game.getActivePlayer().token)} TAKES THE ROUND`;
    } else if (gameState.getView() === "tie") {
      roundModalEl.showModal();
      msgWinnerEl.style.display = "none";
      msgRoundEl.textContent = "ROUND TIED";
      msgRoundEl.classList.add("round-tied");
    }
  }

  function nextRoundClickHandler() {
    roundModalEl.close();
    gameState.setView("active");
    game = GameController(gameState);
    updateScreen();
  }

  function quitBtnHandler() {
    roundModalEl.close();
    boardEl.removeEventListener("click", boardClickHandler);
  }

  boardEl.addEventListener("click", boardClickHandler);
  nextRoundBtn.addEventListener("click", nextRoundClickHandler);
  restartModalBtn.addEventListener("click", () => restartModalEl.showModal());
  quitBtn.addEventListener("click", quitBtnHandler);

  updateScreen();
}

function switchView() {
  const $ = (selector) => document.querySelector(selector);
  const setupViewEl = $(".setup-view");
  const gameViewEl = $(".game-view");

  setupViewEl.toggleAttribute("hidden");
  gameViewEl.toggleAttribute("hidden");
}

function newGame() {
  const $ = (selector) => document.querySelector(selector);
  const playerXNameInput = $("#player-x-name");
  const playerONameInput = $("#player-o-name");

  let gameState = GameState();
  gameState.setPlayerOneName(playerXNameInput.value || "Player X");
  gameState.setPlayerTwoName(playerONameInput.value || "Player O");

  let game = GameController(gameState);

  switchView();
  displayController(game, gameState);
}

function restartGame() {
  const $ = (selector) => document.querySelector(selector);
  const restartModalEl = $(".restart-modal");
  restartModalEl.close();
  switchView();
}

function start() {
  const newGameBtn = document.querySelector(".new-game");
  const restartBtn = document.querySelector(".restart-modal .affirm");
  restartBtn.addEventListener("click", restartGame);
  newGameBtn.addEventListener("click", newGame);
}

start();
