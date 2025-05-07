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
let selectedSource = null;
let draggedCards = null;
let moveHistory = [];
let timer = null;
let seconds = 0;
let moves = 0;
let score = 0;
let isGameStarted = false;
let currentTheme = localStorage.getItem('theme') || 'blue';
let animationSpeed = localStorage.getItem('animationSpeed') ? parseFloat(localStorage.getItem('animationSpeed')) : 1;
let autoComplete = localStorage.getItem('autoComplete') === 'true';
let draw3Mode = localStorage.getItem('draw3Mode') === 'true';
let lastGameState = null;
let hintHighlight = null;

// Game statistics
let gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
let gamesWon = parseInt(localStorage.getItem('gamesWon') || '0');
let bestTime = parseInt(localStorage.getItem('bestTime') || '999999');
let bestScore = parseInt(localStorage.getItem('bestScore') || '0');
let currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
let bestStreak = parseInt(localStorage.getItem('bestStreak') || '0');

// DOM elements
// Main sections
const menuScreen = document.getElementById('menu-screen');
const gameContainer = document.getElementById('game-container');

// Game elements
const stockEl = document.getElementById('stock');
const wasteEl = document.getElementById('waste');
const foundationEls = Array.from({ length: 4 }, (_, i) => document.getElementById(`foundation-${i}`));
const tableauEls = Array.from({ length: 7 }, (_, i) => document.getElementById(`tableau-${i}`).querySelector('.card-stack'));
const tableauColumns = Array.from({ length: 7 }, (_, i) => document.getElementById(`tableau-${i}`));

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
const autoCompleteCheckbox = document.createElement('input');
const draw3ModeCheckbox = document.createElement('input');

// Set up additional option checkboxes
function setupAdditionalOptions() {
    // Auto-complete option
    const autoCompleteGroup = document.createElement('div');
    autoCompleteGroup.className = 'option-group';
    
    const autoCompleteTitle = document.createElement('h3');
    autoCompleteTitle.textContent = 'Auto-Complete';
    
    const autoCompleteContainer = document.createElement('div');
    autoCompleteContainer.className = 'checkbox-option';
    
    autoCompleteCheckbox.type = 'checkbox';
    autoCompleteCheckbox.id = 'auto-complete';
    autoCompleteCheckbox.checked = autoComplete;
    
    const autoCompleteLabel = document.createElement('label');
    autoCompleteLabel.htmlFor = 'auto-complete';
    autoCompleteLabel.textContent = 'Automatically move cards to foundation when possible';
    
    autoCompleteContainer.appendChild(autoCompleteCheckbox);
    autoCompleteContainer.appendChild(autoCompleteLabel);
    
    autoCompleteGroup.appendChild(autoCompleteTitle);
    autoCompleteGroup.appendChild(autoCompleteContainer);
    
    // Draw-3 mode
    const draw3Group = document.createElement('div');
    draw3Group.className = 'option-group';
    
    const draw3Title = document.createElement('h3');
    draw3Title.textContent = 'Card Draw Options';
    
    const draw3Container = document.createElement('div');
    draw3Container.className = 'checkbox-option';
    
    draw3ModeCheckbox.type = 'checkbox';
    draw3ModeCheckbox.id = 'draw3-mode';
    draw3ModeCheckbox.checked = draw3Mode;
    
    const draw3Label = document.createElement('label');
    draw3Label.htmlFor = 'draw3-mode';
    draw3Label.textContent = 'Draw 3 cards at once';
    
    draw3Container.appendChild(draw3ModeCheckbox);
    draw3Container.appendChild(draw3Label);
    
    draw3Group.appendChild(draw3Title);
    draw3Group.appendChild(draw3Container);
    
    // Add to options modal
    const optionsContent = document.querySelector('.options-content');
    const saveButton = document.getElementById('save-options');
    
    optionsContent.insertBefore(autoCompleteGroup, saveButton);
    optionsContent.insertBefore(draw3Group, saveButton);
}

// Menu Navigation Functions
function showMenu() {
    saveGameState();
    gameContainer.style.display = 'none';
    menuScreen.style.display = 'flex';
    stopTimer();
}

function hideMenu() {
    menuScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    if (isGameStarted) {
        startTimer();
    }
}

function showHowToPlay() {
    document.getElementById('howto-modal').style.display = 'flex';
}

function hideHowToPlay() {
    document.getElementById('howto-modal').style.display = 'none';
}

function showOptions() {
    document.getElementById('options-modal').style.display = 'flex';
    
    // Set current values in options
    colorOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
    });
    
    animationSpeedSlider.value = animationSpeed;
    updateSpeedValue();
    
    if (autoCompleteCheckbox) {
        autoCompleteCheckbox.checked = autoComplete;
    }
    
    if (draw3ModeCheckbox) {
        draw3ModeCheckbox.checked = draw3Mode;
    }
}

