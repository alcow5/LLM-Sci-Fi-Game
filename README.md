# LLM Sci-Fi Game

A 2D tile-based browser game with LLM-powered NPCs, dynamic quest generation, inventory system, and interactive dialogue using Phaser.js and Flask with Ollama integration.

---

## 🎮 Features (2025-06)

### Core Gameplay
- **Procedural, infinite map generation** with multiple biomes and chunk-based loading
- **Player movement** with keyboard controls and smooth camera lerp
- **Interactive NPCs** with click-to-talk functionality, including a fully unfiltered NPC (Rick)
- **LLM-powered dialogue** using Ollama for dynamic, contextual responses
- **Dynamic quest system** with accept/decline options and player-driven quest suggestions
- **4x4 grid inventory system** with drag-and-drop, stacking, and quantity tracking
- **Crypto currency system** for quest rewards
- **Quest log** with progress tracking and automatic turn-in
- **Decorative environment** with interactive elements and non-overlapping item spawns
- **Click-to-collect items** with respawn and proximity checks
- **Session-based NPC memory** for context-aware dialogue
- **Debug UI for viewing/clearing NPC memory**
- **Modular architecture** for easy expansion

### Advanced Systems
- **Context-aware NPC dialogue** that remembers conversation history
- **Player-driven quest suggestions** with LLM-powered generation
- **Item collection and management** with quantity tracking and respawn
- **Quest completion tracking** with automatic reward distribution
- **Real-time UI updates** with tooltips and notifications
- **Procedural map with dynamic rendering and chunk management**
- **LLM model swap support** (e.g., llama3:8b, mythomax-13b)

---

## 📁 Project Structure (2025-06)

```
LLMSciFiGame/
├── src/
│   ├── main.js
│   ├── scenes/
│   │   └── GameScene.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── NPC.js
│   │   ├── NPCManager.js
│   │   ├── Item.js
│   │   ├── ItemManager.js
│   │   └── DecorativeManager.js
│   ├── ui/
│   │   ├── UIManager.js
│   │   └── DialogueManager.js
│   ├── services/
│   │   └── APIService.js
│   ├── systems/
│   │   ├── QuestManager.js
│   │   ├── InventoryManager.js
│   │   └── ProceduralMapGenerator.js
│   └── data/
│       ├── NPCData.js
│       └── ItemData.js
├── backend/
│   ├── app.py
│   └── requirements.txt
├── assets/
│   ├── environment/
│   ├── kenney_sci-fi-rts/
│   ├── maps/
│   ├── sprites/
│   ├── structures/
│   ├── tilesets/
│   └── ui/
├── logs/
├── public/
├── package.json
├── vite.config.js
├── index.html
├── quick-start.md
└── organize-assets.ps1
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Ollama** (for LLM functionality)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/alcow5/LLM-Sci-Fi-Game.git
   cd LLMSciFiGame
   ```
2. **Install frontend dependencies**
   ```bash
   npm install
   ```
