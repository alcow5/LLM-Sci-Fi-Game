import { Player } from '../entities/Player.js';
import { NPCManager } from '../entities/NPCManager.js';
import { DialogueManager } from '../ui/DialogueManager.js';
import { QuestManager } from '../systems/QuestManager.js';
import { DecorativeManager } from '../entities/DecorativeManager.js';
import { ItemManager } from '../entities/ItemManager.js';
import { ProceduralMapGenerator } from '../systems/ProceduralMapGenerator.js';
import { NPCData } from '../data/NPCData.js';
import { ItemData } from '../data/ItemData.js';
import { UIManager } from '../ui/UIManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.npcManager = null;
        this.dialogueManager = null;
        this.questManager = null;
        this.decorativeManager = null;
        this.itemManager = null;
        this.proceduralMap = null;
        this.keys = null;
        this.tileset = null;
    }

    preload() {
        // Load tileset for procedural generation
        this.load.image('tiles', '/assets/tilesets/sci-fi-rts.png');
        
        // Load player sprite (using a unique unit sprite for now)
        this.load.image('player_sprite', '/assets/sprites/scifiUnit_05.png');
        
        // Load NPC sprites dynamically based on NPCData
        NPCData.forEach(npcConfig => {
            this.load.image(npcConfig.spriteKey, `/assets/sprites/${npcConfig.spriteKey}.png`);
        });
        
        // Load decorative sprites
        this.loadDecorativeSprites();
        
        // Load UI elements
        this.load.image('ui-button', '/assets/ui/button.png');
        this.load.image('ui-panel', '/assets/ui/panel.png');

        // Load item sprites
        Object.values(ItemData).forEach(item => {
            this.load.image(item.spriteKey, `/assets/kenney_sci-fi-rts/PNG/Default size/Environment/${item.spriteKey}.png`);
        });
    }

    loadDecorativeSprites() {
        // Load structure sprites
        for (let i = 1; i <= 16; i++) {
            this.load.image(`scifiStructure_${i.toString().padStart(2, '0')}`, `/assets/kenney_sci-fi-rts/PNG/Default size/Structure/scifiStructure_${i.toString().padStart(2, '0')}.png`);
        }
        
        // Load unit/vehicle sprites (we'll use some for vehicles and robots)
        for (let i = 25; i <= 35; i++) {
            this.load.image(`scifiUnit_${i.toString().padStart(2, '0')}`, `/assets/kenney_sci-fi-rts/PNG/Default size/Unit/scifiUnit_${i.toString().padStart(2, '0')}.png`);
        }
        
        // Load environment sprites
        for (let i = 1; i <= 20; i++) {
            this.load.image(`scifiEnvironment_${i.toString().padStart(2, '0')}`, `/assets/kenney_sci-fi-rts/PNG/Default size/Environment/scifiEnvironment_${i.toString().padStart(2, '0')}.png`);
        }
    }

    create() {
        // Create procedural map generator
        this.proceduralMap = new ProceduralMapGenerator(this);
        
        // Create tileset for rendering - use the correct Phaser method
        this.tileset = this.textures.get('tiles');
        
        // Create player in the center of the world
        this.player = new Player(this, 0, 0);
        
        // Create NPC manager
        this.npcManager = new NPCManager(this);
        
        // Create dialogue manager
        this.dialogueManager = new DialogueManager(this);
        
        // Create quest manager
        this.questManager = new QuestManager(this);
        
        // Create decorative manager
        this.decorativeManager = new DecorativeManager(this);
        
        // Create item manager
        this.itemManager = new ItemManager(this);

        // Make game scene globally accessible for UI input management
        window.gameScene = this;
        
        // Make dialogue manager globally accessible for quest turn-in
        window.dialogueManager = this.dialogueManager;

        // Create UI manager *after* gameScene is globally available
        window.uiManager = new UIManager();
        
        // Setup input for both arrow keys and WASD
        this.keys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            up_arrow: 'UP',
            down_arrow: 'DOWN',
            left_arrow: 'LEFT',
            right_arrow: 'RIGHT'
        });
        
        // Setup camera to follow player with lerp for smoothing
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        
        // Set initial world bounds for infinite exploration
        const initialBounds = 10000; // Large initial bounds
        this.physics.world.setBounds(-initialBounds, -initialBounds, initialBounds * 2, initialBounds * 2);
    }

    update() {
        if (this.player) {
            this.player.update(this.keys);
        }
        
        if (this.npcManager) {
            this.npcManager.update();
        }
        
        if (this.itemManager) {
            this.itemManager.update(this.time.now);
        }
        
        if (this.decorativeManager) {
            this.decorativeManager.update();
        }
        
        // Update procedural map with player position
        if (this.proceduralMap && this.player) {
            this.proceduralMap.update(this.player.sprite.x, this.player.sprite.y);
        }
    }
} 