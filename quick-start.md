# Quick Start Guide

Get the LLM Sci-Fi Game running in 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js (v16+)
- ✅ Python (v3.8+)
- ✅ Ollama installed

## 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
cd ..
```

## 2. Set Up Ollama

```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.ai

# Pull a model
ollama pull llama2
```

## 3. Add Assets (Optional for Testing)

For testing without assets, the game will work with placeholder files. For full experience:

1. Download [Kenney's sci-fi RTS pack](https://kenney.nl/assets/sci-fi-rts)
2. Replace placeholder files in `assets/` folder
3. Update `assets/maps/main-map.json` tileset reference

## 4. Start the Game

```bash
# Start both frontend and backend
npm start

# Or start separately:
# Terminal 1: npm run backend
# Terminal 2: npm run dev
```

## 5. Play!

- Open: http://localhost:3000
- Use arrow keys to move
- Click NPCs to talk
- Press Q to open quest log

## Troubleshooting

**Game won't start?**
- Check browser console for errors
- Ensure both servers are running
- Verify Ollama is running: `ollama list`

**No LLM responses?**
- Check Ollama: `ollama list`
- Verify model is downloaded: `ollama pull llama2`
- Check backend logs for errors

**Assets not loading?**
- Replace placeholder files with actual assets
- Check file paths in browser console

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Add your own NPCs in `src/data/NPCData.js`
- Create custom maps with Tiled
- Extend the quest system

Happy coding! 🚀 