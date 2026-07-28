(() => {
  const board = document.querySelector('#game-board');
  if (!board) return;

  const size = 20;
  const tickMs = 140;
  const scoreElement = document.querySelector('#game-score');
  const statusElement = document.querySelector('#game-status');
  const bestElement = document.querySelector('#game-best');
  const actions = document.querySelectorAll('[data-game-action]');
  const directionButtons = document.querySelectorAll('[data-direction]');
  const directions = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
  };
  const keyDirections = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  let snake = [];
  let food = null;
  let direction = directions.right;
  let queuedDirection = direction;
  let timerId = null;
  let state = 'ready';
  let score = 0;

  function setStatus(message) { statusElement.textContent = message; }

  function reset() {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    direction = directions.right;
    queuedDirection = direction;
    score = 0;
    food = randomFood();
    state = 'ready';
    scoreElement.textContent = score;
    setStatus('Ready');
    render();
  }

  function randomFood() {
    const open = [];
    for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) open.push({ x, y });
    }
    return open[Math.floor(Math.random() * open.length)] || null;
  }

  function render() {
    board.replaceChildren();
    const snakeParts = new Set(snake.map((part) => `${part.x}:${part.y}`));
    for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
      const cell = document.createElement('span');
      cell.className = 'game-cell';
      if (snakeParts.has(`${x}:${y}`)) cell.classList.add('snake');
      if (food && food.x === x && food.y === y) cell.classList.add('food');
      board.append(cell);
    }
  }

  function isOpposite(next) { return next.x + direction.x === 0 && next.y + direction.y === 0; }

  function setDirection(name) {
    const next = directions[name];
    if (!next || isOpposite(next)) return;
    queuedDirection = next;
  }

  function step() {
    direction = queuedDirection;
    const head = snake[0];
    const next = { x: head.x + direction.x, y: head.y + direction.y };
    const hitWall = next.x < 0 || next.x >= size || next.y < 0 || next.y >= size;
    const hitSelf = snake.some((part) => part.x === next.x && part.y === next.y);
    if (hitWall || hitSelf) return endGame();

    snake.unshift(next);
    if (food && next.x === food.x && next.y === food.y) {
      score = Math.min(100, snake.length);
      scoreElement.textContent = score;
      food = randomFood();
    } else {
      snake.pop();
    }
    render();
  }

  function start() {
    if (state === 'running' || timerId !== null) return;
    if (state === 'over') reset();
    state = 'running';
    setStatus('Running');
    timerId = setInterval(step, tickMs);
  }

  function pause() {
    if (state === 'running') {
      state = 'paused';
      clearInterval(timerId);
      timerId = null;
      setStatus('Paused');
      return;
    }
    if (state === 'paused') {
      state = 'running';
      timerId = setInterval(step, tickMs);
      setStatus('Running');
    }
  }

  function endGame() {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
    state = 'over';
    setStatus('Game over');
    saveBestIfAvailable(score);
    snake = [];
    food = null;
    render();
  }

  function saveBestIfAvailable(value) {
    const store = window.GAME_SCORE_STORE;
    if (!store || typeof store.get !== 'function' || typeof store.set !== 'function' || !bestElement) return;
    const previous = Number(store.get()) || 0;
    const best = Math.max(previous, value);
    store.set(best);
    bestElement.hidden = false;
    bestElement.querySelector('strong').textContent = best;
  }

  actions.forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.gameAction;
    if (action === 'start') start();
    if (action === 'pause') pause();
    if (action === 'restart') reset();
  }));
  directionButtons.forEach((button) => {
    button.addEventListener('pointerdown', (event) => { event.preventDefault(); setDirection(button.dataset.direction); if (state === 'ready') start(); });
  });
  document.addEventListener('keydown', (event) => {
    const name = keyDirections[event.key];
    if (!name) return;
    event.preventDefault();
    setDirection(name);
    if (state === 'ready') start();
  });

  reset();
})();