function hideOptions() {
    document.getElementById('options-modal').style.display = 'none';
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
    localStorage.setItem('animationSpeed', animationSpeed.toString());
    
    // Update auto-complete setting
    autoComplete = autoCompleteCheckbox.checked;
    localStorage.setItem('autoComplete', autoComplete.toString());
    
    // Update draw-3 mode
    draw3Mode = draw3ModeCheckbox.checked;
    localStorage.setItem('draw3Mode', draw3Mode.toString());
    
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
    localStorage.setItem('theme', theme);
    
    // Update active state in options
    colorOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === theme) {
            option.classList.add('active');
        }
    });
}

// Game State Management
function saveGameState() {
    if (!isGameStarted) return;
    
    const gameState = {
        stock: stock,
        waste: waste, 
        foundations: foundations,
        tableau: tableau,
        moves: moves,
        score: score,
        seconds: seconds,
        isGameStarted: isGameStarted
    };
    
    localStorage.setItem('savedGame', JSON.stringify(gameState));
}

function loadGameState() {
    try {
        const savedState = localStorage.getItem('savedGame');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            
            stock = gameState.stock;
            waste = gameState.waste;
            foundations = gameState.foundations;
            tableau = gameState.tableau;
            moves = gameState.moves;
            score = gameState.score;
            seconds = gameState.seconds;
            isGameStarted = gameState.isGameStarted;
            
            updateStats();
            renderGame();
            return true;
        }
    } catch (e) {
        console.error('Error loading saved game:', e);
    }
    return false;
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
    
    // Initialize move history with the initial state
    recordGameState();
}

function resetGameState() {
    deck = [];
    stock = [];
    waste = [];
    foundations = [[], [], [], []];
    tableau = [[], [], [], [], [], [], []];
    selectedCard = null;
    selectedStack = null;
    selectedSource = null;
    moveHistory = [];
    stopTimer();
    seconds = 0;
    moves = 0;
    score = 0;
    clearHint();
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
        
        if (draw3Mode) {
            // Show "3" on the stock to indicate draw-3 mode
            const indicator = document.createElement('div');
            indicator.className = 'draw-indicator';
            indicator.textContent = '3';
            cardEl.appendChild(indicator);
        }
        
        stockEl.appendChild(cardEl);
    } else if (waste.length > 0) {
        // Empty stock but waste has cards - show recycle icon
        const recycleEl = document.createElement('div');
        recycleEl.className = 'recycle-icon';
        recycleEl.innerHTML = '↻';
        stockEl.appendChild(recycleEl);
    }
}

function renderWaste() {
    wasteEl.innerHTML = '';
    
    if (waste.length > 0) {
        // In draw-3 mode, show up to 3 cards with slight offset
        if (draw3Mode) {
            // Show the top 3 cards or as many as available
            const cardsToShow = Math.min(3, waste.length);
            const startIndex = waste.length - cardsToShow;
            
            for (let i = 0; i < cardsToShow; i++) {
                const cardIndex = startIndex + i;
                const card = waste[cardIndex];
                const cardEl = createCardElement(card);
                
                // Only the top card is interactive
                if (i < cardsToShow - 1) {
                    cardEl.classList.add('non-interactive');
                    cardEl.style.zIndex = i;
                    cardEl.style.left = `${i * 15}px`;
                } else {
                    // Add animation class for newly drawn cards
                    if (card.justDrawn) {
                        cardEl.classList.add('flip');
                        setTimeout(() => {
                            cardEl.classList.remove('flip');
                            card.justDrawn = false;
                        }, 300 / animationSpeed);
                    }
                    cardEl.style.zIndex = cardsToShow;
                    cardEl.style.left = `${(cardsToShow - 1) * 15}px`;
                }
                
                wasteEl.appendChild(cardEl);
            }
        } else {
            // Standard mode - show only the top card
            const topCard = waste[waste.length - 1];
            const cardEl = createCardElement(topCard);
            
            // Add animation class for newly drawn cards
            if (topCard.justDrawn) {
                cardEl.classList.add('flip');
                setTimeout(() => {
                    cardEl.classList.remove('flip');
                    topCard.justDrawn = false;
                }, 300 / animationSpeed);
            }
            
            wasteEl.appendChild(cardEl);
        }
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
                }, 300 / animationSpeed);
            }
            
            el.appendChild(cardEl);
        }
    });
}

function renderTableau() {
    tableauEls.forEach((el, i) => {
        el.innerHTML = '';
        const column = tableau[i];
        
        // Calculate the offset for cards based on column length
        const offsetMultiplier = column.length > 10 ? 15 : 25; 
        
        column.forEach((card, j) => {
            const cardEl = createCardElement(card);
            cardEl.style.top = `${j * offsetMultiplier}px`;
            
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
                }, 300 / animationSpeed);
            }
            
            // Add highlight for selected card
            if (selectedCard === card) {
                cardEl.classList.add('selected');
            }
            
            // Add styles for cards in a selected stack
            if (selectedStack && selectedStack.includes(card)) {
                cardEl.classList.add('selected-stack');
            }
            
            // Add highlight for hint
            if (hintHighlight && hintHighlight.card === card) {
                cardEl.classList.add('hint-highlight');
            }
            
            el.appendChild(cardEl);
        });
    });
}

