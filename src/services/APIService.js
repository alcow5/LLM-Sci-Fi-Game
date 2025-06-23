export class APIService {
    constructor() {
        this.baseURL = 'http://localhost:5000';
        this.endpoints = {
            dialogue: '/api/dialogue',
            quest: '/api/quest',
            generateQuest: '/api/generate-quest',
            save: '/api/save',
            load: '/api/load'
        };
    }

    async sendDialogueRequest(npcName, message, playerContext, npcData = null, memoryContext = "") {
        try {
            const data = {
                npc_name: npcName,
                player_message: message,
                player_context: playerContext,
                memory_context: memoryContext
            };
            
            // Add full NPC data if provided
            if (npcData) {
                data.npc_id = npcData.npc_name?.toLowerCase().replace(/\s+/g, '_');
                data.npc_personality = npcData.npc_personality;
                data.npc_role = npcData.npc_role;
                data.npc_background = npcData.npc_background;
                data.npc_dialogue_style = npcData.npc_dialogue_style;
            }

            const response = await fetch(`${this.baseURL}${this.endpoints.dialogue}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.message || result.response || "I'm not sure how to respond to that.";
        } catch (error) {
            console.error('API request failed:', error);
            
            // Handle specific connection errors
            if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_RESET')) {
                console.warn('Backend connection issue detected. Using fallback response.');
                return this.getFallbackResponse({ topic_id: 'connection_error' });
            }
            
            // Return a fallback response if API is unavailable
            return this.getFallbackResponse({ topic_id: 'custom' });
        }
    }

    async generateQuestRequest(npcName, conversationContext, playerSuggestion, availableItems, availableNPCs) {
        try {
            const data = {
                npc_name: npcName,
                conversation_context: conversationContext,
                player_suggestion: playerSuggestion,
                available_items: availableItems,
                available_npcs: availableNPCs
            };

            const response = await fetch(`${this.baseURL}${this.endpoints.generateQuest}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Generate quest API request failed:', error);
            return {
                success: false,
                message: 'Failed to generate quest',
                quest: {
                    error: 'Unable to generate quest at this time',
                    response: 'I\'m having trouble processing that suggestion right now. Could you try something else?'
                }
            };
        }
    }

    async sendQuestRequest(data) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.quest}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Quest API request failed:', error);
            return this.getFallbackQuestResponse(data);
        }
    }

    async saveGameState(gameState) {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.save}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameState)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Save game failed:', error);
            // Fallback to localStorage
            this.saveToLocalStorage(gameState);
            return { success: true, message: 'Saved to local storage' };
        }
    }

    async loadGameState() {
        try {
            const response = await fetch(`${this.baseURL}${this.endpoints.load}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Load game failed:', error);
            // Fallback to localStorage
            return this.loadFromLocalStorage();
        }
    }

    getFallbackResponse(data) {
        // Provide fallback responses when API is unavailable
        const fallbackResponses = {
            'trade': "I have some interesting items, but my inventory system is currently offline. Please check back later!",
            'quest': "I do have some work that needs doing, but I need to check my task list. Can you come back in a moment?",
            'research': "My research is quite fascinating! I'm studying ancient technology and energy patterns.",
            'artifacts': "I've found several mysterious artifacts, but I need more time to analyze them properly.",
            'security': "Security is always a concern around here. We're doing our best to keep everyone safe.",
            'help': "We could always use more help around here. Let me know if you're interested in joining our security team.",
            'custom': "That's an interesting point. I'd love to discuss it more, but my connection to the central database is currently down.",
            'connection_error': "I'm having trouble connecting to the central database right now. Please try again in a moment."
        };

        const topicId = data.topic_id;
        const response = fallbackResponses[topicId] || 
            "That's an interesting question. I'd love to tell you more, but my connection to the central database is currently down.";

        return response;
    }

    getFallbackQuestResponse(data) {
        return {
            quest: {
                id: `fallback_quest_${Date.now()}`,
                title: "Temporary Assignment",
                description: "This is a placeholder quest while the system is offline.",
                reward: "Basic compensation",
                status: "available"
            },
            source: 'fallback'
        };
    }

    saveToLocalStorage(gameState) {
        try {
            localStorage.setItem('llm-scifi-game-save', JSON.stringify(gameState));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('llm-scifi-game-save');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    // Test API connectivity
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.ok;
        } catch (error) {
            console.warn('API server not available:', error);
            return false;
        }
    }
} 