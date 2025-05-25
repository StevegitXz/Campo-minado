const game = document.getElementById("game");
const conteudo = document.getElementById("conteudo");
const status = document.getElementById("status");
const hint = document.getElementById("hint");
const retryButton = document.getElementById("retry");

const inicio = document.getElementById("inicio");
const startButton = document.getElementById("startButton");

let faseAtual = 1;
let board = [];
let gameOver = false;
let rows, cols;

function getBoardSize() {
  if (faseAtual === 5) return { rows: 9, cols: 9 };
  return { rows: 5, cols: 5 };
}

function createBoard() {
  const size = getBoardSize();
  rows = size.rows;
  cols = size.cols;
  game.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  board = [];
  game.innerHTML = "";
  gameOver = false;
  status.textContent = `Fase ${faseAtual}`;
  hint.innerHTML = obterDescricaoDaFase(faseAtual);
  retryButton.style.display = "none";

  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", revealCell);

      board[r][c] = {
        mine: false,
        revealed: false,
        element: cell,
        count: 0
      };

      game.appendChild(cell);
    }
  }

  aplicarLeiDeFormacao(faseAtual);
  calculateCounts();
}

function definirBombaPorFase(i, j, fase) {
  switch (fase) {
    case 1:
      return i === j || i + j === rows - 1;
    case 2:
      return (i + 1) % 2 === 0;
    case 3:
      return i < j;
    case 4:
      return (i * i - 3 * j) < 0;
    case 5:
      if (i % 2 === 0 && i % 4 === 0) {
        return true;
      } else if (i % 2 === 1 && j % 3 === 0) {
        return true;
      }
      return false;
    default:
      return false;
  }
}


function obterDescricaoDaFase(fase) {
  switch (fase) {
    case 1:
      return "🟰 As bombas estão nas diagonais principais e secundárias.";
    case 2:
      return "📏 As bombas estão em todas as linhas pares.";
    case 3:
      return "🔺 As bombas estão na parte triangular superior.";
    case 4:
      return "🧮 As bombas estão onde `aᵢⱼ = i² - 3j` resulta em valor negativo.";
    case 5:
      return "🔀 As bombas estão nas linhas pares divisíveis por 4 (linha 0 e 4) e, nas linhas ímpares, nas colunas múltiplas de 3.";

    default:
      return "";
  }
}

function aplicarLeiDeFormacao(fase) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (definirBombaPorFase(i, j, fase)) {
        board[i][j].mine = true;
      }
    }
  }
}

function calculateCounts() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (board[nr][nc].mine) count++;
          }
        }
      }

      board[r][c].count = count;
    }
  }
}

function revealCell(e) {
  if (gameOver) return;

  const row = parseInt(this.dataset.row);
  const col = parseInt(this.dataset.col);
  const cell = board[row][col];

  if (cell.revealed) return;

  cell.revealed = true;
  cell.element.classList.add("revealed");

  if (cell.mine) {
    cell.element.classList.add("mine");
    cell.element.textContent = "💣";
    status.textContent = `💥 Game Over! Fase ${faseAtual}`;
    gameOver = true;
    revealAllMines();
    retryButton.style.display = "inline-block";
    return;
  }

  if (cell.count > 0) {
    cell.element.textContent = "✔️";
  } else {
    revealAdjacent(row, col);
  }

  checkWin();
}

function revealAdjacent(r, c) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = board[nr][nc];
        if (!neighbor.revealed && !neighbor.mine) {
          neighbor.revealed = true;
          neighbor.element.classList.add("revealed");
          if (neighbor.count > 0) {
            neighbor.element.textContent = "";
          } else {
            revealAdjacent(nr, nc);
          }
        }
      }
    }
  }
}

function revealAllMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell.mine) {
        cell.element.classList.add("mine");
        cell.element.textContent = "💣";
      }
    }
  }
}

function checkWin() {
  let revealedCount = 0;
  let totalBombas = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].revealed) revealedCount++;
      if (board[r][c].mine) totalBombas++;
    }
  }

  if (revealedCount === rows * cols - totalBombas) {
    if (faseAtual < 5) {
      status.textContent = `✅ Fase ${faseAtual} concluída! Indo para fase ${faseAtual + 1}...`;
      faseAtual++;
      setTimeout(createBoard, 2000);
    } else {
      status.textContent = "🏁 Você venceu todas as fases!";
      gameOver = true;
    }
  }
}

retryButton.addEventListener("click", () => {
  createBoard();
});

createBoard();

startButton.addEventListener("click", () => {
  inicio.style.display = "none";

  game.style.display = "grid";
  conteudo.style.display = "none";
  status.style.display = "block";
  hint.style.display = "block";
  retryButton.style.display = "none";

  faseAtual = 1;
  createBoard();
});