function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.faceUp ? card.color : 'back'}`;
    
    if (card.faceUp) {
        cardEl.dataset.suit = card.suit;
        cardEl.dataset.value = card.value;
        cardEl.dataset.color = card.color;
        
        // Create main value/suit display
        const valueSymbol = document.createElement('div');
        valueSymbol.className = 'card-value';
        valueSymbol.innerHTML = `${card.value}${card.suit}`;
        cardEl.appendChild(valueSymbol);
        
        // Add corner values for better visibility
        const cornerTop = document.createElement('div');
        cornerTop.className = 'corner-value top-left';
        cornerTop.innerHTML = `${card.value}<br>${card.suit}`;
        cardEl.appendChild(cornerTop);
        
        const cornerBottom = document.createElement('div');
        cornerBottom.className = 'corner-value bottom-right';
        cornerBottom.innerHTML = `${card.value}<br>${card.suit}`;
        cardEl.appendChild(cornerBottom);
        
        cardEl.draggable = true;
        
        cardEl.addEventListener('dragstart', (e) => handleDragStart(e, card));
        cardEl.addEventListener('dragend', handleDragEnd);
        cardEl.addEventListener('click', () => handleCardClick(card));
    }
    
    return cardEl;
}

// Event handlers
function handleCardClick(card) {
    clearHint();
    
    // Logic for selecting and moving cards
    if (!card.faceUp) return;
    
    const cardSource = findCardSource(card);
    
    if (!cardSource) return;
    
    if (selectedCard) {
        // Already have a selected card - try to move it
        const moveResult = tryMoveCard(selectedCard, selectedSource, card, cardSource);
        
        if (!moveResult) {
            // If movement failed, select the new card instead
            selectCard(card, cardSource);
        } else {
            deselectCard();
        }
    } else {
        // No card selected - select this one
        selectCard(card, cardSource);
    }
}

function findCardSource(card) {
    let source = {
        type: null,
        index: -1,
        cardIndex: -1
    };
    
    // Check if card is in waste
    if (waste.length > 0) {
        const wasteIndex = waste.indexOf(card);
        if (wasteIndex !== -1 && wasteIndex === waste.length - 1) {  // Only the top waste card is selectable
            source.type = 'waste';
            source.cardIndex = wasteIndex;
            return source;
        }
    }
    
    // Check if card is in tableau
    for (let i = 0; i < tableau.length; i++) {
        const column = tableau[i];
        const index = column.indexOf(card);
        if (index !== -1) {
            source.type = 'tableau';
            source.index = i;
            source.cardIndex = index;
            return source;
        }
    }
    
    // Check if card is in foundation
    for (let i = 0; i < foundations.length; i++) {
        const foundation = foundations[i];
        const index = foundation.indexOf(card);
        if (index !== -1 && index === foundation.length - 1) {  // Only the top foundation card is selectable
            source.type = 'foundation';
            source.index = i;
            source.cardIndex = index;
            return source;
        }
    }
    
    return null;
}

function selectCard(card, source) {
    deselectCard(); // Clear any previous selection
    
    selectedCard = card;
    selectedSource = source;
    
    // If selecting from tableau, get the stack of cards
    if (source.type === 'tableau') {
        const column = tableau[source.index];
        const cardIndex = source.cardIndex;
        
        // Only select a stack if it's not the only card and it's face up
        if (cardIndex < column.length - 1 && card.faceUp) {
            selectedStack = column.slice(cardIndex);
        }
    }
    
    renderGame();
}

function deselectCard() {
    selectedCard = null;
    selectedStack = null;
    selectedSource = null;
}

function tryMoveCard(fromCard, fromSource, toCard, toSource) {
    // Don't try to move a card to itself
    if (fromCard === toCard) {
        deselectCard();
        return false;
    }
    
    let moved = false;
    
    // Try auto-move to foundation first (if toSource is null)
    if (toSource.type === null && autoComplete) {
        for (let i = 0; i < foundations.length; i++) {
            if (canMoveToFoundation(fromCard, i)) {
                moveCardToFoundation(fromCard, fromSource, i);
                moved = true;
                break;
            }
        }
        return moved;
    }
    
    // Handle moving to tableau
    if (toSource.type === 'tableau') {
        if (selectedStack) {
            moved = tryMoveStackToTableau(selectedStack, fromSource.index, toSource.index);
        } else if (canMoveToTableau(fromCard, tableau[toSource.index])) {
            moveCardToTableau(fromCard, fromSource, toSource.index);
            moved = true;
        }
    }
    // Handle moving to foundation
    else if (toSource.type === 'foundation') {
        if (canMoveToFoundation(fromCard, toSource.index)) {
            moveCardToFoundation(fromCard, fromSource, toSource.index);
            moved = true;
        }
    }
    // Handle clicks on empty tableau column
    else if (toSource.type === 'tableau-empty') {
        if (selectedStack) {
            moved = tryMoveStackToTableau(selectedStack, fromSource.index, toSource.index);
        } else if (fromCard.value === 'K') {
            moveCardToTableau(fromCard, fromSource, toSource.index);
            moved = true;
        }
    }
    
    if (moved) {
        checkAutoMoveToFoundations();
        checkWinCondition();
    }
    
    return moved;
}

function handleDragStart(e, card) {
    // Don't allow drag if card is not face up
    if (!card.faceUp) {
        e.preventDefault();
        return;
    }
    
    const source = findCardSource(card);
    if (!source) {
        e.preventDefault();
        return;
    }
    
    // Store the dragged card(s)
    draggedCards = {
        card: card,
        source: source,
        stack: null
    };
    
    // If dragging from tableau, check if it's a stack
    if (source.type === 'tableau') {
        const column = tableau[source.index];
        const cardIndex = source.cardIndex;
        
        // Only select a stack if it's not the only card
        if (cardIndex < column.length - 1) {
            draggedCards.stack = column.slice(cardIndex);
        }
    }
    
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual cue for dragging
    setTimeout(() => {
        e.target.classList.add('dragging');
        
        // If dragging a stack, highlight all cards
        if (draggedCards.stack) {
            const cards = document.querySelectorAll(`#tableau-${source.index} .card`);
            const startIndex = source.cardIndex;
            for (let i = startIndex; i < cards.length; i++) {
                cards[i].classList.add('dragging');
            }
        }
    }, 0);
}

