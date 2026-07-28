(() => {
  const boardElement = document.querySelector('#mine-board');
  if (!boardElement) return;

  const size = 20;
  const mineCount = 40;
  const timeElement = document.querySelector('#mine-time');
  const statusElement = document.querySelector('#mine-status');
  let board = [];
  let state = 'ready';
  let timerId = null;
  let startedAt = 0;
  let revealedCount = 0;

  function setStatus(message) { statusElement.textContent = message; }

  function neighbors(cell) {
    const result = [];
    for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
      if (!dx && !dy) continue;
      const x = cell.x + dx;
      const y = cell.y + dy;
      if (x >= 0 && x < size && y >= 0 && y < size) result.push(board[y][x]);
    }
    return result;
  }

  function reset() {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
    state = 'ready';
    startedAt = 0;
    revealedCount = 0;
    document.querySelector('#mine-time').textContent = '0s';
    board = Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => ({ x, y, mine: false, adjacent: 0, revealed: false })));
    const positions = Array.from({ length: size * size }, (_, index) => index);
    for (let index = positions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [positions[index], positions[swapIndex]] = [positions[swapIndex], positions[index]];
    }
    positions.slice(0, mineCount).forEach((position) => { board[Math.floor(position / size)][position % size].mine = true; });
    board.forEach((row) => row.forEach((cell) => { cell.adjacent = neighbors(cell).filter((neighbor) => neighbor.mine).length; }));
    setStatus('Ready');
    render();
  }

  function render(revealMines = false) {
    boardElement.replaceChildren();
    board.forEach((row) => row.forEach((cell) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mine-cell';
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', cell.revealed ? `공개된 칸 ${cell.adjacent}` : '닫힌 칸');
      if (cell.revealed || (revealMines && cell.mine)) {
        button.classList.add('revealed');
        if (cell.mine) { button.classList.add('mine'); button.textContent = '✦'; }
        else if (cell.adjacent > 0) button.textContent = String(cell.adjacent);
      }
      button.addEventListener('click', () => reveal(cell.x, cell.y));
      boardElement.append(button);
    }));
  }

  function start() {
    if (state === 'running' || timerId !== null) return;
    if (state === 'success' || state === 'failed') reset();
    state = 'running';
    startedAt = Date.now();
    setStatus('Running');
    timerId = setInterval(() => { document.querySelector('#mine-time').textContent = `${Math.floor((Date.now() - startedAt) / 1000)}s`; }, 1000);
  }

  function floodReveal(startCell) {
    const queue = [startCell];
    while (queue.length) {
      const cell = queue.shift();
      if (cell.revealed || cell.mine) continue;
      cell.revealed = true;
      revealedCount += 1;
      if (cell.adjacent === 0) neighbors(cell).forEach((neighbor) => { if (!neighbor.revealed && !neighbor.mine) queue.push(neighbor); });
    }
  }

  function finish(success) {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
    state = success ? 'success' : 'failed';
    setStatus(success ? 'Success' : 'Game over');
    render(!success);
  }

  function reveal(x, y) {
    if (state === 'ready') start();
    if (state !== 'running') return;
    const cell = board[y][x];
    if (cell.revealed) return;
    if (cell.mine) return finish(false);
    floodReveal(cell);
    if (revealedCount >= size * size - mineCount) finish(true);
    render();
  }

  document.querySelectorAll('[data-mine-action]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.mineAction === 'start') start();
    if (button.dataset.mineAction === 'restart') reset();
  }));

  reset();
})();