3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```
4. **Set up Ollama**
   ```bash
   # Install Ollama (see https://ollama.ai)
   # Pull a model (e.g., mythomax-13b)
   ollama pull mythomax-13b
   ```

### Running the Game
1. **Start the backend server**
   ```bash
   cd backend
   python app.py
   ```
2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
3. **Open your browser**
   - Frontend: http://localhost:3000 (or next available port)
   - Backend API: http://localhost:5000

---

## 🏗️ System Architecture

### Frontend (Phaser.js + Vite)
- **GameScene.js**: Main game world rendering, tilemap loading, and scene management
- **Player.js**: Player entity with movement, collision detection, and context tracking
- **NPCManager.js**: NPC spawning, management, and interaction handling (including Rick, the unfiltered NPC)
- **ItemManager.js**: Item spawning, collection, respawn, and world item management
- **UIManager.js**: Centralized UI management (dialogue, quest log, inventory, crypto, debug tools)
- **DialogueManager.js**: LLM-powered dialogue, context/memory, quest suggestion handling
- **QuestManager.js**: Dynamic quest generation, progress, completion, and rewards
- **InventoryManager.js**: 4x4 grid, stacking, drag-and-drop, crypto
- **ProceduralMapGenerator.js**: Infinite map, chunk loading, biomes
- **APIService.js**: Backend communication
- **NPCData.js**: NPC definitions (including Rick)
- **ItemData.js**: Item definitions

### Backend (Flask + Ollama)
- **app.py**: Flask API endpoints for dialogue, quest generation, health, and logs
- **requirements.txt**: Python dependencies
- **Ollama integration**: Local LLM for dialogue and quest generation
- **Logs**: Dialogue, quest, and error logs for debugging

---

## 📝 How to Push to GitHub

1. **Add your changes**
   ```bash
   git add .
   ```
2. **Commit your changes**
   ```bash
   git commit -m "Update features, systems, and documentation"
   ```
3. **Push to the remote repository**
   ```bash
   git push origin main
   # or, if your branch is different:
   git push origin <branch-name>
   ```

If you have not set the remote yet:
```bash
git remote add origin https://github.com/alcow5/LLM-Sci-Fi-Game.git
git push -u origin main
```

---

## 📄 License
MIT License

## 🙏 Credits
- **Game Engine**: Phaser.js
- **Assets**: Kenney's sci-fi RTS pack
- **LLM Integration**: Ollama
- **Backend Framework**: Flask
- **Development**: Built with modern JavaScript and Python

## 🎯 Game Controls

- **Arrow Keys**: Move player character
- **Mouse Click**: Interact with NPCs and objects
- **Q Key**: Toggle quest log
- **I Key**: Toggle inventory
- **L Key**: View backend logs
- **ESC**: Close dialogue windows and cancel input

## 🏗️ System Architecture

### Frontend (Phaser.js + Vite)

#### Core Systems
- **GameScene.js**: Main game world rendering, tilemap loading, and scene management
- **Player.js**: Player entity with movement, collision detection, and context tracking
- **NPCManager.js**: NPC spawning, management, and interaction handling
- **ItemManager.js**: Item spawning, collection, and world item management

#### UI Systems
- **UIManager.js**: Centralized UI management including:
  - Dialogue box with options
  - Quest log with active quests
  - 4x4 inventory grid with drag-and-drop
  - Crypto currency display
  - Custom input system
  - Tooltip system
  - Message notifications
  - Log viewer

- **DialogueManager.js**: Advanced dialogue system featuring:
  - LLM-powered NPC responses
  - Conversation context tracking
  - Quest suggestion handling
  - Accept/decline quest options
  - Multiple dialogue topics

#### Game Systems
- **QuestManager.js**: Comprehensive quest system with:
  - Dynamic quest generation
  - Quest acceptance/decline functionality
  - Progress tracking
  - Completion validation
  - Reward distribution
  - Pending quest management

- **InventoryManager.js**: Inventory and currency system:
  - 4x4 grid inventory
  - Item stacking with quantities
  - Crypto currency tracking
  - Drag-and-drop repositioning
  - Tooltip information

#### Services
- **APIService.js**: Backend communication with:
  - Dialogue generation requests
  - Quest generation requests
  - Error handling and fallbacks
  - Connection management

### Backend (Flask + Ollama)

#### API Endpoints
- `GET /api/health`: Health check endpoint
- `POST /api/dialogue`: Generate contextual NPC dialogue
- `POST /api/generate-quest`: Generate dynamic quests based on player suggestions
- `GET /api/logs`: Retrieve backend logs for debugging

#### LLM Integration
- **Ollama Integration**: Local LLM processing for:
  - Contextual NPC responses
  - Dynamic quest generation
  - Personality-driven dialogue
  - Fallback quest generation

## 🎮 Gameplay Systems

### NPC Dialogue System
- **Context-Aware Responses**: NPCs remember conversation history
- **Personality-Driven**: Each NPC has unique dialogue style
- **Topic-Based**: Multiple conversation topics available
- **Quest Integration**: Seamless quest offering and completion
- **Player Suggestions**: Players can suggest quest ideas

### Quest System
- **Dynamic Generation**: Quests generated based on available items and NPCs
- **Accept/Decline Options**: Players choose which quests to accept
- **Multiple Types**: Collect items, talk to NPCs, and more
- **Progress Tracking**: Real-time quest progress updates
- **Reward System**: Crypto currency rewards for completion

### Inventory System
- **4x4 Grid Layout**: Organized item storage
- **Item Stacking**: Multiple items of same type stack together
- **Drag-and-Drop**: Reposition items within inventory
- **Quantity Display**: Shows item quantities clearly
- **Tooltip Information**: Detailed item information on hover

### Currency System
- **Crypto Currency**: In-game currency for quest rewards
- **Automatic Tracking**: Integrated with quest completion
- **UI Display**: Shows current balance in inventory
- **Reward Distribution**: Automatic crypto rewards for quests

## 🔧 Configuration

### Backend Configuration

Environment variables for the Flask backend:

```bash
OLLAMA_URL=http://localhost:11434  # Ollama server URL
OLLAMA_MODEL=llama3:8b            # Model to use for LLM responses
```

### Frontend Configuration

Edit `src/services/APIService.js` to change API endpoints:

```javascript
this.baseURL = 'http://localhost:5000';  // Backend server URL
```

## 📊 API Documentation

### Dialogue Endpoint
```http
POST /api/dialogue
Content-Type: application/json

