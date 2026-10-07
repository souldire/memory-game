// TODO: разобрать проект еще раз или написать код еще раз для закрепления

const CARDS = [
  "drest",
  "fetid",
  "ghuun",
  "isiset",
  "mutanus",
  "ravitz",
  "setesh",
  "zerontu",
];

function shuffleCards() {
  // ... раскладывает оригинал массива в новый
  const shuffledCards = [...CARDS, ...CARDS];

  console.log(shuffledCards);

  for (let i = shuffledCards.length - 1; i > 0; i--) {
    // TODO: изучить такую запись const j = Math.floor(Math.random() * (i + 1));
    const sides = i + 1;
    const fraction = Math.random();
    const scaled = fraction * sides;
    const j = Math.floor(scaled);

    console.log("-----------------");
    console.log(
      "i:",
      i,
      "sides:",
      sides,
      "j:",
      j,
      "fraction:",
      fraction,
      "scaled:",
      scaled,
    );

    // TODO: изучить такую запись [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    const temp = shuffledCards[i];
    shuffledCards[i] = shuffledCards[j];
    shuffledCards[j] = temp;
  }

  console.log("shuffledCards:", shuffledCards);

  return shuffledCards;
}

let cardDeck = shuffleCards();

let firstCard = null;
let lockBoard = false;

// счетчики ходов и совпадений
let moves = 0;
let pairs = 0;

// переменные для вывода счетчиов на страницу
let movesEl = null;
let pairsEl = null;

let flipTimer = null;
let gameFieldEl = null;

function handleCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (firstCard === null) {
    firstCard = card;
    return;
  }

  moves += 1;
  movesEl.textContent = moves;

  if (card.dataset.cardName === firstCard.dataset.cardName) {
    card.classList.add("matched");
    firstCard.classList.add("matched");
    pairs += 1;
    pairsEl.textContent = pairs;
    if (pairs === CARDS.length) {
      showWin();
    }
    firstCard = null;
  } else {
    lockBoard = true;
    flipTimer = setTimeout(() => {
      card.classList.remove("flipped");
      firstCard.classList.remove("flipped");
      firstCard = null;
      lockBoard = false;
    }, 1000);
  }
}

function createModal() {
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

  const box = document.createElement("div");
  box.classList.add("modal");

  overlay.append(box);
  document.body.append(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
    }
  });

  function open() {
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }

  return { box, open, close };
}

const winModal = createModal();
const leaderboardModal = createModal();

function formatDate(timestamp) {
  const date = new Date(timestamp);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function showLeaderboard() {
  const title = document.createElement("h2");
  title.textContent = "Таблица лидеров";

  const list = document.createElement("ol");
  list.classList.add("leaderboard-list");

  const closeButton = document.createElement("button");
  closeButton.textContent = "Закрыть";
  closeButton.addEventListener("click", () => leaderboardModal.close());

  const results = loadResults();

  results.sort((a, b) => {
    if (a.moves !== b.moves) {
      return a.moves - b.moves;
    }
    return a.date - b.date;
  });

  const top = results.slice(0, 10);

  for (let i = 0; i < top.length; i += 1) {
    const row = document.createElement("li");

    const place = document.createElement("span");
    place.textContent = `${i + 1}.`;

    const movesInfo = document.createElement("span");
    movesInfo.textContent = `${top[i].moves} ходов`;

    const dateInfo = document.createElement("span");
    dateInfo.textContent = formatDate(top[i].date);

    row.append(place, movesInfo, dateInfo);
    list.append(row);
  }

  if (top.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Пока нет результатов";
    leaderboardModal.box.replaceChildren(title, emptyMessage, closeButton);
  } else {
    leaderboardModal.box.replaceChildren(title, list, closeButton);
  }

  leaderboardModal.open();
}

const RESULTS_KEY = "memory-game.results";

function loadResults() {
  const raw = localStorage.getItem(RESULTS_KEY);
  if (raw === null) {
    return [];
  }
  return JSON.parse(raw);
}

function saveResult(movesCount) {
  const results = loadResults();

  const result = {
    moves: movesCount,
    date: Date.now(),
  };

  const isDuplicate = results.some(
    (item) =>
      item.moves === result.moves &&
      new Date(item.date).toDateString() === new Date(result.date).toDateString()
  );

  if (isDuplicate) {
    return;
  }

  results.push(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

function showWin() {
  saveResult(moves);

  const title = document.createElement("h2");
  title.textContent = "Победа!";

  const text = document.createElement("p");
  text.textContent = `Вы нашли все пары за ${moves} ходов`;

  const playAgain = document.createElement("button");
  playAgain.textContent = "Новая игра";
  playAgain.addEventListener("click", startNewGame);

  const closeButton = document.createElement("button");
  closeButton.textContent = "Закрыть";
  closeButton.addEventListener("click", () => winModal.close());

  winModal.box.replaceChildren(title, text, playAgain, closeButton);
  winModal.open();
}

function startNewGame() {
  clearTimeout(flipTimer);

  firstCard = null;
  lockBoard = false;
  moves = 0;
  pairs = 0;
  movesEl.textContent = moves;
  pairsEl.textContent = pairs;

  if (gameFieldEl) {
    gameFieldEl.remove();
  }
  cardDeck = shuffleCards();
  renderCards(cardDeck);

  winModal.close();
}

function createHeader() {
  const header = document.createElement("header");
  header.classList.add("game-header");

  const newGameButton = document.createElement("button");
  newGameButton.textContent = "Новая игра";
  newGameButton.addEventListener("click", startNewGame);

  const leaderboardButton = document.createElement("button");
  leaderboardButton.textContent = "Таблица лидеров";
  leaderboardButton.addEventListener("click", showLeaderboard);

  const movesTitle = document.createElement("span");
  movesTitle.textContent = "Ходы:";
  movesEl = document.createElement("span");
  movesEl.textContent = moves;

  const pairsTitle = document.createElement("span");
  pairsTitle.textContent = "Пары:";
  pairsEl = document.createElement("span");
  pairsEl.textContent = pairs;

  header.append(newGameButton, leaderboardButton, movesTitle, movesEl, pairsTitle, pairsEl);
  document.body.append(header);
}

function renderCards(deck) {
  const gameField = document.createElement("div");
  gameField.classList.add("game-field");
  gameFieldEl = gameField;

  for (const cardName of deck) {
    const card = document.createElement("div");
    card.classList.add("card");
    // TODO: прочитать подробнее про датасеты
    card.dataset.cardName = cardName;

    const backFace = document.createElement("div");
    backFace.classList.add("card-face", "card-face--back");

    const frontFace = document.createElement("div");
    frontFace.classList.add("card-face", "card-face--front");

    const faceImg = document.createElement("img");
    faceImg.src = `assets/${cardName}.png`;
    faceImg.alt = cardName;
    frontFace.append(faceImg);

    card.append(backFace, frontFace);

    card.addEventListener("click", () => handleCardClick(card));

    gameField.appendChild(card);
  }

  document.body.appendChild(gameField);
}

createHeader();
renderCards(cardDeck);