function handleDragEnd(e) {
    // Remove dragging class from all cards
    document.querySelectorAll('.card.dragging').forEach(card => {
        card.classList.remove('dragging');
    });
    
    draggedCards = null;
}

// Set up drop targets
function setupDropTargets() {
    // Set up tableau columns as drop targets
    tableauColumns.forEach((el, i) => {
        // This is the full column including the slot
        el.addEventListener('dragover', (e) => {
            if (!draggedCards) return;
            
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const column = tableau[i];
            const card = draggedCards.card;
            
            if (column.length === 0) {
                // Empty column - only Kings can be placed
                if (card.value === 'K') {
                    el.classList.add('valid-drop');
                } else {
                    el.classList.add('invalid-drop');
                }
            } else if (draggedCards.stack) {
                // Dragging a stack
                const targetCard = column[column.length - 1];
                if (canStackOnCard(card, targetCard)) {
                    el.classList.add('valid-drop');
                } else {
                    el.classList.add('invalid-drop');
                }
            } else {
                // Dragging a single card
                const targetCard = column[column.length - 1];
                if (canStackOnCard(card, targetCard)) {
                    el.classList.add('valid-drop');
                } else {
                    el.classList.add('invalid-drop');
                }
            }
        });
        
        el.addEventListener('dragleave', () => {
            el.classList.remove('valid-drop', 'invalid-drop');
        });
        
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('valid-drop', 'invalid-drop');
            
            if (!draggedCards) return;
            
            const card = draggedCards.card;
            const source = draggedCards.source;
            
            let success = false;
            
            if (draggedCards.stack) {
                // Handle dropping a stack of cards
                success = tryMoveStackToTableau(draggedCards.stack, source.index, i);
            } else {
                // Handle dropping a single card
                if (tableau[i].length === 0) {
                    // Empty tableau - only Kings
                    if (card.value === 'K') {
                        moveCardToTableau(card, source, i);
                        success = true;
                    }
                } else if (canMoveToTableau(card, tableau[i])) {
                    moveCardToTableau(card, source, i);
                    success = true;
                }
            }
            
            if (success) {
                checkAutoMoveToFoundations();
                checkWinCondition();
            }
        });
    });
    
    // Set up foundations as drop targets
    foundationEls.forEach((el, i) => {
        el.addEventListener('dragover', (e) => {
            if (!draggedCards || draggedCards.stack) return; // Don't allow stacks on foundations
            
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (canMoveToFoundation(draggedCards.card, i)) {
                el.classList.add('valid-drop');
            } else {
                el.classList.add('invalid-drop');
            }
        });
        
        el.addEventListener('dragleave', () => {
            el.classList.remove('valid-drop', 'invalid-drop');
        });
        
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('valid-drop', 'invalid-drop');
            
            if (!draggedCards || draggedCards.stack) return;
            
            if (canMoveToFoundation(draggedCards.card, i)) {
                moveCardToFoundation(draggedCards.card, draggedCards.source, i);
                checkAutoMoveToFoundations();
                checkWinCondition();
            }
        });
    });
}

// Game logic
function drawCard() {
    recordGameState(); // Save state before drawing
    
    if (stock.length === 0) {
        // Recycle waste back to stock
        stock = waste.reverse();
        waste = [];
        stock.forEach(card => card.faceUp = false);
    } else {
        // In draw-3 mode, draw up to 3 cards at once
        const cardsToDraw = draw3Mode ? Math.min(3, stock.length) : 1;
        
        for (let i = 0; i < cardsToDraw; i++) {
            const card = stock.pop();
            card.faceUp = true;
            card.justDrawn = true; // Flag for animation
            waste.push(card);
        }
    }
    
    moves++;
    updateStats();
    renderGame();
    
    // Clear any selected cards
    deselectCard();
}

