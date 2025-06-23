export class UIManager {
    constructor() {
        this.container = document.getElementById('ui-overlay');
        this.scene = window.gameScene;
        this.dialogueBox = null;
        this.questLog = null;
        this.messageQueue = [];
        this.isShowingMessage = false;
        this.isDragging = false;
        this.draggedElement = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        this.init();
    }

    init() {
        this.createDialogueBox();
        this.createQuestLog();
        this.createMessageSystem();
        this.createCustomInput();
        this.createTooltip();
        this.createInventory();

        // Add global drag listeners
        document.addEventListener('mousemove', (e) => this.onDragMove(e));
        document.addEventListener('mouseup', (e) => this.onDragEnd(e));
    }

    createDialogueBox() {
        this.dialogueBox = document.createElement('div');
        this.dialogueBox.className = 'dialogue-box';
        this.dialogueBox.style.cssText = `
            position: absolute;
            bottom: 150px;
            left: 20px;
            right: 20px;
            max-height: 250px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 20px;
            color: white;
            font-family: 'Courier New', monospace;
            display: none;
            z-index: 1000;
            overflow-y: auto;
        `;
        
        this.container.appendChild(this.dialogueBox);
    }

    createQuestLog() {
        this.questLog = document.createElement('div');
        this.questLog.className = 'quest-log';
        this.questLog.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #ffaa00;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: 'Courier New', monospace;
            overflow-y: auto;
            display: none;
            z-index: 1000;
        `;
        
        this.container.appendChild(this.questLog);
        
        // Add toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Quest Log (Q)';
        toggleButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: #ffaa00;
            border: none;
            border-radius: 5px;
            padding: 10px;
            color: black;
            font-weight: bold;
            cursor: pointer;
            z-index: 1001;
        `;
        
        toggleButton.onclick = () => this.toggleQuestLog();
        this.container.appendChild(toggleButton);
        
        // Add log viewer button
        const logButton = document.createElement('button');
        logButton.textContent = 'View Logs (L)';
        logButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 120px;
            background: #0066ff;
            border: none;
            border-radius: 5px;
            padding: 10px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            z-index: 1001;
        `;
        
        logButton.onclick = () => this.showLogViewer();
        this.container.appendChild(logButton);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'q' || e.key === 'Q') {
                this.toggleQuestLog();
            } else if (e.key === 'l' || e.key === 'L') {
                this.showLogViewer();
            } else if (e.key === 'i' || e.key === 'I') {
                this.toggleInventory();
            }
        });
    }

    createMessageSystem() {
        this.messageContainer = document.createElement('div');
        this.messageContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ff0000;
            border-radius: 10px;
            padding: 20px;
            color: white;
            font-family: 'Courier New', monospace;
            text-align: center;
            display: none;
            z-index: 1002;
        `;
        
        this.container.appendChild(this.messageContainer);
    }

    createCustomInput() {
        this.customInputContainer = document.createElement('div');
        this.customInputContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #0066ff;
            border-radius: 10px;
            padding: 12px;
            color: white;
            font-family: 'Courier New', monospace;
            display: none;
            z-index: 1001;
        `;
        
        this.container.appendChild(this.customInputContainer);
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ffff;
            border-radius: 5px;
            padding: 8px 12px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            display: none;
            z-index: 1003;
            pointer-events: none;
        `;
        
        this.container.appendChild(this.tooltip);
    }

    createInventory() {
        const inventoryContainer = document.createElement('div');
        inventoryContainer.id = 'inventory-container';
        inventoryContainer.style.cssText = `
            position: absolute;
            top: 150px;
            right: 20px;
            width: 254px;
            z-index: 1000;
        `;

        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Inventory (I)';
        toggleButton.style.cssText = `
            display: block;
            width: 100%;
            box-sizing: border-box;
            background: #00ffff;
            border: 2px solid #00ffff;
            border-bottom: none;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            padding: 10px;
            color: black;
            font-weight: bold;
            cursor: pointer;
        `;
        toggleButton.onclick = () => this.toggleInventory();
        
        // Add mousedown listener for dragging
        toggleButton.addEventListener('mousedown', (e) => {
            if (e.shiftKey) {
                const rect = inventoryContainer.getBoundingClientRect();
                const parentRect = inventoryContainer.offsetParent.getBoundingClientRect();
                
                inventoryContainer.style.right = 'auto';
                inventoryContainer.style.bottom = 'auto';
                inventoryContainer.style.left = `${rect.left - parentRect.left}px`;
                inventoryContainer.style.top = `${rect.top - parentRect.top}px`;
                
                this.isDragging = true;
                this.draggedElement = inventoryContainer;
                this.dragOffsetX = e.clientX - rect.left;
                this.dragOffsetY = e.clientY - rect.top;
                e.preventDefault(); // Prevent text selection
            }
        });

        this.inventoryGrid = document.createElement('div');
        this.inventoryGrid.id = 'inventory-grid';
        this.inventoryGrid.style.cssText = `
            display: none; /* Initially hidden */
            grid-template-columns: repeat(4, 50px);
            grid-gap: 10px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ffff;
            border-top: none;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            padding: 10px;
        `;
        
        // Create slots
        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.style.cssText = `
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #00ffff;
                border-radius: 5px;
                position: relative;
            `;
            this.inventoryGrid.appendChild(slot);
        }

        inventoryContainer.appendChild(toggleButton);
        inventoryContainer.appendChild(this.inventoryGrid);
        
        // Add crypto display to inventory
        this.cryptoDisplay = document.createElement('div');
        this.cryptoDisplay.id = 'crypto-display';
        this.cryptoDisplay.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ff00;
            border-top: none;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            padding: 10px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
        `;
        
        this.cryptoDisplay.innerHTML = `
            <div style="color: #00ff00; margin-bottom: 5px;">CRYPTO</div>
            <div id="crypto-count">0</div>
        `;
        
        inventoryContainer.appendChild(this.cryptoDisplay);
        this.container.appendChild(inventoryContainer);
    }

    showDialogue(message, speakerName) {
        this.dialogueBox.innerHTML = `
            <div style="margin-bottom: 10px; color: #00ff00; font-weight: bold;">
                ${speakerName}:
            </div>
            <div style="line-height: 1.5;">
                ${message}
            </div>
            <div style="margin-top: 15px; text-align: right;">
                <button onclick="window.uiManager.closeDialogue()" style="
                    background: #00ff00;
                    border: none;
                    border-radius: 5px;
                    padding: 8px 16px;
                    color: black;
                    cursor: pointer;
                ">Close</button>
            </div>
        `;
        
        this.dialogueBox.style.display = 'block';
    }

    showDialogueOptions(topics, callback) {
        const optionsHtml = topics.map(topic => `
            <button onclick="window.uiManager.selectDialogueOption('${topic.id}')" style="
                display: block;
                width: 100%;
                margin: 5px 0;
                background: #0066ff;
                border: none;
                border-radius: 5px;
                padding: 10px;
                color: white;
                cursor: pointer;
                text-align: left;
            ">${topic.text}</button>
        `).join('');
        
        this.dialogueBox.innerHTML += `
            <div style="margin-top: 15px;">
                <div style="margin-bottom: 10px; color: #00ff00;">Choose an option:</div>
                ${optionsHtml}
            </div>
        `;
        
        // Store callback for option selection
        this.dialogueCallback = callback;
    }

    // New method: Show quest accept/decline options
    showQuestAcceptDeclineOptions(quest, options, callback) {
        const questInfoHtml = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 170, 0, 0.2); border-radius: 5px;">
                <div style="font-weight: bold; color: #ffaa00; margin-bottom: 5px;">${quest.title}</div>
                <div style="margin: 5px 0; font-size: 0.9em;">${quest.description}</div>
                <div style="font-size: 0.8em; color: #aaa;">Reward: ${quest.reward.crypto} crypto</div>
            </div>
        `;
        
        const optionsHtml = options.map(option => `
            <button onclick="window.uiManager.selectQuestOption('${option.id}')" style="
                display: block;
                width: 100%;
                margin: 5px 0;
                border: none;
                border-radius: 5px;
                padding: 10px;
                color: white;
                cursor: pointer;
                text-align: center;
                font-weight: bold;
                ${option.style || 'background: #0066ff;'}
            ">${option.text}</button>
        `).join('');
        
        this.dialogueBox.innerHTML += `
            <div style="margin-top: 15px;">
                ${questInfoHtml}
                <div style="margin-bottom: 10px; color: #ffaa00; font-weight: bold;">Would you like to accept this quest?</div>
                ${optionsHtml}
            </div>
        `;
        
        // Store callback for quest option selection
        this.questCallback = callback;
    }

    selectDialogueOption(topicId) {
        if (this.dialogueCallback) {
            this.dialogueCallback(topicId);
        }
    }

    // New method: Select quest accept/decline option
    selectQuestOption(optionId) {
        if (this.questCallback) {
            this.questCallback(optionId);
            // Clear the quest callback after use
            this.questCallback = null;
        }
    }

    // New method: Select quest turn-in option
    selectQuestTurnInOption(optionId) {
        if (window.dialogueManager && window.dialogueManager.questTurnInCallback) {
            window.dialogueManager.questTurnInCallback(optionId);
            // Clear the quest turn-in callback after use
            window.dialogueManager.questTurnInCallback = null;
        }
    }

    // New method: Show quest turn-in options
    showQuestTurnInOptions(quest) {
        const questInfoHtml = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(0, 255, 0, 0.2); border-radius: 5px;">
                <div style="font-weight: bold; color: #00ff00; margin-bottom: 5px;">✓ ${quest.title}</div>
                <div style="margin: 5px 0; font-size: 0.9em;">${quest.description}</div>
                <div style="font-size: 0.8em; color: #00ff00;">Reward: ${quest.reward.crypto} crypto</div>
            </div>
        `;
        
        const turnInButton = `
            <button onclick="window.uiManager.selectQuestTurnInOption('turn_in')" style="
                display: block;
                width: 100%;
                margin: 5px 0;
                border: none;
                border-radius: 5px;
                padding: 10px;
                color: white;
                cursor: pointer;
                text-align: center;
                font-weight: bold;
                background: #00aa00;
            ">Turn In Quest</button>
        `;
        
        this.dialogueBox.innerHTML += `
            <div style="margin-top: 15px;">
                ${questInfoHtml}
                <div style="margin-bottom: 10px; color: #00ff00; font-weight: bold;">Quest completed! Ready to turn in?</div>
                ${turnInButton}
            </div>
        `;
    }

    hideDialogue() {
        this.dialogueBox.style.display = 'none';
        this.dialogueCallback = null;
    }

    toggleQuestLog() {
        if (this.questLog.style.display === 'none' || !this.questLog.style.display) {
            this.questLog.style.display = 'block';
        } else {
            this.questLog.style.display = 'none';
        }
    }

    addQuest(quest) {
        const questElement = document.createElement('div');
        
        // Check if quest is completed and ready to turn in
        const isCompleted = quest.completed || false;
        
        questElement.style.cssText = `
            margin-bottom: 15px;
            padding: 10px;
            background: ${isCompleted ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 170, 0, 0.2)'};
            border-radius: 5px;
            border: ${isCompleted ? '2px solid #00ff00' : 'none'};
        `;
        
        const statusText = isCompleted ? '✓ Ready to Turn In' : '● In Progress';
        const statusColor = isCompleted ? '#00ff00' : '#ffaa00';
        
        questElement.innerHTML = `
            <div style="font-weight: bold; color: ${statusColor}; display: flex; justify-content: space-between; align-items: center;">
                <span>${quest.title}</span>
                <span style="font-size: 0.8em;">${statusText}</span>
            </div>
            <div style="margin: 5px 0; font-size: 0.9em;">${quest.description}</div>
            <div style="font-size: 0.8em; color: #aaa;">Reward: ${quest.reward.crypto} crypto</div>
            ${isCompleted ? `<div style="font-size: 0.8em; color: #00ff00; margin-top: 5px;">Return to ${quest.giverName} to turn in!</div>` : ''}
        `;
        
        this.questLog.appendChild(questElement);
        this.questLog.style.display = 'block';
    }

    updateQuestLog(activeQuests) {
        // Clear existing quests
        this.questLog.innerHTML = '';
        
        // Add active quests
        activeQuests.forEach(quest => {
            this.addQuest(quest);
        });
        
        if (activeQuests.length === 0) {
            this.questLog.innerHTML = '<div style="color: #aaa; text-align: center; padding: 20px;">No active quests</div>';
        }
    }

    showMessage(message, duration = 3000) {
        this.messageQueue.push({ message, duration });
        this.processMessageQueue();
    }

    processMessageQueue() {
        if (this.isShowingMessage || this.messageQueue.length === 0) {
            return;
        }
        
        this.isShowingMessage = true;
        const { message, duration } = this.messageQueue.shift();
        
        this.messageContainer.textContent = message;
        this.messageContainer.style.display = 'block';
        
        setTimeout(() => {
            this.messageContainer.style.display = 'none';
            this.isShowingMessage = false;
            this.processMessageQueue();
        }, duration);
    }

    closeDialogue() {
        this.hideDialogue();
    }

    showCustomInput(callback, placeholder = "Enter your message here...") {
        this.customInputContainer.innerHTML = `
            <div style="margin-bottom: 5px; color: #0066ff; font-weight: bold; font-size: 14px;">
                Type your message:
            </div>
            <div style="margin-bottom: 5px; color: #ffaa00; font-size: 11px;">
                ⚠️ Press Enter to send, Escape to cancel.
            </div>
            <textarea id="custom-message-input" placeholder="${placeholder}" style="
                width: 100%;
                height: 50px;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid #0066ff;
                border-radius: 5px;
                padding: 8px;
                color: white;
                font-family: 'Courier New', monospace;
                resize: none;
                margin-bottom: 8px;
                font-size: 14px;
            "></textarea>
            <div style="text-align: right;">
                <button onclick="window.uiManager.sendCustomMessage()" style="
                    background: #0066ff;
                    border: none;
                    border-radius: 5px;
                    padding: 6px 12px;
                    color: white;
                    cursor: pointer;
                    margin-right: 8px;
                    font-size: 12px;
                ">Send</button>
                <button onclick="window.uiManager.cancelCustomInput()" style="
                    background: #666;
                    border: none;
                    border-radius: 5px;
                    padding: 6px 12px;
                    color: white;
                    cursor: pointer;
                    font-size: 12px;
                ">Cancel</button>
            </div>
        `;
        
        this.customInputContainer.style.display = 'block';
        this.customInputCallback = callback;
        
        // Focus on the input
        setTimeout(() => {
            const input = document.getElementById('custom-message-input');
            if (input) input.focus();
        }, 100);
        
        // Add enter key support and disable other inputs
        document.addEventListener('keydown', this.handleCustomInputKeydown, true);
        
        // Disable game input while typing
        this.disableGameInput();
    }

    handleCustomInputKeydown = (e) => {
        // Prevent all other keyboard events while typing
        e.stopPropagation();
        
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendCustomMessage();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.cancelCustomInput();
        }
        // Allow all other keys to pass through to the textarea
    }

    disableGameInput() {
        // Store the current game scene reference
        if (window.gameScene && window.gameScene.keys) {
            this.previousGameKeys = window.gameScene.keys;
            // Disable all game keys
            Object.keys(window.gameScene.keys).forEach(key => {
                if (window.gameScene.keys[key] && typeof window.gameScene.keys[key].enabled !== 'undefined') {
                    window.gameScene.keys[key].enabled = false;
                }
            });
        }
        
        // Disable Phaser input system entirely
        if (window.gameScene && window.gameScene.input) {
            this.previousInputEnabled = window.gameScene.input.enabled;
            window.gameScene.input.enabled = false;
        }
    }

    enableGameInput() {
        // Re-enable game keys
        if (this.previousGameKeys && window.gameScene && window.gameScene.keys) {
            Object.keys(window.gameScene.keys).forEach(key => {
                if (window.gameScene.keys[key] && typeof window.gameScene.keys[key].enabled !== 'undefined') {
                    window.gameScene.keys[key].enabled = true;
                }
            });
        }
        
        // Re-enable Phaser input system
        if (window.gameScene && window.gameScene.input && this.previousInputEnabled !== undefined) {
            window.gameScene.input.enabled = this.previousInputEnabled;
        }
    }

    sendCustomMessage() {
        const input = document.getElementById('custom-message-input');
        const message = input.value.trim();
        
        if (message && this.customInputCallback) {
            this.customInputCallback(message);
            this.hideCustomInput();
        }
    }

    cancelCustomInput() {
        this.hideCustomInput();
    }

    hideCustomInput() {
        this.customInputContainer.style.display = 'none';
        this.customInputCallback = null;
        document.removeEventListener('keydown', this.handleCustomInputKeydown, true);
        
        // Re-enable game input
        this.enableGameInput();
    }

    showLogViewer() {
        // Create log viewer container
        const logViewer = document.createElement('div');
        logViewer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 70%;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #0066ff;
            border-radius: 10px;
            padding: 20px;
            color: white;
            font-family: 'Courier New', monospace;
            z-index: 2000;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;
        
        logViewer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #0066ff;">Recent Model Interactions</h3>
                <div>
                    <button onclick="window.uiManager.clearLogs()" style="
                        background: #ff4444;
                        border: none;
                        border-radius: 5px;
                        padding: 5px 10px;
                        color: white;
                        cursor: pointer;
                        margin-right: 10px;
                    ">Clear Logs</button>
                    <button onclick="window.uiManager.closeLogViewer()" style="
                        background: #666;
                        border: none;
                        border-radius: 5px;
                        padding: 5px 10px;
                        color: white;
                        cursor: pointer;
                    ">Close</button>
                </div>
            </div>
            <div id="log-content" style="
                flex: 1;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
                border-radius: 5px;
                padding: 10px;
                font-size: 12px;
                line-height: 1.4;
            ">Loading logs...</div>
        `;
        
        this.container.appendChild(logViewer);
        this.logViewer = logViewer;
        
        // Load logs
        this.loadLogs();
    }

    async loadLogs() {
        try {
            const response = await fetch('http://localhost:5000/api/logs');
            const data = await response.json();
            
            if (data.success) {
                const logContent = document.getElementById('log-content');
                logContent.innerHTML = data.logs.map(line => 
                    `<div style="margin-bottom: 2px;">${line}</div>`
                ).join('');
                logContent.scrollTop = logContent.scrollHeight; // Scroll to bottom
            } else {
                document.getElementById('log-content').innerHTML = 'No logs found';
            }
        } catch (error) {
            document.getElementById('log-content').innerHTML = 'Error loading logs: ' + error.message;
        }
    }

    async clearLogs() {
        if (confirm('Are you sure you want to clear all logs?')) {
            try {
                const response = await fetch('http://localhost:5000/api/logs/clear', {
                    method: 'POST'
                });
                const data = await response.json();
                
                if (data.success) {
                    this.loadLogs(); // Reload logs
                } else {
                    alert('Error clearing logs: ' + data.message);
                }
            } catch (error) {
                alert('Error clearing logs: ' + error.message);
            }
        }
    }

    closeLogViewer() {
        if (this.logViewer) {
            this.logViewer.remove();
            this.logViewer = null;
        }
    }

    showTooltip(text, elementOrX, y) {
        this.tooltip.textContent = text;
        this.tooltip.style.display = 'block';

        let targetX, targetY, targetWidth = 0, targetHeight = 0;

        if (typeof elementOrX === 'object' && elementOrX !== null && typeof elementOrX.getBoundingClientRect === 'function') {
            // It's a DOM element
            const rect = elementOrX.getBoundingClientRect();
            targetX = rect.left;
            targetY = rect.top;
            targetWidth = rect.width;
            targetHeight = rect.height;
        } else if (typeof elementOrX === 'object' && elementOrX !== null && typeof elementOrX.getBounds === 'function') {
            // It's a Phaser sprite
            const bounds = elementOrX.getBounds();
            targetX = bounds.x - this.scene.cameras.main.scrollX;
            targetY = bounds.y - this.scene.cameras.main.scrollY;
            targetWidth = bounds.width;
            targetHeight = bounds.height;
        } else {
            // It's raw coordinates
            targetX = elementOrX;
            targetY = y;
        }

        const tooltipRect = this.tooltip.getBoundingClientRect();
        const xPos = targetX + (targetWidth / 2) - (tooltipRect.width / 2);
        const yPos = targetY - tooltipRect.height - 5;

        this.tooltip.style.left = `${xPos}px`;
        this.tooltip.style.top = `${yPos}px`;
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    toggleInventory() {
        if (this.inventoryGrid) {
            const currentDisplay = this.inventoryGrid.style.display;
            this.inventoryGrid.style.display = currentDisplay === 'grid' ? 'none' : 'grid';
        }
    }

    updateInventory(items) {
        const slots = this.inventoryGrid.children;
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const item = items[i];

            const newSlot = slot.cloneNode(false);
            slot.parentNode.replaceChild(newSlot, slot);

            if (item) {
                const itemSprite = document.createElement('img');
                itemSprite.src = `/assets/kenney_sci-fi-rts/PNG/Default size/Environment/${item.spriteKey}.png`;
                itemSprite.style.width = '100%';
                itemSprite.style.height = '100%';
                newSlot.appendChild(itemSprite);

                if (item.quantity > 1) {
                    const quantityText = document.createElement('div');
                    quantityText.textContent = item.quantity;
                    quantityText.style.cssText = `
                        position: absolute;
                        bottom: 2px;
                        right: 2px;
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        font-size: 10px;
                        padding: 1px 3px;
                        border-radius: 3px;
                    `;
                    newSlot.appendChild(quantityText);
                }

                newSlot.addEventListener('mouseover', () => {
                    this.showTooltip(item.itemName, newSlot);
                });
                newSlot.addEventListener('mouseout', () => {
                    this.hideTooltip();
                });
            }
        }
    }

    onDragMove(e) {
        if (this.isDragging && this.draggedElement) {
            const parentRect = this.draggedElement.offsetParent.getBoundingClientRect();
            const newLeft = e.clientX - this.dragOffsetX;
            const newTop = e.clientY - this.dragOffsetY;
            
            this.draggedElement.style.left = `${newLeft - parentRect.left}px`;
            this.draggedElement.style.top = `${newTop - parentRect.top}px`;
        }
    }

    onDragEnd() {
        if (this.isDragging) {
            this.isDragging = false;
            this.draggedElement = null;
        }
    }

    updateCryptoDisplay(count) {
        const cryptoCount = document.getElementById('crypto-count');
        if (cryptoCount) {
            cryptoCount.textContent = count;
        }
    }
} 