export const ItemData = {
    'crystal_red': { name: 'Red Crystal', spriteKey: 'scifiEnvironment_05' },
    'iron_ore': { name: 'Iron Ore', spriteKey: 'scifiEnvironment_07' },
    'plant_fiber': { name: 'Alien Plant Fiber', spriteKey: 'scifiEnvironment_11' },
    'space_rock': { name: 'Space Rock', spriteKey: 'scifiEnvironment_04'},
    'azure_crystal': { name: 'Azure Crystal', spriteKey: 'scifiEnvironment_05'},
    'meteorite_fragment': { name: 'Meteorite Fragment', spriteKey: 'scifiEnvironment_07'},
    'enigmatic_artifact': { name: 'Enigmatic Artifact', spriteKey: 'scifiEnvironment_12'},
    'crystal_spires': { name: 'Crystal Spires', spriteKey: 'scifiEnvironment_15'},
    'ancient_rubble': { name: 'Ancient Rubble', spriteKey: 'scifiEnvironment_08'},
    'glow_stalk': { name: 'Glow Stalk', spriteKey: 'scifiEnvironment_11'},
    'impact_shard': { name: 'Impact Shard', spriteKey: 'scifiEnvironment_13'},
    'alien_relic': { name: 'Alien Relic', spriteKey: 'scifiEnvironment_17'},
    'cosmic_dust': { name: 'Cosmic Dust', spriteKey: 'scifiEnvironment_20'}
};

export const WorldItems = [
    // Items around Command Center (400, 300) - spread out more
    { itemId: 'crystal_red', x: 320, y: 260 },
    { itemId: 'iron_ore', x: 480, y: 340 },
    { itemId: 'enigmatic_artifact', x: 360, y: 380 },
    
    // Items around Engineering Bay (600, 250) - spread out more
    { itemId: 'meteorite_fragment', x: 540, y: 200 },
    { itemId: 'crystal_spires', x: 660, y: 300 },
    { itemId: 'impact_shard', x: 560, y: 320 },
    
    // Items around Trading Post (450, 480) - spread out more
    { itemId: 'plant_fiber', x: 380, y: 440 },
    { itemId: 'glow_stalk', x: 520, y: 520 },
    { itemId: 'alien_relic', x: 400, y: 540 },
    
    // Items around Transport Vehicle (500, 200) - spread out more
    { itemId: 'space_rock', x: 440, y: 160 },
    { itemId: 'azure_crystal', x: 560, y: 240 },
    
    // Scattered items in open areas - well separated
    { itemId: 'ancient_rubble', x: 250, y: 180 },
    { itemId: 'cosmic_dust', x: 750, y: 450 }
]; 