function canStackOnCard(movingCard, targetCard) {
    if (!targetCard.faceUp) return false;
    
    // Card must be of opposite color and one less in value
    const targetValue = VALUES.indexOf(targetCard.value);
    const movingValue = VALUES.indexOf(movingCard.value);
    
    return movingCard.color !== targetCard.color && movingValue === targetValue - 1;
}

function canMoveToTableau(card, column) {
    if (column.length === 0) {
        // Empty column: only Kings can be placed
        return card.value === 'K';
    }
    
    const targetCard = column[column.length - 1];
    
    // Target must be face up
    if (!targetCard.faceUp) return false;
    
    return canStackOnCard(card, targetCard);
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

function moveCardToTableau(card, source, columnIndex) {
    // Save state before the move
    recordGameState();
    
    // Remove card from source
    removeCardFromSource(card, source);
    
    // Add card to tableau
    tableau[columnIndex].push(card);
    
    moves++;
    score += 5; // Points for moving to tableau
    updateStats();
    renderGame();
}

function moveCardToFoundation(card, source, foundationIndex) {
    // Save state before the move
    recordGameState();
    
    // Remove card from source
    removeCardFromSource(card, source);
    
    // Add card to foundation with animation flag
    card.justMoved = true;
    foundations[foundationIndex].push(card);
    
    // Update score - more points for foundation moves
    score += 10;
    
    moves++;
    updateStats();
    renderGame();
}

function tryMoveStackToTableau(stack, fromColumnIndex, toColumnIndex) {
    if (fromColumnIndex === toColumnIndex) return false;
    
    const topCard = stack[0];
    const targetColumn = tableau[toColumnIndex];
    
    if (targetColumn.length === 0) {
        // Empty column - only Kings can be placed
        if (topCard.value !== 'K') return false;
    } else {
        const targetCard = targetColumn[targetColumn.length - 1];
        if (!canStackOnCard(topCard, targetCard)) return false;
    }
    
    // Save state before the move
    recordGameState();
    
    // Remove stack from source column
    tableau[fromColumnIndex] = tableau[fromColumnIndex].slice(0, tableau[fromColumnIndex].indexOf(topCard));
    
    // Reveal the next card if one exists
    if (tableau[fromColumnIndex].length > 0) {
        const nextCard = tableau[fromColumnIndex][tableau[fromColumnIndex].length - 1];
        if (!nextCard.faceUp) {
            nextCard.faceUp = true;
            nextCard.justRevealed = true;
            score += 5; // Points for revealing a card
        }
    }
    
    // Add stack to target column
    tableau[toColumnIndex] = tableau[toColumnIndex].concat(stack);
    
    moves++;
    score += 5; // Points for moving cards
    updateStats();
    renderGame();
    
    return true;
}

function removeCardFromSource(card, source) {
    if (source.type === 'waste') {
        // Remove from waste
        waste.splice(source.cardIndex, 1);
    } else if (source.type === 'tableau') {
        // Remove from tableau
        const column = tableau[source.index];
        column.splice(source.cardIndex);
        
        // Turn next card face up if needed
        if (column.length > 0) {
            const nextCard = column[column.length - 1];
            if (!nextCard.faceUp) {
                nextCard.faceUp = true;
                nextCard.justRevealed = true;
                score += 5; // Points for revealing a card
            }
        }
    } else if (source.type === 'foundation') {
        // Remove from foundation
        foundations[source.index].pop();
    }
}

function checkAutoMoveToFoundations() {
    if (!autoComplete) return false;
    
    let moved = false;
    let continueChecking = true;
    
    // Keep checking until no more moves are possible
    while (continueChecking) {
        continueChecking = false;
        
        // Check waste
        if (waste.length > 0) {
            const wasteCard = waste[waste.length - 1];
            for (let i = 0; i < foundations.length; i++) {
                if (canMoveToFoundation(wasteCard, i)) {
                    const source = { type: 'waste', cardIndex: waste.length - 1 };
                    moveCardToFoundation(wasteCard, source, i);
                    moved = true;
                    continueChecking = true;
                    break;
                }
            }
        }
        
        if (continueChecking) continue;
        
        // Check tableau top cards
        for (let i = 0; i < tableau.length; i++) {
            const column = tableau[i];
            if (column.length > 0) {
                const topCard = column[column.length - 1];
                if (topCard.faceUp) {
                    for (let j = 0; j < foundations.length; j++) {
                        if (canMoveToFoundation(topCard, j)) {
                            const source = { type: 'tableau', index: i, cardIndex: column.length - 1 };
                            moveCardToFoundation(topCard, source, j);
                            moved = true;
                            continueChecking = true;
                            break;
                        }
                    }
                    if (continueChecking) break;
                }
            }
        }
    }
    
    return moved;
}

// Undo functionality
function recordGameState() {
    const gameState = {
        stock: JSON.parse(JSON.stringify(stock)),
        waste: JSON.parse(JSON.stringify(waste)),
        foundations: JSON.parse(JSON.stringify(foundations)),
        tableau: JSON.parse(JSON.stringify(tableau)),
        score: score,
        moves: moves
    };
    
    moveHistory.push(gameState);
    
    // Keep history manageable - max 50 moves
    if (moveHistory.length > 50) {
        moveHistory.shift();
    }
}

function undo() {
    if (moveHistory.length <= 1) {
        // Nothing to undo or at initial state
        return;
    }
    
    // Remove current state
    moveHistory.pop();
    
    // Get previous state
    const previousState = moveHistory[moveHistory.length - 1];
    
    // Restore game state
    stock = previousState.stock;
    waste = previousState.waste;
    foundations = previousState.foundations;
    tableau = previousState.tableau;
    score = previousState.score;
    moves = previousState.moves;
    
    // Clear selection
    deselectCard();
    clearHint();
    
    // Update UI
    updateStats();
    renderGame();
}

// Hint system
function giveHint() {
    clearHint(); // Clear any previous hint
    
    // Find possible moves in order of priority
    const moves = findAllPossibleMoves();
    
    if (moves.length === 0) {
        if (stock.length > 0) {
            // Suggest drawing a card
            showHintMessage("Hint: Draw a card from the stock.");
            stockEl.classList.add('hint-highlight');
            setTimeout(() => {
                stockEl.classList.remove('hint-highlight');
            }, 3000);
        } else if (waste.length > 0) {
            // Suggest recycling waste
            showHintMessage("Hint: Recycle the waste pile back to stock.");
            stockEl.classList.add('hint-highlight');
            setTimeout(() => {
                stockEl.classList.remove('hint-highlight');
            }, 3000);
        } else {
            // No moves available
            showHintMessage("No more moves available. Try starting a new game.");
        }
        return;
    }
    
    // Use the highest priority move
    const bestMove = moves[0];
    
    // Highlight the card to move
    hintHighlight = {
        card: bestMove.card,
        target: bestMove.target
    };
    
    // Show message
    let message = "";
    
    if (bestMove.type === 'foundation') {
        message = `Hint: Move ${bestMove.card.value}${bestMove.card.suit} to foundation ${bestMove.targetIndex + 1}.`;
        
        // Highlight the target foundation
        foundationEls[bestMove.targetIndex].classList.add('hint-target');
        setTimeout(() => {
            foundationEls[bestMove.targetIndex].classList.remove('hint-target');
        }, 3000);
    } else if (bestMove.type === 'tableau') {
        message = `Hint: Move ${bestMove.card.value}${bestMove.card.suit} to tableau column ${bestMove.targetIndex + 1}.`;
        
        // Highlight the target tableau
        tableauColumns[bestMove.targetIndex].classList.add('hint-target');
        setTimeout(() => {
            tableauColumns[bestMove.targetIndex].classList.remove('hint-target');
        }, 3000);
    }
    
    showHintMessage(message);
    renderGame();
    
    // Clear hint after a few seconds
    setTimeout(clearHint, 3000);
}

function showHintMessage(message) {
    // Create or update hint message element
    let hintMsg = document.getElementById('hint-message');
    
    if (!hintMsg) {
        hintMsg = document.createElement('div');
        hintMsg.id = 'hint-message';
        document.body.appendChild(hintMsg);
    }
    
    hintMsg.textContent = message;
    hintMsg.classList.add('show');
    
    // Hide after a few seconds
    setTimeout(() => {
        hintMsg.classList.remove('show');
    }, 3000);
}

function clearHint() {
    hintHighlight = null;
    
    // Remove highlight classes
    document.querySelectorAll('.hint-highlight, .hint-target').forEach(el => {
        el.classList.remove('hint-highlight', 'hint-target');
    });
    
    // Hide message if visible
    const hintMsg = document.getElementById('hint-message');
    if (hintMsg) {
        hintMsg.classList.remove('show');
    }
}

function findAllPossibleMoves() {
    const possibleMoves = [];
    
    // Check tableau to foundation moves (highest priority)
    for (let i = 0; i < tableau.length; i++) {
        const column = tableau[i];
        if (column.length === 0) continue;
        
        const topCard = column[column.length - 1];
        if (!topCard.faceUp) continue;
        
        for (let j = 0; j < foundations.length; j++) {
            if (canMoveToFoundation(topCard, j)) {
                possibleMoves.push({
                    priority: 1,
                    type: 'foundation',
                    card: topCard,
                    source: { type: 'tableau', index: i, cardIndex: column.length - 1 },
                    targetIndex: j,
                    target: foundations[j]
                });
            }
        }
    }
    
    // Check waste to foundation moves
    if (waste.length > 0) {
        const wasteCard = waste[waste.length - 1];
        
        for (let j = 0; j < foundations.length; j++) {
            if (canMoveToFoundation(wasteCard, j)) {
                possibleMoves.push({
                    priority: 2,
                    type: 'foundation',
                    card: wasteCard,
                    source: { type: 'waste', cardIndex: waste.length - 1 },
                    targetIndex: j,
                    target: foundations[j]
                });
            }
        }
    }
    
    // Check tableau to tableau moves for face-down cards
    for (let i = 0; i < tableau.length; i++) {
        const column = tableau[i];
        if (column.length === 0) continue;
        
        // Find the first face up card
        let faceUpIndex = -1;
        for (let j = 0; j < column.length; j++) {
            if (column[j].faceUp) {
                faceUpIndex = j;
                break;
            }
        }
        
        if (faceUpIndex === -1 || faceUpIndex === column.length - 1) continue;
        
        // Try to move the stack to reveal a face-down card
        const card = column[faceUpIndex];
        const stack = column.slice(faceUpIndex);
        
        for (let j = 0; j < tableau.length; j++) {
            if (i === j) continue; // Skip same column
            
            const targetColumn = tableau[j];
            
            if (targetColumn.length === 0) {
                // Empty column - only Kings
                if (card.value === 'K') {
                    possibleMoves.push({
                        priority: 3,
                        type: 'tableau',
                        card: card,
                        stack: stack,
                        source: { type: 'tableau', index: i, cardIndex: faceUpIndex },
                        targetIndex: j,
                        target: targetColumn
                    });
                }
            } else {
                const targetCard = targetColumn[targetColumn.length - 1];
                if (canStackOnCard(card, targetCard)) {
                    possibleMoves.push({
                        priority: 3,
                        type: 'tableau',
                        card: card,
                        stack: stack,
                        source: { type: 'tableau', index: i, cardIndex: faceUpIndex },
                        targetIndex: j,
                        target: targetColumn
                    });
                }
            }
        }
    }
    
    // Check waste to tableau moves
    if (waste.length > 0) {
        const wasteCard = waste[waste.length - 1];
        
        for (let j = 0; j < tableau.length; j++) {
            const targetColumn = tableau[j];
            
            if (targetColumn.length === 0) {
                // Empty column - only Kings
                if (wasteCard.value === 'K') {
                    possibleMoves.push({
                        priority: 4,
                        type: 'tableau',
                        card: wasteCard,
                        source: { type: 'waste', cardIndex: waste.length - 1 },
                        targetIndex: j,
                        target: targetColumn
                    });
                }
            } else {
                const targetCard = targetColumn[targetColumn.length - 1];
                if (canStackOnCard(wasteCard, targetCard)) {
                    possibleMoves.push({
                        priority: 4,
                        type: 'tableau',
                        card: wasteCard,
                        source: { type: 'waste', cardIndex: waste.length - 1 },
                        targetIndex: j,
                        target: targetColumn
                    });
                }
            }
        }
    }
    
    // Check foundation to tableau moves (lowest priority - rarely useful)
    for (let i = 0; i < foundations.length; i++) {
        const foundation = foundations[i];
        if (foundation.length === 0) continue;
        
        const topCard = foundation[foundation.length - 1];
        
        for (let j = 0; j < tableau.length; j++) {
            const targetColumn = tableau[j];
            if (targetColumn.length === 0) continue; // Skip empty columns for foundation moves
            
            const targetCard = targetColumn[targetColumn.length - 1];
            if (canStackOnCard(topCard, targetCard)) {
                possibleMoves.push({
                    priority: 5,
                    type: 'tableau',
                    card: topCard,
                    source: { type: 'foundation', index: i, cardIndex: foundation.length - 1 },
                    targetIndex: j,
                    target: targetColumn
                });
            }
        }
    }
    
    // Sort by priority
    possibleMoves.sort((a, b) => a.priority - b.priority);
    
    return possibleMoves;
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
        gameWon();
    }
}

