import { APIService } from '../services/APIService.js';

export class DialogueManager {
    constructor(scene) {
        this.scene = scene;
        this.currentNPC = null;
        this.isInDialogue = false;
        this.isLoading = false;
        this.apiService = new APIService();
        this.conversationHistory = [];
        this.currentConversation = [];
        
        // Simple memory system - stores conversation snippets per NPC
        this.npcMemories = new Map(); // npcId -> array of memory snippets
    }

    // Add a memory snippet for the current NPC
    addMemorySnippet(snippet) {
        if (!this.currentNPC) return;
        
        if (!this.npcMemories.has(this.currentNPC.id)) {
            this.npcMemories.set(this.currentNPC.id, []);
        }
        
        const memories = this.npcMemories.get(this.currentNPC.id);
        memories.push({
            snippet: snippet,
            timestamp: Date.now()
        });
        
        // Keep only the last 5 memories per NPC to avoid clutter
        if (memories.length > 5) {
            memories.shift(); // Remove oldest memory
        }
    }

    // Get memory snippets for the current NPC
    getNPCMemories() {
        if (!this.currentNPC) return [];
        return this.npcMemories.get(this.currentNPC.id) || [];
    }

    // Get formatted memory context for LLM
    getMemoryContext() {
        const memories = this.getNPCMemories();
        if (memories.length === 0) return "";
        
        const memoryText = memories
            .map(memory => `- ${memory.snippet}`)
            .join('\n');
        
        // Debug log to show memories being used
        console.log(`[Memory System] Using ${memories.length} memories for ${this.currentNPC.name}:`, memories);
        
        return `\n\nPREVIOUS CONVERSATION MEMORIES:\n${memoryText}`;
    }

    // Debug method to show all memories
    debugShowMemories() {
        console.log("=== NPC MEMORIES DEBUG ===");
        for (const [npcId, memories] of this.npcMemories.entries()) {
            console.log(`${npcId}:`, memories);
        }
        console.log("==========================");
    }

    // Clear all memories (for testing)
    clearAllMemories() {
        this.npcMemories.clear();
        console.log("[Memory System] All memories cleared");
    }

    async startDialogue(npc) {
        this.currentNPC = npc;
        this.isInDialogue = true;
        this.currentConversation = [];
        
        // Check if this NPC is the target of a talk quest
        if (this.scene.questManager) {
            this.scene.questManager.markTalkQuestCompleted(npc.id);
        }
        
        // Check for quests from this NPC
        const questCheck = this.checkNPCQuests(npc);
        
        if (questCheck.hasQuest) {
            if (questCheck.canTurnIn) {
                // Quest is ready to turn in
                await this.handleQuestTurnIn(questCheck.quest);
            } else {
                // Quest is active but not ready
                await this.handleQuestProgress(questCheck.quest);
            }
        } else {
            // No quest from this NPC, show normal greeting
            await this.showNormalGreeting(npc);
        }
    }

    checkNPCQuests(npc) {
        if (!this.scene.questManager) {
            return { hasQuest: false };
        }

        const activeQuests = this.scene.questManager.getActiveQuests();
        const npcQuest = activeQuests.find(quest => quest.giverId === npc.id);

        if (!npcQuest) {
            return { hasQuest: false };
        }

        // Check if quest is ready to turn in
        const canTurnIn = this.scene.questManager.checkQuestCompletion(npcQuest.id);
        
        return {
            hasQuest: true,
            quest: npcQuest,
            canTurnIn: canTurnIn
        };
    }

    async handleQuestTurnIn(quest) {
        // Show quest completion message
        const completionMessage = `Ah, you're back! I can see you've completed the quest "${quest.title}". Let me check what you've brought...`;
        this.showDialogueBox(completionMessage, this.currentNPC.name);
        this.addToConversation('npc', completionMessage);

        // Wait a moment, then complete the quest
        setTimeout(async () => {
            const success = this.scene.questManager.completeQuest(quest.id);
            
            if (success) {
                const rewardMessage = `Perfect! Here's your reward of ${quest.reward.crypto} crypto. Thank you for your help!`;
                this.showDialogueBox(rewardMessage, this.currentNPC.name);
                this.addToConversation('npc', rewardMessage);
                
                // Continue conversation after quest completion
                setTimeout(() => {
                    this.showConversationInput();
                }, 2000);
            } else {
                const errorMessage = "I'm sorry, but it seems there was an issue with the quest completion. Please try again.";
                this.showDialogueBox(errorMessage, this.currentNPC.name);
                this.addToConversation('npc', errorMessage);
                
                setTimeout(() => {
                    this.showConversationInput();
                }, 2000);
            }
        }, 2000);
    }

