// Card suits and values
const SUITS = ['♥', '♦', '♠', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED_SUITS = ['♥', '♦'];

// Game state
let deck = [];
let stock = [];
let waste = [];
let foundations = [[], [], [], []];
let tableau = [[], [], [], [], [], [], []];
let selectedCard = null;
let selectedStack = null;
let draggedCards = null;
let moveHistory = [];
let timer = null;
let seconds = 0;
let moves = 0;
let score = 0;
let isGameStarted = false;

// DOM elements
const stockEl = document.getElementById('stock');
const wasteEl = document.getElementById('waste');
const foundationEls = Array.from({ length: 4 }, (_, i) => document.getElementById(`foundation-${i}`));
const tableauEls = Array.from({ length: 7 }, (_, i) => document.getElementById(`tableau-${i}`).querySelector('.card-stack'));
const newGameBtn = document.getElementById('new-game');
const undoBtn = document.getElementById('undo');
const hintBtn = document.getElementById('hint');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const scoreEl = document.getElementById('score');
const winModal = document.getElementById('win-modal');
const finalTimeEl = document.getElementById('final-time');
const finalMovesEl = document.getElementById('final-moves');
const finalScoreEl = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again');

// Initialize the game
function initGame() {
    resetGameState();
    createDeck();
    shuffleDeck();
    dealCards();
    renderGame();
    startTimer();
    isGameStarted = true;
}

function resetGameState() {
    deck = [];
    stock = [];
    waste = [];
    foundations = [[], [], [], []];
    tableau = [[], [], [], [], [], [], []];
    selectedCard = null;
    selectedStack = null;
    moveHistory = [];
    stopTimer();
    seconds = 0;
    moves = 0;
    score = 0;
    updateStats();
}

function createDeck() {
    deck = [];
    for (const suit of SUITS) {
        for (const value of VALUES) {
            deck.push({
                suit,
                value,
                color: RED_SUITS.includes(suit) ? 'red' : 'black',
                faceUp: false
            });
        }
    }
}

function shuffleDeck() {
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards() {
    // Deal cards to tableau
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            card.faceUp = j === i;  // Only turn the top card face up
            tableau[i].push(card);
        }
    }
    
    // Remaining cards go to stock
    stock = deck.slice();
    deck = [];
}

function renderGame() {
    renderStock();
    renderWaste();
    renderFoundations();
    renderTableau();
}

function renderStock() {
    stockEl.innerHTML = '';
    if (stock.length > 0) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card back';
        cardEl.innerHTML = '';
        stockEl.appendChild(cardEl);
    }
}

function renderWaste() {
    wasteEl.innerHTML = '';
    if (waste.length > 0) {
        const topCard = waste[waste.length - 1];
        const cardEl = createCardElement(topCard);
        wasteEl.appendChild(cardEl);
    }
}

function renderFoundations() {
    foundationEls.forEach((el, i) => {
        el.innerHTML = '';
        const foundation = foundations[i];
        if (foundation.length > 0) {
            const topCard = foundation[foundation.length - 1];
            const cardEl = createCardElement(topCard);
            el.appendChild(cardEl);
        }
    });
}

function renderTableau() {
    tableauEls.forEach((el, i) => {
        el.innerHTML = '';
        const column = tableau[i];
        column.forEach((card, j) => {
            const cardEl = createCardElement(card);
            cardEl.style.top = `${j * 30}px`;
            el.appendChild(cardEl);
        });
    });
}

