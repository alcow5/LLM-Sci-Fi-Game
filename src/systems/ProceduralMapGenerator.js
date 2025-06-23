export class ProceduralMapGenerator {
    constructor(scene) {
        this.scene = scene;
        this.chunkSize = 16; // 16x16 tile chunks
        this.tileSize = 32;
        this.chunks = new Map(); // Store generated chunks
        this.renderedChunks = new Set(); // Track which chunks are rendered
        this.spawnTimer = 0;
        this.spawnInterval = 5000; // Spawn items every 5 seconds
        this.maxItemsPerChunk = 3;
        this.visibleChunks = new Set();
        
        // Biome types for variety
        this.biomes = {
            'outpost': { ground: [0, 1, 2], walls: [16, 17, 18], decorations: [32, 33, 34] },
            'wasteland': { ground: [3, 4, 5], walls: [19, 20, 21], decorations: [35, 36, 37] },
            'crystal_field': { ground: [6, 7, 8], walls: [22, 23, 24], decorations: [38, 39, 40] },
            'industrial': { ground: [9, 10, 11], walls: [25, 26, 27], decorations: [41, 42, 43] }
        };
        
        // Initialize the center outpost chunk
        this.generateChunk(0, 0, 'outpost');
    }
    
    // Generate a chunk at the specified coordinates
    generateChunk(chunkX, chunkY, biomeType = null) {
        const chunkKey = `${chunkX},${chunkY}`;
        
        if (this.chunks.has(chunkKey)) {
            return this.chunks.get(chunkKey);
        }
        
        // Determine biome type if not specified
        if (!biomeType) {
            biomeType = this.getBiomeType(chunkX, chunkY);
        }
        
        const biome = this.biomes[biomeType];
        const chunk = {
            x: chunkX,
            y: chunkY,
            biome: biomeType,
            tiles: this.generateChunkTiles(biome),
            items: [],
            structures: [],
            generated: false,
            rendered: false,
            layers: {} // Store tilemap layers
        };
        
        this.chunks.set(chunkKey, chunk);
        return chunk;
    }
    
    // Generate tiles for a chunk
    generateChunkTiles(biome) {
        const tiles = {
            ground: [],
            walls: [],
            decorations: []
        };
        
        // Generate ground layer
        for (let y = 0; y < this.chunkSize; y++) {
            tiles.ground[y] = [];
            for (let x = 0; x < this.chunkSize; x++) {
                const noise = this.simpleNoise(x, y);
                const tileIndex = biome.ground[Math.floor(noise * biome.ground.length)];
                tiles.ground[y][x] = tileIndex;
            }
        }
        
        // Generate walls (sparse)
        for (let y = 0; y < this.chunkSize; y++) {
            tiles.walls[y] = [];
            for (let x = 0; x < this.chunkSize; x++) {
                const noise = this.simpleNoise(x + 1000, y + 1000);
                if (noise > 0.85) { // 15% chance of wall
                    const tileIndex = biome.walls[Math.floor(noise * biome.walls.length)];
                    tiles.walls[y][x] = tileIndex;
                } else {
                    tiles.walls[y][x] = -1; // No wall
                }
            }
        }
        
        // Generate decorations (very sparse)
        for (let y = 0; y < this.chunkSize; y++) {
            tiles.decorations[y] = [];
            for (let x = 0; x < this.chunkSize; x++) {
                const noise = this.simpleNoise(x + 2000, y + 2000);
                if (noise > 0.95) { // 5% chance of decoration
                    const tileIndex = biome.decorations[Math.floor(noise * biome.decorations.length)];
                    tiles.decorations[y][x] = tileIndex;
                } else {
                    tiles.decorations[y][x] = -1; // No decoration
                }
            }
        }
        
        return tiles;
    }
    
    // Render a chunk's tiles
    renderChunk(chunk) {
        if (chunk.rendered) return;
        
        const chunkWorldX = chunk.x * this.chunkSize * this.tileSize;
        const chunkWorldY = chunk.y * this.chunkSize * this.tileSize;
        
        // Create tilemap for this chunk
        const tilemap = this.scene.make.tilemap({
            tileWidth: this.tileSize,
            tileHeight: this.tileSize,
            width: this.chunkSize,
            height: this.chunkSize
        });
        
        // Add tileset to the tilemap
        const tileset = tilemap.addTilesetImage('tiles');
        
        // Create ground layer
        const groundLayer = tilemap.createBlankLayer('ground', tileset, chunkWorldX, chunkWorldY);
        for (let y = 0; y < this.chunkSize; y++) {
            for (let x = 0; x < this.chunkSize; x++) {
                const tileIndex = chunk.tiles.ground[y][x];
                if (tileIndex >= 0) {
                    groundLayer.putTileAt(tileIndex, x, y);
                }
            }
        }
        
        // Create walls layer
        const wallsLayer = tilemap.createBlankLayer('walls', tileset, chunkWorldX, chunkWorldY);
        for (let y = 0; y < this.chunkSize; y++) {
            for (let x = 0; x < this.chunkSize; x++) {
                const tileIndex = chunk.tiles.walls[y][x];
                if (tileIndex >= 0) {
                    wallsLayer.putTileAt(tileIndex, x, y);
                }
            }
        }
        
        // Create decorations layer
        const decorationsLayer = tilemap.createBlankLayer('decorations', tileset, chunkWorldX, chunkWorldY);
        for (let y = 0; y < this.chunkSize; y++) {
            for (let x = 0; x < this.chunkSize; x++) {
                const tileIndex = chunk.tiles.decorations[y][x];
                if (tileIndex >= 0) {
                    decorationsLayer.putTileAt(tileIndex, x, y);
                }
            }
        }
        
        // Set all layers to render behind everything else
        groundLayer.setDepth(-1000);
        wallsLayer.setDepth(-999);
        decorationsLayer.setDepth(-998);
        
        // Store layers for cleanup
        chunk.layers = {
            ground: groundLayer,
            walls: wallsLayer,
            decorations: decorationsLayer
        };
        
        chunk.rendered = true;
    }
    
    // Unrender a chunk's tiles
    unrenderChunk(chunk) {
        if (!chunk.rendered) return;
        
        // Destroy tilemap layers
        Object.values(chunk.layers).forEach(layer => {
            if (layer) {
                layer.destroy();
            }
        });
        
        chunk.layers = {};
        chunk.rendered = false;
    }
    
    // Simple noise function for procedural generation
    simpleNoise(x, y) {
        const n = x + y * 57;
        const n2 = (n << 13) ^ n;
        return ((n2 * (n2 * n2 * 15731 + 789221) + 1376312589) & 0x7fffffff) / 0x7fffffff;
    }
    
    // Determine biome type based on chunk coordinates
    getBiomeType(chunkX, chunkY) {
        const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);
        
        if (distance < 2) {
            return 'outpost';
        } else if (distance < 5) {
            return 'industrial';
        } else if (distance < 10) {
            return 'wasteland';
        } else {
            return 'crystal_field';
        }
    }
    
    // Get chunks that should be visible based on player position
    getVisibleChunks(playerX, playerY) {
        const playerChunkX = Math.floor(playerX / (this.chunkSize * this.tileSize));
        const playerChunkY = Math.floor(playerY / (this.chunkSize * this.tileSize));
        const visibleChunks = [];
        
        // Check chunks in a 3x3 area around the player
        for (let y = playerChunkY - 1; y <= playerChunkY + 1; y++) {
            for (let x = playerChunkX - 1; x <= playerChunkX + 1; x++) {
                const chunk = this.generateChunk(x, y);
                visibleChunks.push(chunk);
            }
        }
        
        return visibleChunks;
    }
    
    // Spawn items in visible chunks
    spawnItemsInChunks(visibleChunks) {
        const now = this.scene.time.now;
        
        if (now - this.spawnTimer > this.spawnInterval) {
            this.spawnTimer = now;
            
            visibleChunks.forEach(chunk => {
                if (!chunk.generated) {
                    this.spawnItemsInChunk(chunk);
                    chunk.generated = true;
                }
            });
        }
    }
    
    // Spawn items in a specific chunk
    spawnItemsInChunk(chunk) {
        const itemCount = Math.floor(Math.random() * this.maxItemsPerChunk) + 1;
        const availableItems = Object.keys(this.scene.itemManager ? this.scene.itemManager.getItemData() : {});
        
        for (let i = 0; i < itemCount; i++) {
            const chunkWorldX = chunk.x * this.chunkSize * this.tileSize;
            const chunkWorldY = chunk.y * this.chunkSize * this.tileSize;
            
            // Random position within chunk
            const x = chunkWorldX + Math.random() * (this.chunkSize * this.tileSize);
            const y = chunkWorldY + Math.random() * (this.chunkSize * this.tileSize);
            
            // Random item
            const itemId = availableItems[Math.floor(Math.random() * availableItems.length)];
            const itemData = this.scene.itemManager.getItemData()[itemId];
            
            if (itemData) {
                const item = this.scene.itemManager.createItem(x, y, itemData.spriteKey, itemId, itemData.name);
                chunk.items.push(item);
            }
        }
    }
    
    // Update the procedural map
    update(playerX, playerY) {
        const visibleChunks = this.getVisibleChunks(playerX, playerY);
        
        // Render visible chunks
        visibleChunks.forEach(chunk => {
            this.renderChunk(chunk);
        });
        
        // Unrender chunks that are no longer visible
        for (const [key, chunk] of this.chunks) {
            if (!visibleChunks.includes(chunk)) {
                this.unrenderChunk(chunk);
            }
        }
        
        this.spawnItemsInChunks(visibleChunks);
        
        // Update world bounds to allow infinite exploration
        const maxDistance = 50; // Maximum chunks in any direction
        const worldSize = maxDistance * this.chunkSize * this.tileSize;
        this.scene.physics.world.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
    }
    
    // Get chunk at world coordinates
    getChunkAt(worldX, worldY) {
        const chunkX = Math.floor(worldX / (this.chunkSize * this.tileSize));
        const chunkY = Math.floor(worldY / (this.chunkSize * this.tileSize));
        return this.generateChunk(chunkX, chunkY);
    }
    
    // Clean up chunks that are too far from player
    cleanupDistantChunks(playerX, playerY, maxDistance = 10) {
        const playerChunkX = Math.floor(playerX / (this.chunkSize * this.tileSize));
        const playerChunkY = Math.floor(playerY / (this.chunkSize * this.tileSize));
        
        for (const [key, chunk] of this.chunks) {
            const distance = Math.sqrt(
                Math.pow(chunk.x - playerChunkX, 2) + 
                Math.pow(chunk.y - playerChunkY, 2)
            );
            
            if (distance > maxDistance) {
                // Remove items from the scene
                chunk.items.forEach(item => {
                    if (item && item.sprite) {
                        item.sprite.destroy();
                    }
                });
                
                // Unrender the chunk
                this.unrenderChunk(chunk);
                
                this.chunks.delete(key);
            }
        }
    }
} 