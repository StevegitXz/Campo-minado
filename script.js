class MinesweeperGame {
  constructor() {
    this.currentPhase = 1;
    this.maxPhases = 5;
    this.board = [];
    this.gameOver = false;
    this.rows = 0;
    this.cols = 0;
    this.isGameStarted = false;

    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.welcomeScreen = document.getElementById('welcomeScreen');
    this.gameContainer = document.getElementById('gameContainer');
    this.aboutSection = document.getElementById('aboutSection');
    this.gameGrid = document.getElementById('gameGrid');
    this.currentPhaseEl = document.getElementById('currentPhase');
    this.progressEl = document.getElementById('progress');
    this.gameStatusEl = document.getElementById('gameStatus');
    this.hintText = document.getElementById('hintText');
    this.statusMessage = document.getElementById('statusMessage');
    this.retryButton = document.getElementById('retryButton');
    this.nextPhaseButton = document.getElementById('nextPhaseButton');
    this.startButton = document.getElementById('startButton');
  }

  bindEvents() {
    this.startButton.addEventListener('click', () => this.startGame());
    this.retryButton.addEventListener('click', () => this.retryPhase());
    this.nextPhaseButton.addEventListener('click', () => this.nextPhase());
  }

  startGame() {
    this.welcomeScreen.style.display = 'none';
    this.gameContainer.style.display = 'block';
    this.aboutSection.style.display = 'block';
    this.isGameStarted = true;
    this.createBoard();
  }

  getBoardSize() {
    return this.currentPhase === 5 ? { rows: 9, cols: 9 } : { rows: 5, cols: 5 };
  }

  createBoard() {
    const size = this.getBoardSize();
    this.rows = size.rows;
    this.cols = size.cols;

    this.gameGrid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    this.board = [];
    this.gameGrid.innerHTML = "";
    this.gameOver = false;

    this.updateGameInfo();
    this.updateHint();
    this.hideButtons();

    // Criar células
    for (let r = 0; r < this.rows; r++) {
      this.board[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener("click", (e) => this.revealCell(e));

        this.board[r][c] = {
          mine: false,
          revealed: false,
          element: cell,
          count: 0
        };

        this.gameGrid.appendChild(cell);
      }
    }

    this.applyMinePattern();
    this.calculateCounts();
  }

  defineMineByphase(i, j, phase) {
    switch (phase) {
      case 1:
        return i === j || i + j === this.rows - 1;
      case 2:
        return (i + 1) % 2 === 0;
      case 3:
        return i < j;
      case 4:
        return (i * i - 3 * j) < 0;
      case 5:
        if (i % 2 === 0 && i % 4 === 0) return true;
        if (i % 2 === 1 && j % 3 === 0) return true;
        return false;
      default:
        return false;
    }
  }

  getPhaseDescription(phase) {
    const descriptions = {
      1: "🟰 As bombas estão nas diagonais principais e secundárias da matriz.",
      2: "📏 As bombas estão posicionadas em todas as linhas pares (índices pares).",
      3: "🔺 As bombas formam uma matriz triangular superior (i < j).",
      4: "🧮 As bombas estão onde a função aᵢⱼ = i² - 3j resulta em valor negativo.",
      5: "🔀 Padrão complexo: linhas pares divisíveis por 4 e colunas múltiplas de 3 nas linhas ímpares."
    };
    return descriptions[phase] || "";
  }

  applyMinePattern() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.defineMineByphase(i, j, this.currentPhase)) {
          this.board[i][j].mine = true;
        }
      }
    }
  }

  calculateCounts() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c].mine) continue;

        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
              if (this.board[nr][nc].mine) count++;
            }
          }
        }
        this.board[r][c].count = count;
      }
    }
  }

  revealCell(e) {
    if (this.gameOver) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const cell = this.board[row][col];

    if (cell.revealed) return;

    cell.revealed = true;
    cell.element.classList.add("revealed");

    if (cell.mine) {
      cell.element.classList.add("mine");
      cell.element.textContent = "💣";
      this.gameOver = true;
      this.showGameOverMessage();
      this.revealAllMines();
      this.retryButton.style.display = "inline-block";
      return;
    }

    if (cell.count > 0) {
      cell.element.textContent = cell.count;
      cell.element.classList.add("safe");
    } else {
      cell.element.textContent = "✓";
      this.revealAdjacent(row, col);
    }

    this.checkWin();
  }

  revealAdjacent(r, c) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          const neighbor = this.board[nr][nc];
          if (!neighbor.revealed && !neighbor.mine) {
            neighbor.revealed = true;
            neighbor.element.classList.add("revealed");
            if (neighbor.count > 0) {
              neighbor.element.textContent = neighbor.count;
              neighbor.element.classList.add("safe");
            } else {
              neighbor.element.textContent = "✓";
              this.revealAdjacent(nr, nc);
            }
          }
        }
      }
    }
  }

  revealAllMines() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.board[r][c];
        if (cell.mine && !cell.revealed) {
          cell.element.classList.add("mine");
          cell.element.textContent = "💣";
        }
      }
    }
  }

  checkWin() {
    let revealedCount = 0;
    let totalMines = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c].revealed) revealedCount++;
        if (this.board[r][c].mine) totalMines++;
      }
    }

    if (revealedCount === this.rows * this.cols - totalMines) {
      this.gameOver = true;
      if (this.currentPhase < this.maxPhases) {
        this.showPhaseCompleteMessage();
        this.nextPhaseButton.style.display = "inline-block";
      } else {
        this.showGameCompleteMessage();
      }
    }
  }

  showGameOverMessage() {
    this.statusMessage.textContent = `💥 Missão falhou! Você atingiu uma bomba na Fase ${this.currentPhase}`;
    this.statusMessage.className = "status-message status-danger";
    this.statusMessage.style.display = "block";
    this.gameStatusEl.textContent = "Eliminado";
    this.gameStatusEl.style.color = "#ff6b6b";
  }

  showPhaseCompleteMessage() {
    this.statusMessage.textContent = `🎉 Fase ${this.currentPhase} conquistada! Parabéns, agente!`;
    this.statusMessage.className = "status-message status-success";
    this.statusMessage.style.display = "block";
    this.gameStatusEl.textContent = "Venceu!";
    this.gameStatusEl.style.color = "#26de81";
  }

  showGameCompleteMessage() {
    this.statusMessage.textContent = `🏆 MISSÃO COMPLETA! Você dominou todas as 5 fases das matrizes matemáticas!`;
    this.statusMessage.className = "status-message status-success";
    this.statusMessage.style.display = "block";
    this.gameStatusEl.textContent = "Mestre!";
    this.gameStatusEl.style.color = "#ffd700";
  }

  retryPhase() {
    this.createBoard();
  }

  nextPhase() {
    if (this.currentPhase < this.maxPhases) {
      this.currentPhase++;
      this.createBoard();
    }
  }

  updateGameInfo() {
    this.currentPhaseEl.textContent = this.currentPhase;
    this.progressEl.textContent = `${this.currentPhase}/${this.maxPhases}`;
    this.gameStatusEl.textContent = "Em jogo";
    this.gameStatusEl.style.color = "#4ecdc4";
  }

  updateHint() {
    this.hintText.innerHTML = this.getPhaseDescription(this.currentPhase);
  }

  hideButtons() {
    this.statusMessage.style.display = "none";
    this.retryButton.style.display = "none";
    this.nextPhaseButton.style.display = "none";
  }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  new MinesweeperGame();
});

