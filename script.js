// Gameboard function factory
function GameBoard() {
  let board = [];

  for (let i = 0; i < 9; i++) {
    board.push(null);
  }

  const getBoard = () => board;
  const resetBoard = () => board.fill(null);
  const placeToken = (index, token) => {
    let cell = board[index];
    if (cell === null) {
      board[index] = token;
    }
  };

  return { getBoard, resetBoard, placeToken };
}

// State function factory
function GameState() {
  const player1 = {
    name: "Player X",
    score: 0,
    token: "x",
  };
  const player2 = {
    name: "Player O",
    score: 0,
    token: "o",
  };
  let tieCount = 0;
  let activeStatus = "playing"; // playing, win, tie
  let activePlayer = player1;

  const getPlayer1 = () => player1;
  const getPlayer2 = () => player2;
  const getTieCount = () => tieCount;
  const getStatus = () => activeStatus;
  const getActivePlayer = () => activePlayer;

  const setPlayer1Name = (name) => (player1.name = name);
  const setPlayer2Name = (name) => (player2.name = name);
  const resetActivePlayer = () => (activePlayer = player1);
  const incActivePlayerScore = () => activePlayer.score++;
  const incTieCount = () => tieCount++;
  const setStatus = (status) => (activeStatus = status);
  const switchPlayer = () =>
    (activePlayer = activePlayer === player1 ? player2 : player1);

  return {
    getStatus,
    getPlayer1,
    getPlayer2,
    getTieCount,
    getActivePlayer,
    setStatus,
    setPlayer1Name,
    setPlayer2Name,
    resetActivePlayer,
    incActivePlayerScore,
    incTieCount,
    switchPlayer,
  };
}

