import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { UIManager } from './ui/UIManager.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: 1024,
    height: 768,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Log the configuration to the console for debugging
console.log("Phaser Game Configuration:", config);

// Initialize the game
const game = new Phaser.Game(config);

// Make game instance globally available for debugging
window.game = game; 