    async handleQuestProgress(quest) {
        let progressMessage = "";
        
        if (quest.type === 'collect_item') {
            const playerItems = this.scene.player.inventoryManager.getItems();
            const targetItem = playerItems.find(item => item && item.itemId === quest.targetItemId);
            const currentQuantity = targetItem ? targetItem.quantity : 0;
            const neededQuantity = quest.targetQuantity;
            
            if (currentQuantity === 0) {
                progressMessage = `I'm still waiting for you to collect ${neededQuantity} ${quest.targetItemId.replace('_', ' ')}. You haven't found any yet.`;
            } else if (currentQuantity < neededQuantity) {
                progressMessage = `Good progress! You have ${currentQuantity} ${quest.targetItemId.replace('_', ' ')}. I still need ${neededQuantity - currentQuantity} more.`;
            } else {
                progressMessage = `Excellent! You have all ${neededQuantity} ${quest.targetItemId.replace('_', ' ')}. You can turn in the quest now!`;
            }
        } else if (quest.type === 'talk_to_npc') {
            if (quest.completed) {
                progressMessage = `Great! I heard you talked to ${quest.targetNPCId}. The quest is ready to turn in!`;
            } else {
                progressMessage = `I'm still waiting for you to talk to ${quest.targetNPCId}. Please visit them and have a conversation.`;
            }
        }
        
        this.showDialogueBox(progressMessage, this.currentNPC.name);
        this.addToConversation('npc', progressMessage);
        
        // Show input for continued conversation
        setTimeout(() => {
            this.showConversationInput();
        }, 2000);
    }

    async showNormalGreeting(npc) {
        // Show default greeting with subtle quest hint
        const greetingWithHint = `${npc.defaultGreeting}\n\n<i style="color: #666; font-size: 0.9em;">💡 Tip: You can ask me for work or suggest quest ideas!</i>`;
        this.showDialogueBox(greetingWithHint, npc.name);
        this.addToConversation('npc', npc.defaultGreeting);
        
        // Show text input for natural conversation
        this.showConversationInput();
    }

    addToConversation(speaker, message) {
        this.currentConversation.push({
            speaker: speaker,
            message: message,
            timestamp: Date.now()
        });
    }

    getConversationContext() {
        return this.currentConversation
            .map(entry => `${entry.speaker === 'npc' ? this.currentNPC.name : 'Player'}: ${entry.message}`)
            .join('\n');
    }

    showConversationInput() {
        const uiManager = window.uiManager;
        uiManager.showCustomInput((message) => {
            this.handlePlayerMessage(message);
        }, "What would you like to say? (Ask for work, suggest quests, or just chat!)");
    }

    async handlePlayerMessage(message) {
        if (this.isLoading) return;
        
        this.addToConversation('player', message);
        
        // Check if this is a quest-related message
        const questKeywords = ['quest', 'work', 'job', 'task', 'mission', 'help', 'need', 'collect', 'find', 'bring', 'get'];
        const isQuestRelated = questKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
        
        if (isQuestRelated) {
            // Handle as quest suggestion
            await this.handleQuestSuggestion(message);
        } else {
            // Handle as regular conversation
            await this.handleRegularConversation(message);
        }
    }

    async handleRegularConversation(message) {
        this.showLoadingIndicator();
        
        try {
            const response = await this.getLLMResponse(message);
            this.hideLoadingIndicator();
            
            if (response) {
                this.showDialogueBox(response, this.currentNPC.name);
                this.addToConversation('npc', response);
                
                // Extract and store memory snippets from the conversation
                this.extractAndStoreMemories(message, response);
                
                // Show input again for continued conversation
                setTimeout(() => {
                    this.showConversationInput();
                }, 1000);
            }
        } catch (error) {
            console.error('Error getting LLM response:', error);
            this.hideLoadingIndicator();
            const fallbackResponse = "That's interesting! Is there anything specific you'd like to know about me or the outpost?";
            this.showDialogueBox(fallbackResponse, this.currentNPC.name);
            this.addToConversation('npc', fallbackResponse);
            
            setTimeout(() => {
                this.showConversationInput();
            }, 1000);
        }
    }

