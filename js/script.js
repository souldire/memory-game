const CARDS = [
  "card1",
  "card2",
  "card3",
  "card4",
  "card5",
  "card6",
  "card7",
  "card8",
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

function renderCards(deck) {
  const gameField = document.createElement("div");
  gameField.classList.add("game-field");

  for (const cardName of deck) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.textContent = cardName;
    gameField.appendChild(card);
  }

  document.body.appendChild(gameField);
}

renderCards(cardDeck);
