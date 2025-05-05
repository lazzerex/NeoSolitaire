# NeoSolitaire

A modern twist on the classic Solitaire card game, featuring sleek animations, multiple themes, and intuitive gameplay. Part of the NEO game series.

Try it here: https://neo-solitaire.vercel.app/

![Game Screenshot](https://github.com/user-attachments/assets/...)
![Win Screen](https://github.com/user-attachments/assets/...)

## Features

- 🎨 4 Color Themes: Blue, Green, Purple, and Dark mode
- ⚡ Adjustable animation speed
- 🖱️ Dual control scheme: Drag-and-drop or click-to-move
- ⏮️ Undo functionality
- 💡 Smart hint system
- 🎉 Victory celebration with confetti animation
- ⏱️ Real-time game statistics (time, moves, score)
- 📱 Responsive design for all screen sizes
- 💾 Persistent settings with localStorage
- 🃏 Authentic Solitaire rules and mechanics
- 🎮 Smooth card animations and transitions
- 📊 Win screen with final stats

## How to Play

1. **Goal**: Build all four foundation piles from Ace to King, sorted by suit
2. **Stock/Waste**:
   - Click stock pile to draw cards
   - Three-card draw style (draws single cards)
3. **Tableau**:
   - Build descending sequences with alternating colors
   - Move groups of cards between columns
   - Click to reveal face-down cards
4. **Foundations**:
   - Drag Aces to start foundations
   - Build up in suit from Ace to King

## Game Rules

- Only Kings can be placed in empty tableau columns
- Tableau moves must alternate colors and descend in value
- Foundations must follow suit and ascend in value
- Unlimited stock recycling
- Complete all foundations to win

## Game Features

### Visual Customization
- Dynamic theme switching with smooth transitions
- Adjustable animation speed (Slow/Normal/Fast)
- Modern card back patterns
- Color-coded card suits

### Gameplay Enhancements
- Automatic card highlighting on selection
- Visual feedback for valid/invalid moves
- Persistent game settings across sessions
- Mobile-optimized touch controls
- Real-time move validation

### Technical Implementation
- Built with vanilla JavaScript (no dependencies)
- Object-oriented architecture:
  - Game logic (Card, Deck, Pile classes)
  - UI management (Renderer, Animator classes)
- Modern CSS features:
  - CSS Grid and Flexbox layouts
  - Custom properties for theming
  - Complex animations with keyframes
- Efficient card movement algorithms
- Browser localStorage for user preferences

## Setup

1. Clone the repository:
```bash
git clone https://github.com/lazzerex/NeoSolitaire.git
```

2. Open `index.html` in your browser or serve through a local web server

## Browser Support

The game works on all modern browsers that support:
- CSS Grid and Flexbox
- CSS Custom Properties (Variables)
- ES6+ JavaScript features
- localStorage API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