function gameWon() {
    stopTimer();
    
    // Update stats
    gamesPlayed++;
    gamesWon++;
    currentStreak++;
    
    if (seconds < bestTime || bestTime === 999999) {
        bestTime = seconds;
    }
    
    if (score > bestScore) {
        bestScore = score;
    }
    
    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
    }
    
    // Save stats
    saveStats();
    
    // Update win screen
    finalTimeEl.textContent = formatTime(seconds);
    finalMovesEl.textContent = moves;
    finalScoreEl.textContent = score;
    
    // Show best stats
    const bestTimeEl = document.createElement('p');
    bestTimeEl.textContent = `Best Time: ${formatTime(bestTime)}`;
    
    const bestScoreEl = document.createElement('p');
    bestScoreEl.textContent = `Best Score: ${bestScore}`;
    
    const streakEl = document.createElement('p');
    streakEl.textContent = `Current Streak: ${currentStreak}`;
    
    const winContent = document.querySelector('#win-modal .modal-content');
    const buttonsContainer = document.querySelector('.win-buttons');
    
    // Remove previous best stats if they exist
    document.querySelectorAll('.best-stat').forEach(el => el.remove());
    
    // Add new best stats
    bestTimeEl.className = 'best-stat';
    bestScoreEl.className = 'best-stat';
    streakEl.className = 'best-stat';
    
    winContent.insertBefore(bestTimeEl, buttonsContainer);
    winContent.insertBefore(bestScoreEl, buttonsContainer);
    winContent.insertBefore(streakEl, buttonsContainer);
    
    // Show win modal
    winModal.style.display = 'flex';
    createConfetti();
    
    // Clean up saved game
    localStorage.removeItem('savedGame');
}

