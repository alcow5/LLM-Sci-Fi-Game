import { Item } from './Item.js';
import { ItemData, WorldItems } from '../data/ItemData.js';

export class ItemManager {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
        this.respawnQueue = [];
        this.respawnTime = 10000; // 10 seconds
        this.spawnItems();
    }

    // Get available item data for procedural generation
    getItemData() {
        return ItemData;
    }

    spawnItems() {
        WorldItems.forEach(itemConfig => {
            const itemData = ItemData[itemConfig.itemId];
            if (itemData) {
                this.createItem(itemConfig.x, itemConfig.y, itemData.spriteKey, itemConfig.itemId, itemData.name);
            }
        });
    }

    createItem(x, y, spriteKey, itemId, itemName) {
        const item = new Item(this.scene, x, y, spriteKey, itemId, itemName);
        this.items.push(item);
        return item;
    }

    // Find a safe spawn location that doesn't overlap with other items or entities
    findSafeSpawnLocation() {
        const mapWidth = 1024; // 32 * 32 tiles
        const mapHeight = 768;  // 24 * 32 tiles
        const minDistance = 64; // Minimum distance between items
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            // Generate random position
            const x = Math.random() * (mapWidth - 64) + 32; // Keep away from edges
            const y = Math.random() * (mapHeight - 64) + 32;
            
            // Check if position is safe
            if (this.isPositionSafe(x, y, minDistance)) {
                return { x, y };
            }
            
            attempts++;
        }
        
        // If we can't find a safe spot, return a default position
        console.warn('Could not find safe spawn location, using default');
        return { x: 100, y: 100 };
    }
    
    // Check if a position is safe (not too close to other items or entities)
    isPositionSafe(x, y, minDistance) {
        // Check distance to other items
        for (const item of this.items) {
            // Skip items that have been destroyed or don't have valid sprites
            if (!item || !item.sprite || !item.sprite.active) {
                continue;
            }
            
            const distance = Phaser.Math.Distance.Between(x, y, item.sprite.x, item.sprite.y);
            if (distance < minDistance) {
                return false;
            }
        }
        
        // Check distance to player
        if (this.scene.player && this.scene.player.sprite) {
            const playerDistance = Phaser.Math.Distance.Between(x, y, this.scene.player.sprite.x, this.scene.player.sprite.y);
            if (playerDistance < minDistance) {
                return false;
            }
        }
        
        // Check distance to NPCs
        if (this.scene.npcManager && this.scene.npcManager.npcs) {
            for (const npc of this.scene.npcManager.npcs) {
                if (!npc || !npc.sprite || !npc.sprite.active) {
                    continue;
                }
                const npcDistance = Phaser.Math.Distance.Between(x, y, npc.sprite.x, npc.sprite.y);
                if (npcDistance < minDistance) {
                    return false;
                }
            }
        }
        
        // Check distance to structures (decorations)
        if (this.scene.decorativeManager && this.scene.decorativeManager.decorations) {
            for (const decoration of this.scene.decorativeManager.decorations) {
                if (!decoration || !decoration.sprite || !decoration.sprite.active) {
                    continue;
                }
                const decorationDistance = Phaser.Math.Distance.Between(x, y, decoration.sprite.x, decoration.sprite.y);
                if (decorationDistance < minDistance) {
                    return false;
                }
            }
        }
        
        return true;
    }

    update(time) {
        // Clean up destroyed items first
        this.cleanupDestroyedItems();
        
        // Check for items to respawn
        const now = time;
        this.respawnQueue = this.respawnQueue.filter(item => {
            if (now >= item.respawnTime) {
                // Find a safe spawn location
                const safeLocation = this.findSafeSpawnLocation();
                
                // Create the item at the new location
                this.createItem(safeLocation.x, safeLocation.y, item.spriteKey, item.itemId, item.itemName);
                
                console.log(`Respawned ${item.itemName} at (${safeLocation.x}, ${safeLocation.y})`);
                return false; // Remove from queue
            }
            return true; // Keep in queue
        });
    }
    
    // Remove destroyed items from the items array
    cleanupDestroyedItems() {
        this.items = this.items.filter(item => {
            return item && item.sprite && item.sprite.active;
        });
    }
    
    getItems() {
        return this.items;
    }

    getItemTypes() {
        // Return all available item types from ItemData
        return Object.keys(ItemData);
    }

    collectItem(itemToCollect) {
        const index = this.items.findIndex(item => item === itemToCollect);
        if (index > -1) {
            // Add to player's inventory first
            if (this.scene.player) {
                this.scene.player.collectItem(itemToCollect);
            }
            
            // Store respawn data with current item info
            const itemData = {
                spriteKey: itemToCollect.spriteKey,
                itemId: itemToCollect.itemId,
                itemName: itemToCollect.itemName,
                respawnTime: this.scene.time.now + this.respawnTime
            };
            this.respawnQueue.push(itemData);
            
            // Remove the item sprite from the scene
            if (itemToCollect.sprite) {
                itemToCollect.sprite.destroy();
            }
            
            // Remove from active items array
            this.items.splice(index, 1);
            
            console.log(`Collected ${itemToCollect.itemName}, will respawn in 10 seconds`);
        }
    }
} 