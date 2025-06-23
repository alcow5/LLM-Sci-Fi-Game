export class Item {
    constructor(scene, x, y, spriteKey, itemId, itemName) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, spriteKey);
        this.itemId = itemId;
        this.itemName = itemName;
        this.spriteKey = spriteKey;
        this.sprite.setData('itemInstance', this);

        // Set item to render on top of procedural tiles
        this.sprite.setDepth(1000);

        // Set up interactive properties
        this.sprite.setInteractive();
        
        // Hover effects
        this.sprite.on('pointerover', () => {
            this.sprite.setTint(0x00ff00);
            if (window.uiManager) {
                window.uiManager.showTooltip(`Click to pick up ${this.itemName}`, this.sprite);
            }
        });
        
        this.sprite.on('pointerout', () => {
            this.sprite.clearTint();
            if (window.uiManager) {
                window.uiManager.hideTooltip();
            }
        });
        
        // Click to collect functionality
        this.sprite.on('pointerdown', () => {
            this.tryCollect();
        });
    }

    tryCollect() {
        // Check if player is close enough (within 64 pixels)
        const player = this.scene.player;
        if (!player) return;
        
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );
        
        if (distance <= 64) { // 64 pixels = 2 tiles
            this.collect();
        } else {
            // Show message that player needs to get closer
            if (window.uiManager) {
                window.uiManager.showMessage(`You need to get closer to pick up ${this.itemName}`, 2000);
            }
        }
    }

    collect() {
        if (window.uiManager) {
            window.uiManager.hideTooltip();
            window.uiManager.showMessage(`Picked up ${this.itemName}!`, 1500);
        }
        
        // Only call item manager's collect method - it will handle player collection
        if (this.scene.itemManager) {
            this.scene.itemManager.collectItem(this);
        }
    }
} 