    // Extract key information from conversations and store as memories
    extractAndStoreMemories(playerMessage, npcResponse) {
        // Only look at the player's message for memory extraction
        const playerText = playerMessage.toLowerCase();
        
        // Look for key topics that should be remembered
        const memoryTopics = [
            // Personal information
            { keywords: ['family', 'home', 'planet', 'background', 'childhood', 'grew up'], prefix: 'Player shared personal info about' },
            { keywords: ['hobby', 'interest', 'like', 'enjoy', 'love', 'favorite'], prefix: 'Player mentioned they like' },
            { keywords: ['dislike', 'hate', 'don\'t like', 'not a fan', 'can\'t stand'], prefix: 'Player mentioned they dislike' },
            
            // Quest related
            { keywords: ['quest', 'work', 'job', 'task', 'mission', 'help'], prefix: 'Player asked about work' },
            { keywords: ['collect', 'find', 'bring', 'get', 'gather'], prefix: 'Player discussed collecting items' },
            
            // Game mechanics
            { keywords: ['inventory', 'items', 'crypto', 'money', 'currency'], prefix: 'Player discussed their resources' },
            { keywords: ['other npc', 'commander', 'engineer', 'trader', 'scout', 'doctor', 'sarah', 'marcus', 'eliza', 'jake', 'kim'], prefix: 'Player mentioned other NPCs' },
            
            // General conversation
            { keywords: ['outpost', 'station', 'space', 'frontier', 'base'], prefix: 'Player asked about the outpost' },
            { keywords: ['technology', 'science', 'research', 'experiment'], prefix: 'Player discussed technology' },
            
            // Age and personal questions
            { keywords: ['age', 'old', 'young', 'years'], prefix: 'Player asked about age' },
            { keywords: ['know about me', 'remember', 'said', 'told'], prefix: 'Player asked about previous conversation' }
        ];
        
        // Check for memory-worthy topics in player message only
        for (const topic of memoryTopics) {
            for (const keyword of topic.keywords) {
                if (playerText.includes(keyword)) {
                    // Extract a relevant snippet from player message only
                    const snippet = this.extractRelevantSnippetFromPlayer(playerMessage, keyword);
                    if (snippet && this.isMeaningfulMemory(snippet, topic.prefix)) {
                        const memoryText = `${topic.prefix}: ${snippet}`;
                        
                        // Check if this memory is already stored (avoid duplicates)
                        if (!this.isDuplicateMemory(memoryText)) {
                            this.addMemorySnippet(memoryText);
                            console.log(`[Memory System] Stored memory: ${memoryText}`);
                            return; // Only store one memory per conversation turn
                        }
                    }
                }
            }
        }
    }

    // Check if a memory is meaningful (not too short or generic)
    isMeaningfulMemory(snippet, prefix) {
        if (snippet.length < 10) return false;
        
        // Avoid very generic snippets
        const genericWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = snippet.toLowerCase().split(' ');
        const meaningfulWords = words.filter(word => !genericWords.includes(word));
        
        return meaningfulWords.length >= 2;
    }

    // Check if this memory is already stored (avoid duplicates)
    isDuplicateMemory(memoryText) {
        const memories = this.getNPCMemories();
        const normalizedNew = memoryText.toLowerCase().replace(/[^\w\s]/g, '');
        
        for (const memory of memories) {
            const normalizedExisting = memory.snippet.toLowerCase().replace(/[^\w\s]/g, '');
            if (normalizedNew.includes(normalizedExisting) || normalizedExisting.includes(normalizedNew)) {
                return true;
            }
        }
        return false;
    }

    // Extract a relevant snippet from the player message only
    extractRelevantSnippetFromPlayer(playerMessage, keyword) {
        const playerLower = playerMessage.toLowerCase();
        
        // Look for the keyword in player message
        if (playerLower.includes(keyword)) {
            const words = playerMessage.split(' ');
            const keywordIndex = words.findIndex(word => 
                word.toLowerCase().includes(keyword)
            );
            
            if (keywordIndex !== -1) {
                const start = Math.max(0, keywordIndex - 3);
                const end = Math.min(words.length, keywordIndex + 4);
                const snippet = words.slice(start, end).join(' ');
                
                // Clean up the snippet
                return this.cleanSnippet(snippet);
            }
        }
        
        // If no keyword found, try to extract a meaningful sentence from player message
        return this.extractMeaningfulSentenceFromPlayer(playerMessage);
    }

    // Extract a meaningful sentence from player message only
    extractMeaningfulSentenceFromPlayer(playerMessage) {
        // Try to find the most meaningful sentence in player message
        const sentences = playerMessage.split(/[.!?]+/);
        
        for (const sentence of sentences) {
            const trimmed = sentence.trim();
            if (trimmed.length > 10 && trimmed.length < 100) {
                // Check if it contains meaningful content
                const words = trimmed.toLowerCase().split(' ');
                const meaningfulWords = words.filter(word => 
                    word.length > 2 && !['the', 'and', 'but', 'for', 'are', 'was', 'were', 'have', 'has', 'had'].includes(word)
                );
                
                if (meaningfulWords.length >= 3) {
                    return this.cleanSnippet(trimmed);
                }
            }
        }
        
        return null;
    }

