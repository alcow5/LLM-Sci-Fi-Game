import { InventoryManager } from '../systems/InventoryManager.js';

export class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'player_sprite');
        this.sprite.setCollideWorldBounds(true);
        
        // Set player to render on top of procedural tiles
        this.sprite.setDepth(1000);
        
        // Setup collision with walls (Temporarily disabled for debugging)
        // scene.physics.add.collider(this.sprite, scene.wallsLayer);
        
        // Player properties
        this.speed = 200;
        this.lastDirection = 'down';
        this.inventoryManager = new InventoryManager();
        
        // Create animations (Temporarily disabled to fix sprite rendering)
        // this.createAnimations();
        
        // Set initial animation (Temporarily disabled)
        // this.sprite.anims.play('player-idle-down');
    }

    createAnimations() {
        const { scene } = this;
        
        // Idle animations
        scene.anims.create({
            key: 'player-idle-down',
            frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
            frameRate: 10,
            repeat: -1
        });
        
        scene.anims.create({
            key: 'player-idle-up',
            frames: scene.anims.generateFrameNumbers('player', { start: 1, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        
        scene.anims.create({
            key: 'player-idle-left',
            frames: scene.anims.generateFrameNumbers('player', { start: 2, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        
        scene.anims.create({
            key: 'player-idle-right',
            frames: scene.anims.generateFrameNumbers('player', { start: 3, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Walking animations
        scene.anims.create({
            key: 'player-walk-down',
            frames: scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        
        scene.anims.create({
            key: 'player-walk-up',
            frames: scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });
        
        scene.anims.create({
            key: 'player-walk-left',
            frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1
        });
        
        scene.anims.create({
            key: 'player-walk-right',
            frames: scene.anims.generateFrameNumbers('player', { start: 16, end: 19 }),
            frameRate: 8,
            repeat: -1
        });
    }

    update(keys) {
        let velocityX = 0;
        let velocityY = 0;

        if (keys.left.isDown || keys.left_arrow.isDown) {
            velocityX = -this.speed;
        } else if (keys.right.isDown || keys.right_arrow.isDown) {
            velocityX = this.speed;
        }

        if (keys.up.isDown || keys.up_arrow.isDown) {
            velocityY = -this.speed;
        } else if (keys.down.isDown || keys.down_arrow.isDown) {
            velocityY = this.speed;
        }

        this.sprite.setVelocity(velocityX, velocityY);

        if (velocityX === 0 && velocityY === 0) {
            this.sprite.anims.stop();
        }
    }

    updateAnimation(moving) {
        // This is a placeholder for animations.
        // We will re-enable this once movement is fixed.
        let newAnim = `player-idle-${this.lastDirection}`;
        if (moving) {
            newAnim = `player-walk-${this.lastDirection}`;
        }
    }

    getPosition() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    setPosition(x, y) {
        this.sprite.setPosition(x, y);
    }

    collectItem(item) {
        const added = this.inventoryManager.addItem({
            itemId: item.itemId,
            itemName: item.itemName,
            spriteKey: item.spriteKey
        });

        if (added) {
            // Item was successfully added to inventory
            // The item manager will handle the rest (removing from world, respawn, etc.)
            console.log(`Collected ${item.itemName}`);
        } else {
            console.log("Failed to add item to inventory - inventory might be full");
        }
    }

    addCrypto(amount) {
        this.inventoryManager.addCrypto(amount);
    }

    getPlayerContext() {
        const position = this.getPosition();
        const activeQuests = this.scene.questManager ? this.scene.questManager.getActiveQuests() : [];
        const inventory = this.inventoryManager.getItems();
        const crypto = this.inventoryManager.getCrypto();
        
        return {
            position: position,
            active_quests: activeQuests.map(q => ({
                id: q.id,
                title: q.title,
                type: q.type
            })),
            inventory: inventory.filter(item => item !== null).map(item => ({
                itemId: item.itemId,
                itemName: item.itemName,
                quantity: item.quantity
            })),
            crypto: crypto,
            game_time: Date.now()
        };
    }
} 