function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.faceUp ? card.color : 'back'}`;
    cardEl.dataset.suit = card.suit;
    cardEl.dataset.value = card.value;
    cardEl.dataset.color = card.color;
    
    if (card.faceUp) {
        const valueSymbol = document.createElement('div');
        valueSymbol.innerHTML = `${card.value}${card.suit}`;
        cardEl.appendChild(valueSymbol);
        
        cardEl.draggable = true;
        
        cardEl.addEventListener('dragstart', (e) => handleDragStart(e, card));
        cardEl.addEventListener('dragend', handleDragEnd);
        cardEl.addEventListener('click', () => handleCardClick(card));
    }
    
    return cardEl;
}

// Event handlers
function handleCardClick(card) {
    // Logic for selecting and moving cards
    if (!card.faceUp) return;
    
    let source = null;
    let sourceIndex = -1;
    
    // Check if card is in waste
    if (waste.length > 0 && waste[waste.length - 1] === card) {
        source = 'waste';
    }
    
    // Check if card is in tableau
    for (let i = 0; i < tableau.length; i++) {
        const column = tableau[i];
        const index = column.indexOf(card);
        if (index !== -1) {
            source = 'tableau';
            sourceIndex = i;
            break;
        }
    }
    
    // Check if card is in foundation
    for (let i = 0; i < foundations.length; i++) {
        const foundation = foundations[i];
        if (foundation.length > 0 && foundation[foundation.length - 1] === card) {
            source = 'foundation';
            sourceIndex = i;
            break;
        }
    }
    
    if (source) {
        if (selectedCard) {
            // Try to move the selected card to the destination
            let moved = false;
            
            if (source === 'tableau') {
                const column = tableau[sourceIndex];
                const index = column.indexOf(card);
                if (canMoveToTableau(selectedCard, column)) {
                    moveCardToTableau(selectedCard, sourceIndex);
                    moved = true;
                }
            } else if (source === 'foundation') {
                if (selectedCard.value === 'A' && canMoveToFoundation(selectedCard, sourceIndex)) {
                    moveCardToFoundation(selectedCard, sourceIndex);
                    moved = true;
                }
            }
            
            if (!moved) {
                // If move was not possible, select the new card instead
                selectedCard = card;
            } else {
                selectedCard = null;
            }
            
            renderGame();
        } else {
            // Select the card
            selectedCard = card;
            renderGame();
        }
    }
}

function handleDragStart(e, card) {
    draggedCards = card;
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        e.target.classList.add('dragging');
    }, 0);
    
    // If card is part of a sequence in tableau, get all cards after it
    for (let i = 0; i < tableau.length; i++) {
        const column = tableau[i];
        const index = column.indexOf(card);
        if (index !== -1 && index < column.length - 1) {
            draggedCards = column.slice(index);
            break;
        }
    }
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedCards = null;
}

// Set up event listeners for drop targets
tableauEls.forEach((el, i) => {
    el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    el.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedCards) {
            if (Array.isArray(draggedCards)) {
                if (canMoveToTableau(draggedCards[0], tableau[i])) {
                    const column = findTableauColumn(draggedCards[0]);
                    if (column !== -1) {
                        const index = tableau[column].indexOf(draggedCards[0]);
                        const cards = tableau[column].splice(index);
                        tableau[i] = tableau[i].concat(cards);
                        recordMove();
                        renderGame();
                        checkWinCondition();
                    }
                }
            } else {
                if (canMoveToTableau(draggedCards, tableau[i])) {
                    moveCardToTableau(draggedCards, i);
                }
            }
        }
    });
});

foundationEls.forEach((el, i) => {
    el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    el.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedCards && !Array.isArray(draggedCards)) {
            if (canMoveToFoundation(draggedCards, i)) {
                moveCardToFoundation(draggedCards, i);
            }
        }
    });
});

// Game logic
function drawCard() {
    if (stock.length === 0) {
        // Recycle waste back to stock
        stock = waste.reverse();
        waste = [];
        stock.forEach(card => card.faceUp = false);
    } else {
        // Draw top card from stock to waste
        const card = stock.pop();
        card.faceUp = true;
        waste.push(card);
        recordMove();
    }
    
    renderGame();
}

function findTableauColumn(card) {
    for (let i = 0; i < tableau.length; i++) {
        if (tableau[i].includes(card)) {
            return i;
        }
    }
    return -1;
}

function canMoveToTableau(card, column) {
    if (column.length === 0) {
        // Empty column: only Kings can be placed
        return card.value === 'K';
    }
    
    const targetCard = column[column.length - 1];
    if (!targetCard.faceUp) return false;
    
    // Card must be of opposite color and one less in value
    const targetValue = VALUES.indexOf(targetCard.value);
    const cardValue = VALUES.indexOf(card.value);
    
    return card.color !== targetCard.color && cardValue === targetValue - 1;
}

function canMoveToFoundation(card, foundationIndex) {
    const foundation = foundations[foundationIndex];
    
    if (foundation.length === 0) {
        // Empty foundation: only Aces can be placed
        return card.value === 'A';
    }
    
    const targetCard = foundation[foundation.length - 1];
    const targetSuit = targetCard.suit;
    const targetValue = VALUES.indexOf(targetCard.value);
    const cardValue = VALUES.indexOf(card.value);
    
    // Card must be of same suit and one higher in value
    return card.suit === targetSuit && cardValue === targetValue + 1;
}

function moveCardToTableau(card, columnIndex) {
    // Remove card from source
    if (waste.length > 0 && waste[waste.length - 1] === card) {
        waste.pop();
    } else {
        for (let i = 0; i < foundations.length; i++) {
            const foundation = foundations[i];
            if (foundation.length > 0 && foundation[foundation.length - 1] === card) {
                foundation.pop();
                break;
            }
        }
        
        for (let i = 0; i < tableau.length; i++) {
            const column = tableau[i];
            const index = column.indexOf(card);
            if (index !== -1) {
                tableau[i] = column.slice(0, index);
                break;
            }
        }
    }
    
    // Add card to tableau
    tableau[columnIndex].push(card);
    
    recordMove();
    renderGame();
    checkWinCondition();
}

function moveCardToFoundation(card, foundationIndex) {
    // Remove card from source
    if (waste.length > 0 && waste[waste.length - 1] === card) {
        waste.pop();
    } else {
        for (let i = 0; i < tableau.length; i++) {
            const column = tableau[i];
            const index = column.indexOf(card);
            if (index !== -1) {
                tableau[i] = column.slice(0, index);
                // Turn the next card face up
                if (tableau[i].length > 0) {
                    tableau[i][tableau[i].length - 1].faceUp = true;
                }
                break;
            }
        }
    }
    
    // Add card to foundation
    foundations[foundationIndex].push(card);
    
    // Update score
    score += 10;
    
    recordMove();
    renderGame();
    updateStats();
    checkWinCondition();
}

function recordMove() {
    // Simplified history for now, just increment moves
    moves++;
    updateStats();
}

function updateStats() {
    timerEl.textContent = formatTime(seconds);
    movesEl.textContent = moves;
    scoreEl.textContent = score;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function startTimer() {
    stopTimer();
    timer = setInterval(() => {
        seconds++;
        updateStats();
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function checkWinCondition() {
    // Game is won when all foundations have 13 cards (all cards moved to foundations)
    const isWon = foundations.every(foundation => foundation.length === 13);
    if (isWon) {
        stopTimer();
        finalTimeEl.textContent = formatTime(seconds);
        finalMovesEl.textContent = moves;
        finalScoreEl.textContent = score;
        winModal.style.display = 'flex';
    }
}

function giveHint() {
    // Simple hint system: look for obvious moves
    let hintFound = false;
    
    // Check waste for moves
    if (waste.length > 0) {
        const wasteCard = waste[waste.length - 1];
        
        // Check if waste card can go to foundation
        for (let i = 0; i < foundations.length; i++) {
            if (canMoveToFoundation(wasteCard, i)) {
                alert(`Hint: Move ${wasteCard.value}${wasteCard.suit} from waste to foundation ${i+1}.`);
                hintFound = true;
                break;
            }
        }
        
        if (!hintFound) {
            // Check if waste card can go to tableau
            for (let i = 0; i < tableau.length; i++) {
                if (canMoveToTableau(wasteCard, tableau[i])) {
                    alert(`Hint: Move ${wasteCard.value}${wasteCard.suit} from waste to tableau column ${i+1}.`);
                    hintFound = true;
                    break;
                }
            }
        }
    }
    
    // Check tableau for moves to foundation
    if (!hintFound) {
        for (let i = 0; i < tableau.length; i++) {
            const column = tableau[i];
            if (column.length > 0) {
                const card = column[column.length - 1];
                if (card.faceUp) {
                    for (let j = 0; j < foundations.length; j++) {
                        if (canMoveToFoundation(card, j)) {
                            alert(`Hint: Move ${card.value}${card.suit} from tableau column ${i+1} to foundation ${j+1}.`);
                            hintFound = true;
                            break;
                        }
                    }
                    if (hintFound) break;
                }
            }
        }
    }
    
    // Check tableau for inter-column moves
    if (!hintFound) {
        for (let i = 0; i < tableau.length; i++) {
            const column = tableau[i];
            // Find the first face up card
            let faceUpIndex = -1;
            for (let j = 0; j < column.length; j++) {
                if (column[j].faceUp) {
                    faceUpIndex = j;
                    break;
                }
            }
            
            if (faceUpIndex !== -1) {
                const card = column[faceUpIndex];
                for (let j = 0; j < tableau.length; j++) {
                    if (i !== j && canMoveToTableau(card, tableau[j])) {
                        alert(`Hint: Move ${card.value}${card.suit} from tableau column ${i+1} to tableau column ${j+1}.`);
                        hintFound = true;
                        break;
                    }
                }
                if (hintFound) break;
            }
        }
    }
    
    if (!hintFound) {
        // Suggest drawing a card if nothing else is found
        if (stock.length > 0) {
            alert("Hint: Draw a card from the stock.");
        } else {
            alert("Hint: No obvious moves found. Try recycling the waste pile back to stock.");
        }
    }
}

// Event listeners
stockEl.addEventListener('click', () => {
    if (isGameStarted) {
        drawCard();
    }
});

newGameBtn.addEventListener('click', initGame);

undoBtn.addEventListener('click', () => {
    // Simplified undo for now - just restart the game
    if (confirm("This will restart the game. Continue?")) {
        initGame();
    }
});

hintBtn.addEventListener('click', () => {
    if (isGameStarted) {
        giveHint();
    }
});

playAgainBtn.addEventListener('click', () => {
    winModal.style.display = 'none';
    initGame();
});

// Initialize the game when the page loads
window.addEventListener('load', initGame);