// Game controller
function CreateRound(board, state) {
  const printBoard = () => {
    if (state.getStatus() === "playing") {
      console.log(`It's ${state.getActivePlayer().name}'s turn...'`);
    } else if (state.getStatus() === "win") {
      console.log(`${state.getActivePlayer().name} wins!`);
    } else {
      console.log("It's a tie!");
    }
    console.log(printTableInConsole(board.getBoard()));
    console.log(
      "X: ",
      state.getPlayer1().score,
      " | ",
      "t: ",
      state.getTieCount(),
      " | ",
      "O: ",
      state.getPlayer2().score
    );
  };

  const checkWin = (token) => {
    const boardValues = board.getBoard();
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

  const playTurn = (index) => {
    console.clear();
    // Don't play a taken cell, stop if game finished
    if (board.getBoard()[index] !== null || state.getStatus() !== "playing")
      return;

    // Place a token
    board.placeToken(index, state.getActivePlayer().token);

    // Check win condition
    if (checkWin(state.getActivePlayer().token)) {
      state.incActivePlayerScore();
      state.setStatus("win");
    } else if (board.getBoard().every((cell) => cell !== null)) {
      console.log("It's a tie!");
      state.incTieCount();
      state.setStatus("tie");
    } else {
      state.switchPlayer();
    }
    printBoard();
  };

  const nextRound = () => {
    console.clear();
    board.resetBoard();
    state.setStatus("playing");
    state.resetActivePlayer();
    printBoard();
  };

  printBoard();

  return { playTurn, nextRound };
}

function GameModel(player1Name, player2Name) {
  const board = GameBoard();
  const state = GameState();

  state.setPlayer1Name(player1Name);
  state.setPlayer2Name(player2Name);

  const round = CreateRound(board, state);

  const getGameState = () => ({
    board: board.getBoard(),
    player1: state.getPlayer1(),
    player2: state.getPlayer2(),
    ties: state.getTieCount(),
    activePlayer: state.getActivePlayer(),
    status: state.getStatus(),
  });

  return {
    playTurn: round.playTurn,
    nextRound: round.nextRound,
    getGameState,
  };
}

function GameView() {
  const $ = (selector) => document.querySelector(selector);

  const setupViewEl = $(".setup-view");
  const gameViewEl = $(".game-view");

  const xNameInput = $("#player-x-name");
  const oNameInput = $("#player-o-name");
  const newGameBtn = $(".new-game-btn");

  const roundModalEl = $(".round-modal");
  const roundModalWinnerEl = $(".round-winner");
  const roundModalResultEl = $(".round-result");
  const roundModalNextRoundBtn = $(".round-modal .affirm");

  const restartBtn = $(".restart-btn");
  const restartModalEl = $(".restart-modal");
  const restartModalRestartBtn = $(".restart-modal .affirm");

  const activePlayerEl = $(".active-player");
  const boardEl = $(".board");
  const nameP1El = $(".stats .name-p1");
  const nameP2El = $(".stats .name-p2");
  const scoreP1El = $(".score-p1 .count");
  const scoreP2El = $(".score-p2 .count");
  const scoreTiesEl = $(".score-ties .count");

  const getPlayerIcon = (token) => {
    if (!token) return "";
    return `<img src="/assets/icon-${token}.svg">`;
  };

  function renderBoard(state) {
    activePlayerEl.innerHTML =
      getPlayerIcon(state.activePlayer.token) + " TURN";
    boardEl.textContent = "";

    state.board.forEach((cell, index) => {
      const tableCell = document.createElement("button");
      tableCell.classList.add("cell");
      tableCell.dataset.cell = index;
      tableCell.innerHTML = getPlayerIcon(cell);
      boardEl.appendChild(tableCell);
    });

    nameP1El.textContent = state.player1.name;
    nameP2El.textContent = state.player2.name;
    scoreP1El.textContent = state.player1.score;
    scoreP2El.textContent = state.player2.score;
    scoreTiesEl.textContent = state.ties;
  }

  function bindNewGameClick(handleGameStart) {
    newGameBtn.addEventListener("click", () => {
      handleGameStart(xNameInput.value || "P1", oNameInput.value || "P2");
    });
  }

  function switchViews() {
    setupViewEl.toggleAttribute("hidden");
    gameViewEl.toggleAttribute("hidden");
  }

  function bindBoardClick(handleTurn) {
    boardEl.addEventListener("click", (e) => {
      if (!e.target.dataset.cell) return;
      handleTurn(e.target.dataset.cell);
    });
  }

  function showRoundModal(state) {
    roundModalEl.showModal();
    if (state.status === "win") {
      roundModalWinnerEl.textContent = `${state.activePlayer.name} WINS!`;
      roundModalResultEl.innerHTML = `${getPlayerIcon(state.activePlayer.token)} TAKES THE ROUND`;
      roundModalResultEl.classList.add(`${state.activePlayer.token}-win`);
    } else if (state.status === "tie") {
      roundModalWinnerEl.style.display = "none";
      roundModalResultEl.textContent = "ROUND TIED";
    }
  }

  function hideRoundModal(state) {
    roundModalResultEl.classList.remove(`${state.activePlayer.token}-win`);
    roundModalEl.close();
  }

  function bindNextRoundClick(handleNextRound) {
    roundModalNextRoundBtn.addEventListener("click", () => {
      handleNextRound();
    });
  }

  function bindRestartClick() {
    restartBtn.addEventListener("click", () => {
      restartModalEl.showModal();
    });
  }

  function bindRestartModalRestartBtnClick(handleRestart) {
    restartModalRestartBtn.addEventListener("click", () => {
      handleRestart();
      xNameInput.value = "";
      oNameInput.value = "";
      restartModalEl.close();
    });
  }

  return {
    renderBoard,
    bindNewGameClick,
    switchViews,
    bindBoardClick,
    showRoundModal,
    hideRoundModal,
    bindNextRoundClick,
    bindRestartClick,
    bindRestartModalRestartBtnClick,
  };
}

function AppController() {
  const view = GameView();
  let game;
  let state;

  view.bindNewGameClick((xName, oName) => {
    game = GameModel(xName, oName);
    state = game.getGameState();
    view.switchViews();
    view.renderBoard(state);
  });

  view.bindBoardClick((index) => {
    game.playTurn(index);
    state = game.getGameState();
    view.renderBoard(state);
    if (state.status === "win" || state.status === "tie") {
      view.showRoundModal(state);
    }
  });

  view.bindNextRoundClick(() => {
    view.hideRoundModal(state); /* must be first */
    game.nextRound();
    state = game.getGameState();
    view.renderBoard(state);
  });

  view.bindRestartClick();
  view.bindRestartModalRestartBtnClick(() => view.switchViews());
}

AppController();

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
