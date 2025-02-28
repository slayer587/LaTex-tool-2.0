/**
 * Main Application Module
 * @module app
 * @created 2025-02-28 11:08:12 UTC
 * @author slayer587
 */

class LatexEditor {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        try {
            // Initialize components
            await renderer.init();
            await storageManager.init();
            uiComponents.init();
            editorUI.init();

            // Setup event listeners
            this.setupEventListeners();

            // Mark as initialized
            this.initialized = true;

            // Show welcome message
            uiComponents.showToast('Welcome to LaTeX Editor Pro', 'info');
        } catch (error) {
            console.error('Initialization error:', error);
            uiComponents.showToast('Failed to initialize application', 'error');
        }
    }

    /**
     * Setup application event listeners
     */
    setupEventListeners() {
        // Document management events
        EventManager.subscribe(EVENTS.DOCUMENT_SAVE, async (event) => {
            const content = editorUI.getContent();
            const timestamp = new Date().toISOString();

            if (!content.trim()) {
                uiComponents.showToast('Cannot save empty document', 'warning');
                return;
            }

            try {
                await storageManager.saveDocument({
                    id: crypto.randomUUID(),
                    title: 'Untitled Document',
                    content,
                    created: timestamp,
                    lastModified: timestamp
                });

                if (event?.type === 'manual') {
                    uiComponents.showToast('Document saved successfully', 'success');
                }
            } catch (error) {
                uiComponents.showToast('Failed to save document', 'error');
            }
        });

        EventManager.subscribe(EVENTS.DOCUMENT_LOAD, async (document) => {
            try {
                editorUI.setContent(document.content);
                uiComponents.showToast('Document loaded successfully', 'success');
            } catch (error) {
                uiComponents.showToast('Failed to load document', 'error');
            }
        });

        // Error handling
        EventManager.subscribe(EVENTS.ERROR, (error) => {
            console.error('Application error:', error);
            uiComponents.showToast(error.message, 'error');
        });

        // Settings changes
        EventManager.subscribe(EVENTS.SETTINGS_CHANGE, (settings) => {
            if (settings.autoSaveInterval) {
                storageManager.setupAutoSave();
            }
        });

        // Setup keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'n':
                        e.preventDefault();
                        this.newDocument();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.importDocument();
                        break;
                }
            }
        });

        // Handle file import
        document.getElementById('importFile')?.addEventListener('click', () => {
            this.importDocument();
        });
    }

    /**
     * Create new document
     */
    newDocument() {
        if (editorUI.getContent().trim()) {
            // Show confirmation dialog
            const dialog = document.createElement('dialog');
            dialog.className = 'dialog';
            dialog.innerHTML = `
                <div class="dialog-header">
                    <h2>Create New Document</h2>
                    <button class="icon-btn" data-close>×</button>
                </div>
                <div class="dialog-content">
                    <p>Do you want to save the current document first?</p>
                </div>
                <div class="dialog-footer">
                    <button class="btn" data-action="discard">Don't Save</button>
                    <button class="btn" data-action="save">Save First</button>
                    <button class="btn primary" data-close>Cancel</button>
                </div>
            `;

            dialog.querySelector('[data-close]').addEventListener('click', () => {
                dialog.close();
                dialog.remove();
            });

            dialog.querySelector('[data-action="save"]').addEventListener('click', async () => {
                await EventManager.emit(EVENTS.DOCUMENT_SAVE, { type: 'manual' });
                editorUI.setContent('');
                dialog.close();
                dialog.remove();
            });

            dialog.querySelector('[data-action="discard"]').addEventListener('click', () => {
                editorUI.setContent('');
                dialog.close();
                dialog.remove();
            });

            document.body.appendChild(dialog);
            dialog.showModal();
        } else {
            editorUI.setContent('');
        }
    }

    /**
     * Import document from file
     */
    async importDocument() {
        const imported = await fileSystem.importFile();
        if (imported) {
            editorUI.setContent(imported.content);
            uiComponents.showToast('Document imported successfully', 'success');
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new LatexEditor();
    app.init();
});