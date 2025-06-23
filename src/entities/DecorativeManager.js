export class DecorativeManager {
    constructor(scene) {
        this.scene = scene;
        this.decorations = [];
        this.spawnDecorations();
    }

    spawnDecorations() {
        // Place structures in the center outpost area (chunk 0,0)
        // This creates a central hub for the player to return to
        
        // --- Core Outpost Structures ---
        // Main Command Center (central location)
        this.addDecoration('scifiStructure_01', 0, 0, 'Command Center');
        
        // Engineering Bay (near the engineer NPC)
        this.addDecoration('scifiStructure_03', 200, -50, 'Engineering Bay');
        
        // Trading Post (near the trader NPC)
        this.addDecoration('scifiStructure_07', 50, 200, 'Trading Post');

        // --- Single Vehicle ---
        // Transport Vehicle (central area)
        this.addDecoration('scifiUnit_25', 100, 100, 'Transport Vehicle');
    }

    addDecoration(spriteKey, x, y, name) {
        try {
            const decoration = this.scene.physics.add.sprite(x, y, spriteKey);
            decoration.setData('name', name);
            decoration.setData('type', 'decoration');
            
            // Set decoration to render on top of procedural tiles
            decoration.setDepth(1000);
            
            // Make decorations interactive for tooltips
            decoration.setInteractive();
            decoration.on('pointerover', () => {
                decoration.setTint(0x00ff00);
                if (window.uiManager) {
                    window.uiManager.showTooltip(name, decoration);
                }
            });
            
            decoration.on('pointerout', () => {
                decoration.clearTint();
                if (window.uiManager) {
                    window.uiManager.hideTooltip();
                }
            });
            
            this.decorations.push(decoration);
            console.log(`Spawned decoration: ${name} at (${x}, ${y})`);
        } catch (error) {
            console.warn(`Failed to spawn decoration ${spriteKey}:`, error);
        }
    }

    update() {
        // Future: Add dynamic decoration spawning based on player exploration
        // For now, decorations are static in the center outpost
    }

    getDecorations() {
        return this.decorations;
    }
} 