// Efeitos sonoros simulados (feedback visual)
function createRippleEffect(element, color = '#4ecdc4') {
  const ripple = document.createElement('div');
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.background = color;
  ripple.style.transform = 'scale(0)';
  ripple.style.animation = 'ripple 0.6s linear';
  ripple.style.pointerEvents = 'none';

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = rect.left + rect.width / 2 - size / 2 + 'px';
  ripple.style.top = rect.top + rect.height / 2 - size / 2 + 'px';

  document.body.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Adicionar efeito ripple aos botões
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn')) {
    createRippleEffect(e.target);
  }
});

// Adicionar animação de entrada para as células
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'slideInUp 0.3s ease-out forwards';
    }
  });
});

// Observar células quando forem criadas
const originalCreateBoard = MinesweeperGame.prototype.createBoard;
MinesweeperGame.prototype.createBoard = function () {
  originalCreateBoard.call(this);

  // Animar entrada das células
  const cells = this.gameGrid.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.style.opacity = '0';
    cell.style.transform = 'translateY(20px)';
    setTimeout(() => {
      cell.style.transition = 'all 0.3s ease-out';
      cell.style.opacity = '1';
      cell.style.transform = 'translateY(0)';
    }, index * 20);
  });
};
const game = new MinesweeperGame();