    // Clean up a snippet to make it more readable
    cleanSnippet(snippet) {
        // Remove extra whitespace
        let cleaned = snippet.replace(/\s+/g, ' ').trim();
        
        // Capitalize first letter
        if (cleaned.length > 0) {
            cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
        
        // Remove trailing punctuation if it's not a complete sentence
        if (cleaned.length > 0 && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
            cleaned = cleaned.replace(/[,.!?]+$/, '');
        }
        
        return cleaned;
    }

    async handleQuestSuggestion(suggestion) {
        if (this.isLoading) return;
        
        this.showLoadingIndicator();
        
        try {
            // Get available items and NPCs for quest generation
            const availableItems = this.scene.itemManager ? 
                this.scene.itemManager.getItemTypes() : [];
            const availableNPCs = this.scene.npcManager ? 
                this.scene.npcManager.getAllNPCs().map(npc => npc.name) : [];
            
            const questData = await this.apiService.generateQuestRequest(
                this.currentNPC.name,
                this.getConversationContext(),
                suggestion,
                availableItems,
                availableNPCs
            );
            
            this.hideLoadingIndicator();
            
            if (questData.success && questData.quest) {
                const quest = questData.quest;
                
                if (quest.error) {
                    // Quest suggestion was not possible
                    this.showDialogueBox(quest.response, this.currentNPC.name);
                    this.addToConversation('npc', quest.response);
                } else {
                    // Quest was generated successfully
                    this.showDialogueBox(quest.response, this.currentNPC.name);
                    this.addToConversation('npc', quest.response);
                    
                    // Create the quest object
                    const newQuest = {
                        id: `suggested_quest_${Date.now()}`,
                        title: quest.title,
                        description: quest.description,
                        type: quest.quest_type,
                        targetItemId: quest.target_item,
                        targetNPCId: quest.target_npc,
                        targetQuantity: quest.quantity || 1,
                        reward: { crypto: quest.reward_crypto },
                        giverId: this.currentNPC.id,
                        giverName: this.currentNPC.name,
                        status: 'pending'
                    };
                    
                    // Add to pending quests instead of active quests
                    if (this.scene.questManager) {
                        this.scene.questManager.addPendingQuest(newQuest);
                        
                        // Show accept/decline options
                        setTimeout(() => {
                            this.showQuestAcceptDeclineOptions(newQuest);
                        }, 2000);
                    }
                }
            } else {
                this.showDialogueBox("I'm not sure I can help with that right now. Maybe try a different suggestion?", this.currentNPC.name);
            }
        } catch (error) {
            console.error('Error generating quest:', error);
            this.hideLoadingIndicator();
            this.showDialogueBox("I'm having trouble processing that suggestion. Could you try something else?", this.currentNPC.name);
        }
    }

    // Show accept/decline options for a quest
    showQuestAcceptDeclineOptions(quest) {
        const uiManager = window.uiManager;
        const options = [
            { id: 'accept', text: 'Accept Quest', style: 'background: #00aa00;' },
            { id: 'decline', text: 'Decline Quest', style: 'background: #aa0000;' }
        ];
        
        uiManager.showQuestAcceptDeclineOptions(quest, options, (optionId) => {
            this.handleQuestAcceptDecline(quest.id, optionId);
        });
    }

    // Handle quest accept/decline
    handleQuestAcceptDecline(questId, optionId) {
        if (!this.scene.questManager) return;
        
        if (optionId === 'accept') {
            const success = this.scene.questManager.acceptQuest(questId);
            if (success) {
                window.uiManager.showDialogue("Excellent! I've added it to your quest log. Good luck!", this.currentNPC.name);
                this.addToConversation('npc', "Excellent! I've added it to your quest log. Good luck!");
                
                // Continue conversation
                setTimeout(() => {
                    this.showConversationInput();
                }, 2000);
            }
        } else if (optionId === 'decline') {
            const success = this.scene.questManager.declineQuest(questId);
            if (success) {
                window.uiManager.showDialogue("No problem! Let me know if you change your mind or need anything else.", this.currentNPC.name);
                this.addToConversation('npc', "No problem! Let me know if you change your mind or need anything else.");
                
                // Continue conversation
                setTimeout(() => {
                    this.showConversationInput();
                }, 2000);
            }
        }
    }

    async sendMessage(message) {
        if (this.isLoading) return;
        
        this.addToConversation('player', message);
        
        // Check if this is a quest request
        if (this.isQuestRequest(message)) {
            await this.handleQuestRequest(message);
        } else {
            // Regular conversation
            await this.handleRegularConversation(message);
        }
    }

    isQuestRequest(message) {
        const questKeywords = ['quest', 'work', 'job', 'task', 'mission', 'help', 'need', 'collect', 'find', 'bring', 'get'];
        return questKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    async handleQuestRequest(message) {
        this.showLoadingIndicator();
        
        try {
            // Get available items and NPCs for quest generation
            const availableItems = this.scene.itemManager ? 
                this.scene.itemManager.getItemTypes() : [];
            const availableNPCs = this.scene.npcManager ? 
                this.scene.npcManager.getAllNPCs().map(npc => npc.name) : [];
            
            const questData = await this.apiService.generateQuestRequest(
                this.currentNPC.name,
                this.getConversationContext(),
                message,
                availableItems,
                availableNPCs
            );
            
            this.hideLoadingIndicator();
            
            if (questData.success && questData.quest) {
                const quest = questData.quest;
                
                if (quest.error) {
                    this.showDialogueBox(quest.response, this.currentNPC.name);
                    this.addToConversation('npc', quest.response);
                } else {
                    this.showDialogueBox(quest.response, this.currentNPC.name);
                    this.addToConversation('npc', quest.response);
                    
                    // Create the quest object
                    const newQuest = {
                        id: `quest_${Date.now()}`,
                        title: quest.title,
                        description: quest.description,
                        type: quest.quest_type,
                        targetItemId: quest.target_item,
                        targetNPCId: quest.target_npc,
                        targetQuantity: quest.quantity || 1,
                        reward: { crypto: quest.reward_crypto },
                        giverId: this.currentNPC.id,
                        giverName: this.currentNPC.name,
                        status: 'pending'
                    };
                    
                    // Add to pending quests
                    if (this.scene.questManager) {
                        this.scene.questManager.addPendingQuest(newQuest);
                        
                        // Show accept/decline options
                        setTimeout(() => {
                            this.showQuestAcceptDeclineOptions(newQuest);
                        }, 2000);
                    }
                }
            } else {
                this.showDialogueBox("I don't have any work available right now. Maybe try asking about something else?", this.currentNPC.name);
            }
        } catch (error) {
            console.error('Error generating quest:', error);
            this.hideLoadingIndicator();
            this.showDialogueBox("I'm having trouble right now. Could you try asking something else?", this.currentNPC.name);
        }
    }

    showDialogueBox(message, speakerName) {
        window.uiManager.showDialogue(message, speakerName);
    }

    showLoadingIndicator() {
        this.isLoading = true;
        window.uiManager.showDialogue("...", this.currentNPC.name);
    }

    hideLoadingIndicator() {
        this.isLoading = false;
    }

    async getLLMResponse(message) {
        try {
            this.isLoading = true;
            
            // Get player context
            const playerContext = this.getPlayerContext();
            
            // Get NPC data for better context
            const npcData = this.currentNPC ? {
                npc_name: this.currentNPC.name,
                npc_personality: this.currentNPC.personality,
                npc_role: this.currentNPC.role,
                npc_background: this.currentNPC.background,
                npc_dialogue_style: this.currentNPC.dialogueStyle
            } : null;
            
            // Get memory context for this NPC
            const memoryContext = this.getMemoryContext();
            
            // Send request to backend with memory context
            const response = await this.apiService.sendDialogueRequest(
                this.currentNPC.name,
                message,
                playerContext,
                npcData,
                memoryContext // Add memory context
            );
            
            this.isLoading = false;
            return response;
        } catch (error) {
            console.error('Error in getLLMResponse:', error);
            this.isLoading = false;
            return "I'm having trouble processing that right now. Could you try again?";
        }
    }

    getPlayerContext() {
        return {
            position: this.scene.player ? this.scene.player.getPosition() : { x: 0, y: 0 },
            active_quests: this.scene.questManager ? this.scene.questManager.getActiveQuests() : [],
            inventory: this.scene.inventoryManager ? this.scene.inventoryManager.getInventory() : [],
            crypto: this.scene.inventoryManager ? this.scene.inventoryManager.getCrypto() : 0
        };
    }

    closeDialogue() {
        this.isInDialogue = false;
        this.currentNPC = null;
        this.currentConversation = [];
        
        if (window.uiManager) {
            window.uiManager.hideDialogue();
            window.uiManager.hideCustomInput();
        }
    }

    isDialogueOpen() {
        return this.isInDialogue;
    }
} 