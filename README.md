# LLM Sci-Fi Game

A 2D tile-based browser game with LLM-powered NPCs, dynamic quest generation, inventory system, and interactive dialogue using Phaser.js and Flask with Ollama integration.

---

## 🎮 Features (2025-01)

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
- **Enhanced NPC Memory System** with categorized memories and relationship tracking
- **Context-aware NPC dialogue** that remembers conversation history and emotional context
- **Player-driven quest suggestions** with LLM-powered generation
- **Item collection and management** with quantity tracking and respawn
- **Quest completion tracking** with automatic reward distribution
- **Real-time UI updates** with tooltips and notifications
- **Procedural map with dynamic rendering and chunk management**
- **LLM model swap support** (e.g., llama2-uncensored, mythomax-13b)
- **Smart quest detection** to distinguish between casual conversation and quest requests
- **Enhanced UI positioning** with optimized layout and auto-hiding messages

---

## 📁 Project Structure (2025-01)

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
├── organize-assets.ps1
├── start-game.ps1
├── start-game.sh
└── start-game.bat
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
   # Pull a model (e.g., llama2-uncensored)
   ollama pull llama2-uncensored
   ```

### Running the Game

#### Option 1: Using Service Management Scripts (Recommended)

**Windows (PowerShell):**
```powershell
# Start all services
.\start-game.ps1 start

# Stop all services
.\start-game.ps1 stop

# Restart all services
.\start-game.ps1 restart

# Check service status
.\start-game.ps1 status

# View backend logs
.\start-game.ps1 logs
```

**Windows (Command Prompt):**
```cmd
# Start all services
start-game.bat start

# Stop all services
start-game.bat stop

# Restart all services
start-game.bat restart

# Check service status
start-game.bat status
```

**Linux/macOS:**
```bash
# Make script executable (first time only)
chmod +x start-game.sh

# Start all services
./start-game.sh start

# Stop all services
./start-game.sh stop

# Restart all services
./start-game.sh restart

# Check service status
./start-game.sh status

