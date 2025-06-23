import { APIService } from '../services/APIService.js';

export class QuestManager {
    constructor(scene) {
        this.scene = scene;
        this.activeQuests = [];
        this.completedQuests = [];
        this.pendingQuests = [];
        this.questIdCounter = 0;
        this.apiService = new APIService();
    }

    generateQuest(npcId, questType = 'random') {
        const questTypes = ['collect_item', 'talk_to_npc'];
        
        if (questType === 'random') {
            questType = questTypes[Math.floor(Math.random() * questTypes.length)];
        }

        let quest = null;

        switch (questType) {
            case 'collect_item':
                quest = this.generateCollectItemQuest(npcId);
                break;
            case 'talk_to_npc':
                quest = this.generateTalkToNPCQuest(npcId);
                break;
        }

        if (quest) {
            quest.id = ++this.questIdCounter;
            quest.giverId = npcId;
            quest.status = 'active';
            quest.startTime = Date.now();
            this.activeQuests.push(quest);
            
            if (window.uiManager) {
                window.uiManager.addQuest(quest);
            }
            
            return quest;
        }

        return null;
    }

    generateCollectItemQuest(npcId) {
        // Get available items from the world
        const availableItems = this.scene.itemManager.getItems();
        if (availableItems.length === 0) return null;

        // Pick a random item
        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 items

        return {
            type: 'collect_item',
            title: `Collect ${randomItem.itemName}`,
            description: `Please collect ${quantity} ${randomItem.itemName} for me.`,
            targetItemId: randomItem.itemId,
            targetQuantity: quantity,
            reward: {
                crypto: Math.floor(Math.random() * 50) + 10, // 10-60 crypto
                items: []
            }
        };
    }

    generateTalkToNPCQuest(npcId) {
        // Get all NPCs except the quest giver
        const allNPCs = this.scene.npcManager.getAllNPCs();
        const availableNPCs = allNPCs.filter(npc => npc.id !== npcId);
        
        if (availableNPCs.length === 0) return null;

        // Pick a random NPC
        const randomNPC = availableNPCs[Math.floor(Math.random() * availableNPCs.length)];

        return {
            type: 'talk_to_npc',
            title: `Talk to ${randomNPC.name}`,
            description: `Please talk to ${randomNPC.name} and ask them about their current situation.`,
            targetNPCId: randomNPC.id,
            reward: {
                crypto: Math.floor(Math.random() * 30) + 5, // 5-35 crypto
                items: []
            }
        };
    }

    checkQuestCompletion(questId) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (!quest) return false;

        let completed = false;

        switch (quest.type) {
            case 'collect_item':
                completed = this.checkCollectItemQuest(quest);
                break;
            case 'talk_to_npc':
                completed = this.checkTalkToNPCQuest(quest);
                break;
        }

