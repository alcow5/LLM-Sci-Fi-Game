export class InventoryManager {
    constructor() {
        this.slots = 16; // 4x4 grid
        this.items = new Array(this.slots).fill(null);
        this.maxStack = 99;
        this.cryptoBalance = 0;
    }

    addItem(item) {
        // Check for existing stack
        for (let i = 0; i < this.slots; i++) {
            const slot = this.items[i];
            if (slot && slot.itemId === item.itemId && slot.quantity < this.maxStack) {
                slot.quantity++;
                this.updateUI();
                return true;
            }
        }
        
        // Add to new slot
        const emptySlot = this.items.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            this.items[emptySlot] = { ...item, quantity: 1 };
            this.updateUI();
            return true;
        }

        console.log("Inventory is full.");
        return false;
    }

    addCrypto(amount) {
        this.cryptoBalance += amount;
        this.updateUI();
        console.log(`Earned ${amount} crypto! Total: ${this.cryptoBalance}`);
    }

    removeItems(itemId, quantity) {
        let remainingToRemove = quantity;
        
        for (let i = 0; i < this.slots && remainingToRemove > 0; i++) {
            const slot = this.items[i];
            if (slot && slot.itemId === itemId) {
                if (slot.quantity <= remainingToRemove) {
                    remainingToRemove -= slot.quantity;
                    this.items[i] = null;
                } else {
                    slot.quantity -= remainingToRemove;
                    remainingToRemove = 0;
                }
            }
        }
        
        this.updateUI();
        return remainingToRemove === 0;
    }
    
    getItems() {
        return this.items;
    }

    getCryptoCount() {
        return this.cryptoBalance;
    }

    getCrypto() {
        return this.cryptoBalance;
    }

    updateUI() {
        if (window.uiManager) {
            window.uiManager.updateInventory(this.items);
            window.uiManager.updateCryptoDisplay(this.getCryptoCount());
        }
    }
} 