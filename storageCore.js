/**
 * Storage Core Module
 * @module storageCore
 * @created 2025-02-28 11:05:10 UTC
 * @author slayer587
 */

class StorageManager {
    constructor() {
        this.currentDocument = null;
        this.autoSaveTimer = null;
    }

    /**
     * Initialize storage system
     */
    async init() {
        try {
            // Load user settings
            this.loadSettings();
            
            // Restore last session
            await this.restoreSession();
            
            // Start auto-save
            this.setupAutoSave();
        } catch (error) {
            EventManager.emit(EVENTS.ERROR, {
                type: 'storage',
                message: 'Failed to initialize storage',
                error
            });
        }
    }

    /**
     * Load user settings from localStorage
     */
    loadSettings() {
        const stored = localStorage.getItem(CONFIG.storageKeys.settings);
        const settings = stored ? JSON.parse(stored) : CONFIG.defaults;
        
        // Apply settings
        document.documentElement.dataset.theme = settings.theme;
        document.getElementById('editor').style.fontSize = `${settings.fontSize}px`;
        
        EventManager.emit(EVENTS.SETTINGS_CHANGE, settings);
    }

    /**
     * Save user settings to localStorage
     * @param {Object} settings - User settings
     */
    saveSettings(settings) {
        localStorage.setItem(
            CONFIG.storageKeys.settings,
            JSON.stringify({ ...CONFIG.defaults, ...settings })
        );
    }

    /**
     * Restore last session
     */
    async restoreSession() {
        const lastDoc = localStorage.getItem(CONFIG.storageKeys.currentDoc);
        if (lastDoc) {
            try {
                const doc = JSON.parse(lastDoc);
                await this.loadDocument(doc);
            } catch (error) {
                console.warn('Failed to restore last session:', error);
            }
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        const settings = JSON.parse(
            localStorage.getItem(CONFIG.storageKeys.settings)
        ) || CONFIG.defaults;

        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, settings.autoSaveInterval * 1000);
    }

    /**
     * Auto-save current document
     */
    async autoSave() {
        if (!this.currentDocument) return;

        const content = document.getElementById('editor').value;
        if (content === this.currentDocument.content) return;

        try {
            await this.saveDocument({
                ...this.currentDocument,
                content,
                lastModified: new Date().toISOString()
            });
            
            EventManager.emit(EVENTS.DOCUMENT_SAVE, {
                type: 'auto',
                success: true
            });
        } catch (error) {
            EventManager.emit(EVENTS.ERROR, {
                type: 'autoSave',
                message: 'Auto-save failed',
                error
            });
        }
    }

    /**
     * Save document
     * @param {Object} document - Document to save
     */
    async saveDocument(document) {
        try {
            // Update current document
            this.currentDocument = document;
            
            // Save to localStorage
            localStorage.setItem(
                CONFIG.storageKeys.currentDoc,
                JSON.stringify(document)
            );

            // Update documents list
            const documents = this.getDocumentsList();
            const index = documents.findIndex(doc => doc.id === document.id);
            
            if (index >= 0) {
                documents[index] = document;
            } else {
                documents.push(document);
            }

            localStorage.setItem(
                CONFIG.storageKeys.documents,
                JSON.stringify(documents)
            );

            EventManager.emit(EVENTS.DOCUMENT_SAVE, {
                type: 'manual',
                success: true
            });
        } catch (error) {
            throw new Error('Failed to save document: ' + error.message);
        }
    }

    /**
     * Get list of saved documents
     * @returns {Array} List of documents
     */
    getDocumentsList() {
        const stored = localStorage.getItem(CONFIG.storageKeys.documents);
        return stored ? JSON.parse(stored) : [];
    }
}

const storageManager = new StorageManager();