        return completed;
    }

    checkCollectItemQuest(quest) {
        const playerItems = this.scene.player.inventoryManager.getItems();
        const targetItem = playerItems.find(item => 
            item && item.itemId === quest.targetItemId
        );

        if (targetItem && targetItem.quantity >= quest.targetQuantity) {
            return true;
        }

        return false;
    }

    checkTalkToNPCQuest(quest) {
        // Talk quests are completed when the player talks to the target NPC
        // This is handled by markTalkQuestCompleted when the player starts dialogue
        // For now, we'll check if the quest has been marked as completed
        return quest.completed || false;
    }

    completeQuest(questId) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (!quest) return false;

        // Remove items if it's a collect quest
        if (quest.type === 'collect_item') {
            this.scene.player.inventoryManager.removeItems(quest.targetItemId, quest.targetQuantity);
        }

        // Give rewards
        if (quest.reward.crypto > 0) {
            this.scene.player.addCrypto(quest.reward.crypto);
        }

        // Move quest to completed
        const index = this.activeQuests.findIndex(q => q.id === quest.id);
        if (index > -1) {
            this.activeQuests.splice(index, 1);
            this.completedQuests.push(quest);
        }

        // Update UI
        if (window.uiManager) {
            window.uiManager.showMessage(`Quest completed! Earned ${quest.reward.crypto} crypto!`);
            window.uiManager.updateQuestLog(this.activeQuests);
        }

        return true;
    }

    markTalkQuestCompleted(targetNPCId) {
        const talkQuest = this.activeQuests.find(q => 
            q.type === 'talk_to_npc' && q.targetNPCId === targetNPCId
        );

        if (talkQuest) {
            // Mark the quest as completed but don't complete it yet
            // The player needs to return to the quest giver to turn it in
            talkQuest.completed = true;
            
            // Update UI to show quest is ready to turn in
            if (window.uiManager) {
                window.uiManager.showMessage(`Quest objective completed! Return to ${talkQuest.giverName} to turn in the quest.`);
                window.uiManager.updateQuestLog(this.activeQuests);
            }
        }
    }

    getActiveQuests() {
        return this.activeQuests;
    }

    getCompletedQuests() {
        return this.completedQuests;
    }

    getQuestById(questId) {
        return this.activeQuests.find(q => q.id === questId) || this.completedQuests.find(q => q.id === questId);
    }

    addQuest(quest) {
        // Ensure quest has required fields
        if (!quest.id) {
            quest.id = ++this.questIdCounter;
        }
        if (!quest.status) {
            quest.status = 'active';
        }
        if (!quest.startTime) {
            quest.startTime = Date.now();
        }

        // Add to active quests
        this.activeQuests.push(quest);
        
        // Update UI
        if (window.uiManager) {
            window.uiManager.addQuest(quest);
            window.uiManager.updateQuestLog(this.activeQuests);
        }
        
        return quest;
    }

    addPendingQuest(quest) {
        // Ensure quest has required fields
        if (!quest.id) {
            quest.id = `pending_quest_${Date.now()}`;
        }
        quest.status = 'pending';
        quest.startTime = Date.now();

        // Add to pending quests
        this.pendingQuests.push(quest);
        
        return quest;
    }

    acceptQuest(questId) {
        const pendingIndex = this.pendingQuests.findIndex(q => q.id === questId);
        if (pendingIndex === -1) return false;

        const quest = this.pendingQuests[pendingIndex];
        quest.status = 'active';
        
        // Move from pending to active
        this.pendingQuests.splice(pendingIndex, 1);
        this.activeQuests.push(quest);
        
        // Update UI
        if (window.uiManager) {
            window.uiManager.updateQuestLog(this.activeQuests);
            window.uiManager.showMessage(`Quest accepted: ${quest.title}`);
        }
        
        return true;
    }

    declineQuest(questId) {
        const pendingIndex = this.pendingQuests.findIndex(q => q.id === questId);
        if (pendingIndex === -1) return false;

        // Remove from pending quests
        this.pendingQuests.splice(pendingIndex, 1);
        
        // Update UI
        if (window.uiManager) {
            window.uiManager.showMessage('Quest declined');
        }
        
        return true;
    }

    getPendingQuests() {
        return this.pendingQuests;
    }

    clearPendingQuests() {
        this.pendingQuests = [];
    }

    async generateDynamicQuest(npcId, npcPersonality) {
        try {
            const requestData = {
                npc_id: npcId,
                npc_personality: npcPersonality,
                player_context: this.getPlayerContext(),
                existing_quests: this.getActiveQuests().map(q => q.id)
            };

            const response = await this.apiService.sendQuestRequest(requestData);
            
            if (response.quest) {
                this.generateQuest(npcId, response.quest.type);
                return response.quest;
            }
        } catch (error) {
            console.error('Failed to generate dynamic quest:', error);
            // Return a fallback quest
            return this.createFallbackQuest(npcId, npcPersonality);
        }
    }

    createFallbackQuest(npcId, npcPersonality) {
        const fallbackQuests = {
            'friendly_merchant': {
                id: `fallback_${npcId}_${Date.now()}`,
                title: "Supply Run",
                description: "Help with a quick supply delivery",
                reward: "Credits and reputation",
                status: "available"
            },
            'curious_scientist': {
                id: `fallback_${npcId}_${Date.now()}`,
                title: "Data Collection",
                description: "Gather some research data",
                reward: "Scientific knowledge",
                status: "available"
            },
            'stern_guard': {
                id: `fallback_${npcId}_${Date.now()}`,
                title: "Security Check",
                description: "Perform a security inspection",
                reward: "Security clearance",
                status: "available"
            }
        };

        const quest = fallbackQuests[npcPersonality] || fallbackQuests['friendly_merchant'];
        this.generateQuest(npcId, quest.type);
        return quest;
    }

    getPlayerContext() {
        const playerPos = this.scene.player.getPosition();
        return {
            position: playerPos,
            active_quest_count: this.activeQuests.length,
            completed_quest_count: this.completedQuests.length,
            game_time: Date.now()
        };
    }

    saveQuestState() {
        return {
            activeQuests: this.activeQuests.map(q => ({ ...q, type: q.type })),
            completedQuests: this.completedQuests.map(q => ({ ...q, type: q.type })),
            pendingQuests: this.pendingQuests.map(q => ({ ...q, type: q.type }))
        };
    }

    loadQuestState(state) {
        if (state.activeQuests) {
            this.activeQuests = state.activeQuests.map(q => ({ ...q, type: q.type }));
        }
        if (state.completedQuests) {
            this.completedQuests = state.completedQuests.map(q => ({ ...q, type: q.type }));
        }
        if (state.pendingQuests) {
            this.pendingQuests = state.pendingQuests.map(q => ({ ...q, type: q.type }));
        }
        
        // Refresh UI with loaded quests
        this.activeQuests.forEach(quest => {
            window.uiManager.addQuest(quest);
        });
    }

    // Quest objective tracking
    updateObjective(questId, objectiveId, progress) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (quest && quest.objectives) {
            const objective = quest.objectives.find(obj => obj.id === objectiveId);
            if (objective) {
                objective.progress = progress;
                objective.completed = progress >= objective.target;
                
                // Update overall quest progress
                const totalProgress = quest.objectives.reduce((sum, obj) => {
                    return sum + (obj.completed ? 100 : obj.progress);
                }, 0) / quest.objectives.length;
                
                this.updateQuestProgress(questId, totalProgress);
            }
        }
    }

    // Quest validation
    validateQuestCompletion(questId) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (quest && quest.objectives) {
            const allCompleted = quest.objectives.every(obj => obj.completed);
            if (allCompleted) {
                this.completeQuest(quest.id);
                return true;
            }
        }
        return false;
    }
} 