function saveStats() {
    localStorage.setItem('gamesPlayed', gamesPlayed.toString());
    localStorage.setItem('gamesWon', gamesWon.toString());
    localStorage.setItem('bestTime', bestTime.toString());
    localStorage.setItem('bestScore', bestScore.toString());
    localStorage.setItem('currentStreak', currentStreak.toString());
    localStorage.setItem('bestStreak', bestStreak.toString());
}

// Confetti animation for win screen
function createConfetti() {
    confettiContainer.innerHTML = '';
    
    // Create 150 confetti pieces
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const colors = ['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const rotation = Math.random() * 360;
        const positionX = Math.random() * 100;
        
        // Random shapes
        const shapes = ['circle', 'square', 'triangle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.classList.add(shape);
        
        // Set styles
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.transform = `rotate(${rotation}deg)`;
        confetti.style.left = `${positionX}%`;
        confetti.style.top = '-20px';
        
        // Animation
        confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards ${Math.random() * 2}s`;
        
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
            
            .confetti.triangle {
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
            
            .confetti.circle {
                border-radius: 50%;
            }
            
            #hint-message {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--accent-color);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
            }
            
            #hint-message.show {
                opacity: 1;
            }
            
            .hint-highlight {
                box-shadow: 0 0 0 3px gold, 0 5px 15px rgba(0, 0, 0, 0.3) !important;
                animation: pulse 1s infinite alternate;
            }
            
            .hint-target {
                box-shadow: 0 0 0 3px lime, 0 5px 15px rgba(0, 0, 0, 0.3) !important;
                animation: pulse 1s infinite alternate;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 3px gold, 0 5px 15px rgba(0, 0, 0, 0.3); }
                100% { box-shadow: 0 0 0 5px gold, 0 5px 25px rgba(0, 0, 0, 0.5); }
            }
            
            .checkbox-option {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .checkbox-option input[type="checkbox"] {
                width: 18px;
                height: 18px;
            }
            
            .draw-indicator {
                position: absolute;
                top: 5px;
                right: 5px;
                background-color: rgba(255, 255, 255, 0.7);
                color: var(--primary-color);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 12px;
                font-weight: bold;
            }
            
            .recycle-icon {
                font-size: 2rem;
                color: rgba(255, 255, 255, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
            }
            
            .card .card-value {
                font-size: 1.8rem;
            }
            
            .card .corner-value {
                position: absolute;
                font-size: 0.7rem;
                line-height: 0.8;
            }
            
            .card .top-left {
                top: 5px;
                left: 5px;
                text-align: left;
            }
            
            .card .bottom-right {
                bottom: 5px;
                right: 5px;
                transform: rotate(180deg);
                text-align: left;
            }
            
            .selected-stack {
                box-shadow: 0 0 0 2px gold, 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .non-interactive {
                pointer-events: none;
            }
            
            .valid-drop {
                background-color: rgba(0, 255, 0, 0.2) !important;
            }
            
            .invalid-drop {
                background-color: rgba(255, 0, 0, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize event listeners
function initEventListeners() {
    // Menu navigation
    startGameBtn.addEventListener('click', () => {
        hideMenu();
        initGame();
    });
    
    howToPlayBtn.addEventListener('click', showHowToPlay);
    closeHowToBtn.addEventListener('click', hideHowToPlay);
    
    optionsBtn.addEventListener('click', showOptions);
    saveOptionsBtn.addEventListener('click', saveOptions);
    
    // Game controls
    stockEl.addEventListener('click', () => {
        if (isGameStarted) {
            clearHint();
            drawCard();
        }
    });
    
    newGameBtn.addEventListener('click', () => {
        if (confirm("Start a new game? Current progress will be lost.")) {
            initGame();
        }
    });
    
    menuBtn.addEventListener('click', showMenu);
    
    undoBtn.addEventListener('click', () => {
        if (isGameStarted) {
            undo();
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
    
    // Theme selection
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
    
    // Set up drag and drop
    setupDropTargets();
    
    // Auto-save game every 30 seconds
    setInterval(saveGameState, 30000);
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    // Set up additional options
    setupAdditionalOptions();
    
    // Add confetti and custom styles
    addConfettiStyle();
    
    // Initialize event listeners
    initEventListeners();
    
    // Apply saved theme and animation speed
    setTheme(currentTheme);
    document.documentElement.style.setProperty('--animation-multiplier', 1 / animationSpeed);
    
    // Try to load saved game
    if (!loadGameState()) {
        // No saved game - show menu
        showMenu();
    } else {
        // Game loaded - start timer if game was in progress
        if (isGameStarted) {
            hideMenu();
            startTimer();
        } else {
            showMenu();
        }
    }
});