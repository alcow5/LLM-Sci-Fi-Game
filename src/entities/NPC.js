export class NPC {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.config = config;
        this.sprite = scene.physics.add.sprite(x, y, config.spriteKey);
        
        // Set NPC to render on top of procedural tiles
        this.sprite.setDepth(1000);
        
        // NPC properties from new data structure
        this.id = config.id;
        this.name = config.name;
        this.personality = config.personality;
        this.role = config.role;
        this.background = config.background;
        this.dialogueStyle = config.dialogueStyle;
        this.defaultGreeting = config.defaultGreeting;
        this.interactionRange = 50;
        this.lastClickTime = 0; // Add click cooldown
        this.clickCooldown = 1000; // 1 second cooldown
        
        // Set sprite frame based on NPC type (No longer needed with unique sprites)
        // this.sprite.setFrame(config.spriteFrame || 0);
        
        // Make sprite interactive
        this.sprite.setInteractive();
        
        // Add hover effect with name tooltip
        this.sprite.on('pointerover', () => {
            this.sprite.setTint(0x00ff00); // Highlight with green tint
            if (window.uiManager) {
                window.uiManager.showTooltip(this.name, this.sprite);
            }
        });
        
        this.sprite.on('pointerout', () => {
            this.sprite.clearTint();
            if (window.uiManager) {
                window.uiManager.hideTooltip();
            }
        });
        
        // Add click event
        this.sprite.on('pointerdown', () => {
            this.onInteract();
        });
    }

    onInteract() {
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            this.scene.player.sprite.x, this.scene.player.sprite.y
        );

        if (distance <= 64) { // 2 tiles distance
            this.scene.dialogueManager.startDialogue(this);
        } else {
            if (window.uiManager) {
                window.uiManager.showMessage(`You need to get closer to ${this.name} to talk.`, 2000);
            }
        }
    }

    generateQuest() {
        if (this.scene.questManager) {
            return this.scene.questManager.generateQuest(this.id);
        }
        return null;
    }

    hasActiveQuest() {
        if (this.scene.questManager) {
            const activeQuests = this.scene.questManager.getActiveQuests();
            return activeQuests.some(quest => quest.giverId === this.id);
        }
        return false;
    }

    getQuestDialogueOptions() {
        const options = [];
        
        if (!this.hasActiveQuest()) {
            options.push({
                id: 'request_quest',
                text: 'Do you have any tasks I can help with?'
            });
        } else {
            options.push({
                id: 'check_quest',
                text: 'How is my progress on your task?'
            });
        }
        
        return options;
    }

    handleQuestDialogue(optionId) {
        switch (optionId) {
            case 'request_quest':
                const quest = this.generateQuest();
                if (quest) {
                    return `Ah, thank you for offering! ${quest.description} I'll reward you with ${quest.reward.crypto} crypto when you complete it.`;
                } else {
                    return "I don't have any tasks for you right now, but check back later!";
                }
            case 'check_quest':
                const activeQuest = this.scene.questManager.getActiveQuests().find(q => q.giverId === this.id);
                if (activeQuest) {
                    const completed = this.scene.questManager.checkQuestCompletion(activeQuest.id);
                    if (completed) {
                        return "Excellent work! Thank you for completing that task for me.";
                    } else {
                        return `You still need to ${activeQuest.description.toLowerCase()}`;
                    }
                }
                return "I don't see any active tasks for you.";
        }
    }

    getPosition() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    update() {
        // NPC update logic (idle animations, etc.)
        // For now, just keep the sprite static
    }

    destroy() {
        this.sprite.destroy();
    }
} 