import { NPC } from './NPC.js';
import { NPCData } from '../data/NPCData.js';

export class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];
        this.spawnNPCs();
    }

    spawnNPCs() {
        // Place NPCs in the center outpost area (chunk 0,0)
        // This creates a central hub where players can interact with NPCs
        
        NPCData.forEach((npcConfig, index) => {
            // Position NPCs around the center outpost
            let x, y;
            
            switch (index) {
                case 0: // Commander Sarah Chen - near Command Center
                    x = 50;
                    y = 50;
                    break;
                case 1: // Engineer Marcus Rodriguez - near Engineering Bay
                    x = 250;
                    y = -30;
                    break;
                case 2: // Trader Eliza Thompson - near Trading Post
                    x = 100;
                    y = 250;
                    break;
                case 3: // Scout Jake Williams - near vehicle
                    x = 150;
                    y = 150;
                    break;
                case 4: // Dr. Kim Park - near Command Center
                    x = -50;
                    y = 100;
                    break;
                case 5: // Rick "The Unfiltered" - on the edge of the outpost
                    x = 300;
                    y = 200;
                    break;
                default:
                    // Fallback positions for additional NPCs
                    x = (index - 6) * 100;
                    y = (index - 6) * 100;
            }
            
            const npc = new NPC(this.scene, x, y, npcConfig);
            this.npcs.push(npc);
        });
    }

    update() {
        this.npcs.forEach(npc => {
            if (npc && npc.update) {
                npc.update();
            }
        });
    }

    getNPCs() {
        return this.npcs;
    }

    getAllNPCs() {
        return this.npcs;
    }

    getNPCByName(name) {
        return this.npcs.find(npc => npc.name === name);
    }
} 