{
  "npc_name": "Trader Eliza Thompson",
  "message": "Tell me about your role",
  "player_context": {
    "position": {"x": 400, "y": 300},
    "active_quests": [],
    "inventory": [...],
    "crypto": 0
  }
}
```

### Quest Generation Endpoint
```http
POST /api/generate-quest
Content-Type: application/json

{
  "npc_name": "Trader Eliza Thompson",
  "conversation_context": "...",
  "player_suggestion": "I want to collect items",
  "available_items": ["crystal_red", "iron_ore", ...],
  "available_npcs": ["Commander Sarah Chen", ...]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Assets not loading**
   - Ensure all placeholder files are replaced with actual assets
   - Check file paths in `src/scenes/GameScene.js`
   - Verify asset organization with `organize-assets.ps1`

2. **Backend connection failed**
   - Verify Ollama is running: `ollama list`
   - Check API URL in `src/services/APIService.js`
   - Review backend logs for errors
   - Ensure port 5000 is available

3. **LLM responses not working**
   - Ensure Ollama model is downloaded: `ollama pull llama3:8b`
   - Check model name in backend configuration
   - Verify Ollama API is accessible at http://localhost:11434
   - Check backend logs for LLM errors

4. **Game not starting**
   - Check browser console for JavaScript errors
   - Verify all dependencies are installed
   - Ensure both frontend and backend are running
   - Check for port conflicts

5. **Quest system issues**
   - Verify QuestManager is properly initialized
   - Check NPC data in `src/data/NPCData.js`
   - Ensure ItemManager has available items
   - Review quest generation logs

### Debug Mode

Enable debug logging:

```javascript
// In src/main.js
const config = {
  // ... other config
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true  // Enable physics debug
    }
  }
};
```

## 🔄 Development Workflow

### Adding New Features

1. **New NPCs**: Add to `src/data/NPCData.js` and update personality descriptions
2. **New Items**: Add to `src/data/ItemData.js` and update ItemManager
3. **New Quests**: Extend QuestManager with new quest types
4. **UI Elements**: Add to UIManager and integrate with existing systems

### Code Organization

- **Entities**: Game objects (Player, NPC, Item)
- **Systems**: Core game logic (Quest, Inventory)
- **UI**: User interface components
- **Services**: External API communication
- **Data**: Configuration and static data

## 🚀 Future Enhancements

### Planned Features
- [ ] Save/load game state persistence
- [ ] Multiple map zones and world expansion
- [ ] Sound effects and background music
- [ ] More advanced quest objectives
- [ ] Crafting system
- [ ] Trading between NPCs
- [ ] Character progression and skills
- [ ] Multiplayer support
- [ ] Mobile device support

### Technical Improvements
- [ ] Enhanced error handling and recovery
- [ ] Performance optimization for larger worlds
- [ ] Advanced AI behaviors for NPCs
- [ ] Procedural quest generation
- [ ] Real-time multiplayer synchronization

## 📄 License

This project is licensed under the MIT License.

## 🙏 Credits

- **Game Engine**: Phaser.js
- **Assets**: Kenney's sci-fi RTS pack
- **LLM Integration**: Ollama
- **Backend Framework**: Flask
- **Build Tool**: Vite
- **Development**: Built with modern JavaScript and Python

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review backend logs at http://localhost:5000/api/logs
- Check browser console for frontend errors
- Ensure all prerequisites are properly installed 