# View backend logs
./start-game.sh logs
```

#### Option 2: Manual Start (Traditional Method)

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

## 🔧 Service Management

The game includes comprehensive service management scripts that handle starting, stopping, and monitoring both frontend and backend services.

### Features
- **Automatic port checking** - Prevents conflicts with existing services
- **Process management** - Properly starts and stops services
- **Status monitoring** - Shows which services are running
- **Prerequisites checking** - Verifies Node.js, Python, and dependencies
- **Log viewing** - Easy access to backend logs
- **Cross-platform support** - Works on Windows, Linux, and macOS

### Script Commands
- `start` - Start both frontend and backend services
- `stop` - Stop both frontend and backend services  
- `restart` - Restart both services
- `status` - Show status of all services (including Ollama)
- `logs` - Display recent backend logs

### Service Ports
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Ollama**: http://localhost:11434

### Troubleshooting
If services fail to start:
1. Check if ports are already in use
2. Verify all prerequisites are installed
3. Ensure Ollama is running (`ollama serve`)
4. Check the script output for specific error messages

---

## 🏗️ System Architecture

### Frontend (Phaser.js + Vite)
- **GameScene.js**: Main game world rendering, tilemap loading, and scene management
- **Player.js**: Player entity with movement, collision detection, and context tracking
- **NPCManager.js**: NPC spawning, management, and interaction handling (including Rick, the unfiltered NPC)
- **ItemManager.js**: Item spawning, collection, respawn, and world item management
- **DecorativeManager.js**: Static environment decorations with interactive tooltips
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
- **DecorativeManager.js**: Static environment decorations with interactive tooltips

#### UI Systems
- **UIManager.js**: Centralized UI management including:
  - Dialogue box with options (positioned to avoid inventory overlap)
  - Quest log with active quests
  - 4x4 inventory grid with drag-and-drop (permanently positioned bottom-right)
  - Crypto currency display
  - Custom input system with right margin for inventory
  - Tooltip system
  - Message notifications (auto-hide after 2 seconds)
  - Log viewer with clear functionality
  - "Too far away" messages (top-left, auto-hide)

- **DialogueManager.js**: Advanced dialogue system featuring:
  - LLM-powered NPC responses
  - Enhanced conversation context tracking with categorized memories
  - Smart quest detection to avoid false positives
  - Quest suggestion handling
  - Accept/decline quest options
  - Multiple dialogue topics
  - Relationship scoring and emotional context tracking

#### Game Systems
- **QuestManager.js**: Comprehensive quest system with:
  - Dynamic quest generation with LLM integration
  - Quest acceptance/decline functionality
  - Progress tracking
  - Completion validation
  - Reward distribution with crypto currency
  - Pending quest management
  - Fallback quest generation

- **InventoryManager.js**: Inventory and currency system:
  - 4x4 grid inventory with permanent bottom-right positioning
  - Item stacking with quantities (max 99 per stack)
  - Crypto currency tracking
  - Drag-and-drop repositioning
  - Tooltip information

- **ProceduralMapGenerator.js**: Infinite world generation:
  - Chunk-based map generation (16x16 tiles per chunk)
  - Multiple biomes (outpost, wasteland, crystal_field, industrial)
  - Dynamic rendering and cleanup
  - Item spawning in chunks
  - Performance optimization for large worlds

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
- `POST /api/quest`: Generate quests for NPCs
- `GET /api/logs`: Retrieve backend logs for debugging
- `POST /api/logs/clear`: Clear backend logs
- `POST /api/save`: Save game state
- `GET /api/load`: Load latest game state

#### LLM Integration
- **Ollama Integration**: Local LLM processing for:
  - Contextual NPC responses with memory integration
  - Dynamic quest generation
  - Personality-driven dialogue
  - Fallback quest generation
  - Token usage monitoring and context window management

## 🎮 Gameplay Systems

### Enhanced NPC Memory System
- **Categorized Memories**: Personal info, relationships, quests, promises, emotional moments, gossip, trade, events
- **Emotional Context Tracking**: Records emotional context of conversations
- **Memory Importance Scoring**: Prioritizes important memories for retention
- **Relationship Scoring**: Tracks trust, friendship, and other relationship metrics
- **Memory Pruning**: Keeps only the most important memories (max 10 per NPC)
- **Debug Tools**: View and clear NPC memories through UI

### NPC Dialogue System
- **Context-Aware Responses**: NPCs remember conversation history and emotional context
- **Personality-Driven**: Each NPC has unique dialogue style and personality
- **Topic-Based**: Multiple conversation topics available
- **Quest Integration**: Seamless quest offering and completion
- **Player Suggestions**: Players can suggest quest ideas
- **Smart Quest Detection**: Distinguishes between casual conversation and quest requests
- **Unfiltered NPC**: Rick "The Unfiltered" - completely unfiltered dialogue with no social boundaries

### Quest System
- **Dynamic Generation**: Quests generated based on available items, NPCs, and player suggestions
- **Accept/Decline Options**: Players choose which quests to accept
- **Multiple Types**: Collect items, talk to NPCs, and more
- **Progress Tracking**: Real-time quest progress updates
- **Reward System**: Crypto currency rewards for completion
- **LLM Integration**: AI-powered quest generation with personality matching
- **Fallback System**: Automatic fallback quests if LLM generation fails

### Inventory System
- **4x4 Grid Layout**: Organized item storage with permanent bottom-right positioning
- **Item Stacking**: Multiple items of same type stack together (max 99 per stack)
- **Drag-and-Drop**: Reposition items within inventory
- **Quantity Display**: Shows item quantities clearly
- **Tooltip Information**: Detailed item information on hover
- **Crypto Integration**: Automatic crypto rewards for quest completion

### Currency System
- **Crypto Currency**: In-game currency for quest rewards
- **Automatic Tracking**: Integrated with quest completion
- **UI Display**: Shows current balance in inventory
- **Reward Distribution**: Automatic crypto rewards for quests

### Procedural World Generation
- **Infinite Map**: Procedurally generated world that expands as player explores
- **Multiple Biomes**: Outpost, wasteland, crystal fields, industrial areas
- **Chunk-Based Loading**: Efficient memory usage with dynamic rendering
- **Item Spawning**: Items spawn in chunks based on player proximity
- **Performance Optimization**: Unloads distant chunks to maintain performance

## 🔧 Configuration

### Backend Configuration

Environment variables for the Flask backend:

```bash
OLLAMA_URL=http://localhost:11434  # Ollama server URL
OLLAMA_MODEL=llama2-uncensored    # Model to use for LLM responses
USE_LLM_QUESTS=true               # Enable LLM quest generation
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
  "npc_id": "commander_sarah",
  "npc_name": "Commander Sarah Chen",
  "npc_personality": "authoritative, strategic, concerned about colony security",
  "npc_role": "Outpost Commander",
  "npc_background": "Former military officer, now leads this frontier outpost",
  "npc_dialogue_style": "formal but approachable, uses military terminology",
  "player_message": "Tell me about your role",
  "player_context": {
    "position": {"x": 400, "y": 300},
    "active_quests": [],
    "inventory": [...],
    "crypto": 0
  },
  "memory_context": "Previous conversation context and memories..."
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
   - Ensure Ollama model is downloaded: `ollama pull llama2-uncensored`
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

6. **UI positioning issues**
   - Check that inventory is positioned correctly (bottom-right)
   - Verify dialogue and input boxes have proper margins
   - Ensure "too far away" messages appear in top-left

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

### Memory System Debug

Access NPC memory debug tools:
- Press 'L' to view backend logs
- Use the debug memory viewer in the UI
- Check console for memory system logs

## 🔄 Development Workflow

### Adding New Features

1. **New NPCs**: Add to `src/data/NPCData.js` and update personality descriptions
2. **New Items**: Add to `src/data/ItemData.js` and update ItemManager
3. **New Quests**: Extend QuestManager with new quest types
4. **UI Elements**: Add to UIManager and integrate with existing systems
5. **Memory Categories**: Extend the memory system in DialogueManager

### Code Organization

- **Entities**: Game objects (Player, NPC, Item, Decorative)
- **Systems**: Core game logic (Quest, Inventory, ProceduralMap)
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
- [ ] Advanced AI behaviors for NPCs
- [ ] Real-time multiplayer synchronization

### Technical Improvements
- [ ] Enhanced error handling and recovery
- [ ] Performance optimization for larger worlds
- [ ] Advanced AI behaviors for NPCs
- [ ] Procedural quest generation
- [ ] Real-time multiplayer synchronization
- [ ] Memory persistence across sessions
- [ ] Advanced relationship dynamics

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
- Use the debug tools in the game UI 