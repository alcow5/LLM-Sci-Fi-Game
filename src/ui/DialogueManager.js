import { APIService } from '../services/APIService.js';

export class DialogueManager {
    constructor(scene) {
        this.scene = scene;
        this.currentNPC = null;
        this.isInDialogue = false;
        this.currentConversation = [];
        this.isLoading = false;
        this.apiService = new APIService();
        
        // Enhanced memory system
        this.npcMemories = new Map(); // npcId -> MemoryEntry[]
        this.relationshipScores = new Map(); // npcId -> { trust: number, friendship: number, etc }
        this.conversationHistory = new Map(); // npcId -> ConversationEntry[]
        
        // Memory categories for better organization
        this.memoryCategories = {
            PERSONAL_INFO: 'personal_info',
            RELATIONSHIP: 'relationship',
            QUESTS: 'quests',
            PROMISES: 'promises',
            EMOTIONAL: 'emotional',
            GOSSIP: 'gossip',
            TRADE: 'trade',
            EVENTS: 'events'
        };
    }

    // Enhanced memory entry structure
    addMemoryEntry(npcId, category, content, emotionalContext = null, timestamp = Date.now()) {
        if (!this.npcMemories.has(npcId)) {
            this.npcMemories.set(npcId, []);
        }
        
        const memories = this.npcMemories.get(npcId);
        const memoryEntry = {
            id: `memory_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            category: category,
            content: content,
            emotionalContext: emotionalContext,
            timestamp: timestamp,
            importance: this.calculateMemoryImportance(content, emotionalContext),
            referenced: 0 // Track how often this memory is referenced
        };
        
        memories.push(memoryEntry);
        
        // Keep only the most important memories (max 10 per NPC)
        this.pruneMemories(npcId);
        
        console.log(`[Enhanced Memory System] Stored ${category} memory for ${npcId}:`, content);
        return memoryEntry;
    }

    // Calculate memory importance based on content and emotional context
    calculateMemoryImportance(content, emotionalContext) {
        let importance = 1;
        
        // Increase importance for emotional content
        if (emotionalContext) {
            if (emotionalContext.includes('angry') || emotionalContext.includes('furious')) importance += 3;
            if (emotionalContext.includes('happy') || emotionalContext.includes('excited')) importance += 2;
            if (emotionalContext.includes('sad') || emotionalContext.includes('hurt')) importance += 2;
            if (emotionalContext.includes('trust') || emotionalContext.includes('betrayal')) importance += 4;
        }
        
        // Increase importance for specific content types
        if (content.includes('promise') || content.includes('deal') || content.includes('agreement')) importance += 3;
        if (content.includes('secret') || content.includes('confidential')) importance += 3;
        if (content.includes('quest') || content.includes('mission')) importance += 2;
        if (content.includes('crypto') || content.includes('money') || content.includes('payment')) importance += 2;
        if (content.includes('relationship') || content.includes('romantic') || content.includes('intimate')) importance += 3;
        
        // Increase importance for personal information
        if (content.includes('family') || content.includes('home') || content.includes('background')) importance += 2;
        
        return Math.min(importance, 10); // Cap at 10
    }

    // Prune memories to keep only the most important ones
    pruneMemories(npcId) {
        const memories = this.npcMemories.get(npcId);
        if (memories.length > 10) {
            // Sort by importance and recency
            memories.sort((a, b) => {
                const importanceDiff = b.importance - a.importance;
                if (importanceDiff !== 0) return importanceDiff;
                return b.timestamp - a.timestamp;
            });
            
            // Keep only the top 10
            this.npcMemories.set(npcId, memories.slice(0, 10));
        }
    }

    // Enhanced memory extraction using AI-like analysis
    extractAndStoreMemories(playerMessage, npcResponse) {
        if (!this.currentNPC) return;
        
        const npcId = this.currentNPC.id;
        const playerText = playerMessage.toLowerCase();
        const npcText = npcResponse.toLowerCase();
        
        // Extract emotional context
        const emotionalContext = this.extractEmotionalContext(playerMessage, npcResponse);
        
        // Extract and store different types of memories
        
        // 1. Personal Information
        this.extractPersonalInfo(playerMessage, npcId, emotionalContext);
        
        // 2. Relationship Dynamics
        this.extractRelationshipInfo(playerMessage, npcResponse, npcId, emotionalContext);
        
        // 3. Promises and Deals
        this.extractPromises(playerMessage, npcResponse, npcId, emotionalContext);
        
        // 4. Quest-related Information
        this.extractQuestInfo(playerMessage, npcId, emotionalContext);
        
        // 5. Emotional Moments
        this.extractEmotionalMoments(playerMessage, npcResponse, npcId, emotionalContext);
        
        // 6. Gossip about other NPCs
        this.extractGossip(playerMessage, npcId, emotionalContext);
        
        // 7. Trade and Business
        this.extractTradeInfo(playerMessage, npcId, emotionalContext);
        
        // Update relationship scores based on conversation
        this.updateRelationshipScores(playerMessage, npcResponse, npcId);
        
        // Store conversation history
        this.addConversationEntry(npcId, playerMessage, npcResponse, emotionalContext);
    }

    // Extract emotional context from conversation
    extractEmotionalContext(playerMessage, npcResponse) {
        const context = [];
        const playerLower = playerMessage.toLowerCase();
        const npcLower = npcResponse.toLowerCase();
        
        // Player emotions
        if (playerLower.includes('fuck') || playerLower.includes('damn') || playerLower.includes('shit')) context.push('angry');
        if (playerLower.includes('love') || playerLower.includes('like') || playerLower.includes('great')) context.push('positive');
        if (playerLower.includes('hate') || playerLower.includes('dislike') || playerLower.includes('terrible')) context.push('negative');
        if (playerLower.includes('trust') || playerLower.includes('believe')) context.push('trusting');
        if (playerLower.includes('secret') || playerLower.includes('confidential')) context.push('confidential');
        
        // NPC emotions
        if (npcLower.includes('fuck') || npcLower.includes('damn') || npcLower.includes('shit')) context.push('npc_angry');
        if (npcLower.includes('love') || npcLower.includes('like') || npcLower.includes('great')) context.push('npc_positive');
        if (npcLower.includes('hate') || npcLower.includes('dislike') || npcLower.includes('terrible')) context.push('npc_negative');
        
        return context.join(', ');
    }

    // Extract personal information
    extractPersonalInfo(playerMessage, npcId, emotionalContext) {
        const personalKeywords = [
            'family', 'home', 'planet', 'background', 'childhood', 'grew up',
            'hobby', 'interest', 'like', 'enjoy', 'love', 'favorite',
            'dislike', 'hate', 'don\'t like', 'not a fan', 'can\'t stand',
            'age', 'old', 'young', 'years', 'job', 'work', 'career'
        ];
        
        for (const keyword of personalKeywords) {
            if (playerMessage.toLowerCase().includes(keyword)) {
                const snippet = this.extractRelevantSnippet(playerMessage, keyword);
                if (snippet && snippet.length > 15) { // Ensure meaningful length
                    this.addMemoryEntry(npcId, this.memoryCategories.PERSONAL_INFO, 
                        `Player shared: ${snippet}`, emotionalContext);
                    break; // Only store one personal info per conversation
                }
            }
        }
    }

    // Extract relationship information
    extractRelationshipInfo(playerMessage, npcResponse, npcId, emotionalContext) {
        const relationshipKeywords = [
            'friend', 'enemy', 'trust', 'betray', 'like', 'dislike',
            'romantic', 'intimate', 'relationship', 'together', 'love',
            'fuck', 'sex', 'intimate', 'close', 'distant'
        ];
        
        for (const keyword of relationshipKeywords) {
            if (playerMessage.toLowerCase().includes(keyword) || npcResponse.toLowerCase().includes(keyword)) {
                const snippet = this.extractRelevantSnippet(playerMessage + ' ' + npcResponse, keyword);
                if (snippet && snippet.length > 15) { // Ensure meaningful length
                    this.addMemoryEntry(npcId, this.memoryCategories.RELATIONSHIP, 
                        `Relationship context: ${snippet}`, emotionalContext);
                    break;
                }
            }
        }
    }

    // Extract promises and deals
    extractPromises(playerMessage, npcResponse, npcId, emotionalContext) {
        const promiseKeywords = [
            'promise', 'deal', 'agreement', 'will do', 'going to',
            'guarantee', 'assure', 'commit', 'owe', 'pay', 'reward'
        ];
        
        for (const keyword of promiseKeywords) {
            if (playerMessage.toLowerCase().includes(keyword) || npcResponse.toLowerCase().includes(keyword)) {
                const snippet = this.extractRelevantSnippet(playerMessage + ' ' + npcResponse, keyword);
                if (snippet && snippet.length > 15) { // Ensure meaningful length
                    this.addMemoryEntry(npcId, this.memoryCategories.PROMISES, 
                        `Promise/Deal: ${snippet}`, emotionalContext);
                    break;
                }
            }
        }
    }

    // Extract quest information
    extractQuestInfo(playerMessage, npcId, emotionalContext) {
        const questKeywords = [
            'quest', 'work', 'job', 'task', 'mission', 'help',
            'collect', 'find', 'bring', 'get', 'gather', 'crypto', 'reward'
        ];
        
        for (const keyword of questKeywords) {
            if (playerMessage.toLowerCase().includes(keyword)) {
                const snippet = this.extractRelevantSnippet(playerMessage, keyword);
                if (snippet && snippet.length > 15) { // Ensure meaningful length
                    this.addMemoryEntry(npcId, this.memoryCategories.QUESTS, 
                        `Quest related: ${snippet}`, emotionalContext);
                    break;
                }
            }
        }
    }

    // Extract emotional moments
    extractEmotionalMoments(playerMessage, npcResponse, npcId, emotionalContext) {
        const emotionalKeywords = [
            'fuck', 'damn', 'shit', 'love', 'hate', 'angry', 'happy',
            'sad', 'excited', 'disappointed', 'surprised', 'shocked'
        ];
        
        for (const keyword of emotionalKeywords) {
            if (playerMessage.toLowerCase().includes(keyword) || npcResponse.toLowerCase().includes(keyword)) {
                const snippet = this.extractRelevantSnippet(playerMessage + ' ' + npcResponse, keyword);
                if (snippet && snippet.length > 15) { // Ensure meaningful length
                    this.addMemoryEntry(npcId, this.memoryCategories.EMOTIONAL, 
                        `Emotional moment: ${snippet}`, emotionalContext);
                    break;
                }
            }
        }
    }

    // Extract gossip about other NPCs
    extractGossip(playerMessage, npcId, emotionalContext) {
        const npcNames = ['sarah', 'kim', 'marcus', 'eliza', 'jake', 'rick'];
        
        for (const npcName of npcNames) {
            if (playerMessage.toLowerCase().includes(npcName)) {
                const snippet = this.extractRelevantSnippet(playerMessage, npcName);
                if (snippet && snippet.length > 15) { // Ensure meaningful length
                    this.addMemoryEntry(npcId, this.memoryCategories.GOSSIP, 
                        `Gossip about ${npcName}: ${snippet}`, emotionalContext);
                    break;
                }
            }
        }
    }

    // Extract trade and business information
    extractTradeInfo(playerMessage, npcId, emotionalContext) {
        const tradeKeywords = [
            'crypto', 'money', 'payment', 'price', 'cost', 'deal',
            'trade', 'sell', 'buy', 'exchange', 'bargain', 'discount'
        ];
        
        for (const keyword of tradeKeywords) {
            if (playerMessage.toLowerCase().includes(keyword)) {
                const snippet = this.extractRelevantSnippet(playerMessage, keyword);
                if (snippet && snippet.length > 15) { // Ensure meaningful length
                    this.addMemoryEntry(npcId, this.memoryCategories.TRADE, 
                        `Trade/Business: ${snippet}`, emotionalContext);
                    break;
                }
            }
        }
    }

    // Update relationship scores based on conversation
    updateRelationshipScores(playerMessage, npcResponse, npcId) {
        if (!this.relationshipScores.has(npcId)) {
            this.relationshipScores.set(npcId, {
                trust: 50,
                friendship: 50,
                respect: 50,
                attraction: 50
            });
        }
        
        const scores = this.relationshipScores.get(npcId);
        const playerLower = playerMessage.toLowerCase();
        const npcLower = npcResponse.toLowerCase();
        
        // Adjust scores based on conversation content
        if (playerLower.includes('fuck') && !playerLower.includes('fuck you')) scores.attraction += 5;
        if (playerLower.includes('fuck you')) scores.friendship -= 10;
        if (playerLower.includes('trust') || playerLower.includes('believe')) scores.trust += 5;
        if (playerLower.includes('love') || playerLower.includes('like')) scores.friendship += 5;
        if (playerLower.includes('hate') || playerLower.includes('dislike')) scores.friendship -= 5;
        if (playerLower.includes('respect')) scores.respect += 5;
        
        // Cap scores between 0 and 100
        Object.keys(scores).forEach(key => {
            scores[key] = Math.max(0, Math.min(100, scores[key]));
        });
    }

    // Add conversation entry to history
    addConversationEntry(npcId, playerMessage, npcResponse, emotionalContext) {
        if (!this.conversationHistory.has(npcId)) {
            this.conversationHistory.set(npcId, []);
        }
        
        const history = this.conversationHistory.get(npcId);
        history.push({
            timestamp: Date.now(),
            playerMessage: playerMessage,
            npcResponse: npcResponse,
            emotionalContext: emotionalContext
        });
        
        // Keep only last 5 conversations
        if (history.length > 5) {
            history.shift();
        }
    }

    // Enhanced memory context for LLM
    getMemoryContext() {
        if (!this.currentNPC) return "";
        
        const npcId = this.currentNPC.id;
        const memories = this.npcMemories.get(npcId) || [];
        const relationshipScores = this.relationshipScores.get(npcId);
        const recentConversations = this.conversationHistory.get(npcId) || [];
        
        if (memories.length === 0 && !relationshipScores) return "";
        
        let context = "\n\n=== NPC MEMORY CONTEXT ===\n";
        
        // Add relationship scores
        if (relationshipScores) {
            context += `RELATIONSHIP STATUS:\n`;
            context += `- Trust: ${relationshipScores.trust}/100\n`;
            context += `- Friendship: ${relationshipScores.friendship}/100\n`;
            context += `- Respect: ${relationshipScores.respect}/100\n`;
            context += `- Attraction: ${relationshipScores.attraction}/100\n\n`;
        }
        
        // Add categorized memories
        const categorizedMemories = {};
        memories.forEach(memory => {
            if (!categorizedMemories[memory.category]) {
                categorizedMemories[memory.category] = [];
            }
            categorizedMemories[memory.category].push(memory);
        });
        
        Object.entries(categorizedMemories).forEach(([category, categoryMemories]) => {
            context += `${category.toUpperCase()}:\n`;
            categoryMemories.forEach(memory => {
                context += `- ${memory.content}`;
                if (memory.emotionalContext) {
                    context += ` (${memory.emotionalContext})`;
                }
                context += '\n';
            });
            context += '\n';
        });
        
        // Add recent conversation context
        if (recentConversations.length > 0) {
            context += `RECENT CONVERSATION CONTEXT:\n`;
            recentConversations.slice(-2).forEach(conv => {
                context += `Player: "${conv.playerMessage}"\n`;
                context += `NPC: "${conv.npcResponse}"\n`;
                if (conv.emotionalContext) {
                    context += `Emotion: ${conv.emotionalContext}\n`;
                }
                context += '\n';
            });
        }
        
        context += "=== END MEMORY CONTEXT ===\n\n";
        
        console.log(`[Enhanced Memory System] Using ${memories.length} memories for ${this.currentNPC.name}`);
        return context;
    }

    // Get memories by category
    getMemoriesByCategory(npcId, category) {
        const memories = this.npcMemories.get(npcId) || [];
        return memories.filter(memory => memory.category === category);
    }

    // Get relationship scores
    getRelationshipScores(npcId) {
        return this.relationshipScores.get(npcId) || {
            trust: 50,
            friendship: 50,
            respect: 50,
            attraction: 50
        };
    }

    // Enhanced snippet extraction
    extractRelevantSnippet(text, keyword) {
        const words = text.split(' ');
        const keywordIndex = words.findIndex(word => 
            word.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (keywordIndex !== -1) {
            const start = Math.max(0, keywordIndex - 3);
            const end = Math.min(words.length, keywordIndex + 4);
            const snippet = words.slice(start, end).join(' ');
            
            // Only return if the snippet is meaningful
            const cleaned = this.cleanSnippet(snippet);
            if (cleaned && cleaned.length > 10 && cleaned.length < 100) {
                return cleaned;
            }
        }
        
        return null;
    }

    // Clean snippet (existing method)
    cleanSnippet(snippet) {
        let cleaned = snippet.replace(/\s+/g, ' ').trim();
        if (cleaned.length > 0) {
            cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
        if (cleaned.length > 0 && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
            cleaned = cleaned.replace(/[,.!?]+$/, '');
        }
        return cleaned;
    }

    // Debug method to show enhanced memories
    debugShowMemories() {
        console.log("=== ENHANCED NPC MEMORIES DEBUG ===");
        for (const [npcId, memories] of this.npcMemories.entries()) {
            console.log(`${npcId}:`, memories);
        }
        console.log("=== RELATIONSHIP SCORES ===");
        for (const [npcId, scores] of this.relationshipScores.entries()) {
            console.log(`${npcId}:`, scores);
        }
        console.log("==========================");
    }

    // Clear all memories (for testing)
    clearAllMemories() {
        this.npcMemories.clear();
        this.relationshipScores.clear();
        this.conversationHistory.clear();
        console.log("[Enhanced Memory System] All memories cleared");
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
        
        // Check if this is a quest-related message with more specific detection
        const questKeywords = [
            'quest', 'work', 'job', 'task', 'mission', 
            'help me', 'need help', 'collect for', 'find for', 'bring for', 'get for',
            'can you give me a quest', 'do you have work', 'any tasks available',
            'looking for work', 'need a job', 'want to help'
        ];
        
        // More sophisticated quest detection
        const isQuestRelated = this.isQuestRequest(message, questKeywords);
        
        if (isQuestRelated) {
            // Handle as quest suggestion
            await this.handleQuestSuggestion(message);
        } else {
            // Handle as regular conversation
            await this.handleRegularConversation(message);
        }
    }

    // Improved quest detection method
    isQuestRequest(message, questKeywords) {
        const lowerMessage = message.toLowerCase();
        
        // Check for explicit quest keywords
        const hasExplicitQuestKeyword = questKeywords.some(keyword => 
            lowerMessage.includes(keyword)
        );
        
        // Check for context that suggests casual conversation
        const casualContexts = [
            'how are you', 'how have you been', 'what\'s up', 'sup', 'hello', 'hi',
            'heard about', 'tell me about', 'what do you think', 'do you know',
            'recently', 'lately', 'together', 'relationship', 'love', 'dating',
            'personal', 'private', 'between you and', 'you and', 'got together'
        ];
        
        const hasCasualContext = casualContexts.some(context => 
            lowerMessage.includes(context)
        );
        
        // If it has casual context, it's likely not a quest request
        if (hasCasualContext) {
            return false;
        }
        
        // If it has explicit quest keywords, it's likely a quest request
        if (hasExplicitQuestKeyword) {
            return true;
        }
        
        // Default to conversation for ambiguous cases
        return false;
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
            inventory: this.scene.inventoryManager ? this.scene.inventoryManager.getItems() : [],
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