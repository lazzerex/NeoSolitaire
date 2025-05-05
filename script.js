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
let currentTheme = 'blue';
let animationSpeed = 1;

// DOM elements
// Main sections
const menuScreen = document.getElementById('menu-screen');
const gameContainer = document.getElementById('game-container');

// Game elements
const stockEl = document.getElementById('stock');
const wasteEl = document.getElementById('waste');
const foundationEls = Array.from({ length: 4 }, (_, i) => document.getElementById(`foundation-${i}`));
const tableauEls = Array.from({ length: 7 }, (_, i) => document.getElementById(`tableau-${i}`).querySelector('.card-stack'));

// Buttons
const startGameBtn = document.getElementById('start-game');
const howToPlayBtn = document.getElementById('how-to-play');
const optionsBtn = document.getElementById('options');
const newGameBtn = document.getElementById('new-game');
const undoBtn = document.getElementById('undo');
const hintBtn = document.getElementById('hint');
const menuBtn = document.getElementById('menu');
const closeHowToBtn = document.getElementById('close-howto');
const saveOptionsBtn = document.getElementById('save-options');
const playAgainBtn = document.getElementById('play-again');
const backToMenuBtn = document.getElementById('back-to-menu');

// Stats
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const scoreEl = document.getElementById('score');
const finalTimeEl = document.getElementById('final-time');
const finalMovesEl = document.getElementById('final-moves');
const finalScoreEl = document.getElementById('final-score');

// Modals
const howToModal = document.getElementById('howto-modal');
const optionsModal = document.getElementById('options-modal');
const winModal = document.getElementById('win-modal');
const confettiContainer = document.getElementById('confetti-container');

// Options elements
const colorOptions = document.querySelectorAll('.color-option');
const animationSpeedSlider = document.getElementById('animation-speed');
const speedValueDisplay = document.getElementById('speed-value');

// Menu Navigation Functions
function showMenu() {
    gameContainer.style.display = 'none';
    menuScreen.style.display = 'flex';
    stopTimer();
}

function hideMenu() {
    menuScreen.style.display = 'none';
    gameContainer.style.display = 'block';
}

function showHowToPlay() {
    howToModal.style.display = 'flex';
}

function hideHowToPlay() {
    howToModal.style.display = 'none';
}

function showOptions() {
    optionsModal.style.display = 'flex';
    
    // Set current theme as active
    colorOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
    });
    
    // Set current animation speed
    animationSpeedSlider.value = animationSpeed;
    updateSpeedValue();
}

function hideOptions() {
    optionsModal.style.display = 'none';
}

function updateSpeedValue() {
    const speed = parseFloat(animationSpeedSlider.value);
    if (speed < 0.75) {
        speedValueDisplay.textContent = 'Slow';
    } else if (speed > 1.25) {
        speedValueDisplay.textContent = 'Fast';
    } else {
        speedValueDisplay.textContent = 'Normal';
    }
}

function saveOptions() {
    // Update animation speed
    animationSpeed = parseFloat(animationSpeedSlider.value);
    document.documentElement.style.setProperty('--animation-multiplier', 1 / animationSpeed);
    
    hideOptions();
}

function setTheme(theme) {
    // Remove current theme classes
    document.body.classList.remove('blue-theme', 'green-theme', 'purple-theme', 'dark-theme');
    
    // Add new theme class if it's not the default blue
    if (theme !== 'blue') {
        document.body.classList.add(`${theme}-theme`);
    }
    
    currentTheme = theme;
    
    // Update active state in options
    colorOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === theme) {
            option.classList.add('active');
        }
    });
}

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

// Deck Creation & Management
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
    // Deal cards to tableau with animation delay
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            card.faceUp = j === i;  // Only turn the top card face up
            card.dealt = true;      // Mark as dealt for animation
            card.dealDelay = (i + j) * 50; // Staggered animation delay
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
        
        // Add animation class for newly drawn cards
        if (topCard.justDrawn) {
            cardEl.classList.add('flip');
            setTimeout(() => {
                cardEl.classList.remove('flip');
                topCard.justDrawn = false;
            }, 300 * animationSpeed);
        }
        
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
            
            // Add animation for cards just moved to foundation
            if (topCard.justMoved) {
                cardEl.classList.add('pop-in');
                setTimeout(() => {
                    cardEl.classList.remove('pop-in');
                    topCard.justMoved = false;
                }, 300 * animationSpeed);
            }
            
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
            
            // Add animation for newly dealt cards
            if (card.dealt && !card.animationPlayed) {
                cardEl.style.opacity = '0';
                cardEl.classList.add('deal');
                
                setTimeout(() => {
                    cardEl.style.opacity = '1';
                    card.animationPlayed = true;
                }, card.dealDelay);
            }
            
            // Add animation for cards just turned face up
            if (card.justRevealed) {
                cardEl.classList.add('flip');
                setTimeout(() => {
                    cardEl.classList.remove('flip');
                    card.justRevealed = false;
                }, 300 * animationSpeed);
            }
            
            // Add highlight for selected card
            if (selectedCard === card) {
                cardEl.classList.add('selected');
            }
            
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
                if (canMoveToFoundation(selectedCard, sourceIndex)) {
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
        card.justDrawn = true; // Flag for animation
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
                    tableau[i][tableau[i].length - 1].justRevealed = true; // Flag for flip animation
                }
                break;
            }
        }
    }
    
    // Add card to foundation with animation flag
    card.justMoved = true;
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
        createConfetti();
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

// Confetti animation for win screen
function createConfetti() {
    confettiContainer.innerHTML = '';
    
    // Create 100 confetti pieces
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const colors = ['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotation = Math.random() * 360;
        const positionX = Math.random() * 100;
        
        // Set styles
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.transform = `rotate(${rotation}deg)`;
        confetti.style.left = `${positionX}%`;
        confetti.style.top = '-20px';
        
        // Animation
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
        
        // Add to container
        confettiContainer.appendChild(confetti);
    }
}

// Add @keyframes for confetti fall animation
function addConfettiStyle() {
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.innerHTML = `
            @keyframes fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Event listeners for menu and game controls
startGameBtn.addEventListener('click', () => {
    hideMenu();
    initGame();
});

howToPlayBtn.addEventListener('click', showHowToPlay);
closeHowToBtn.addEventListener('click', hideHowToPlay);

optionsBtn.addEventListener('click', showOptions);
saveOptionsBtn.addEventListener('click', saveOptions);

// Event listeners for theme selection
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        setTheme(option.dataset.theme);
        
        // Update active state
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

// Animation speed slider
animationSpeedSlider.addEventListener('input', updateSpeedValue);

// Game controls
stockEl.addEventListener('click', () => {
    if (isGameStarted) {
        drawCard();
    }
});

newGameBtn.addEventListener('click', initGame);
menuBtn.addEventListener('click', showMenu);

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

backToMenuBtn.addEventListener('click', () => {
    winModal.style.display = 'none';
    showMenu();
});

// Initialize the game when the page loads
window.addEventListener('load', () => {
    // Add confetti animation style
    addConfettiStyle();
    
    // Show menu on load
    showMenu();
});