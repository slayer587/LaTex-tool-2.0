/**
 * Main Application Module
 * @module app
 * @created 2025-02-28 11:24:54 UTC
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
            sidebar.init(); // Initialize sidebar

            // Setup event listeners
            this.setupEventListeners();
            this.setupButtonHandlers(); // Add button handlers

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
     * Setup button handlers
     */
    setupButtonHandlers() {
        // Menu toggle button
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.toggle();
            });
        }

        // New file button
        const newFile = document.getElementById('newFile');
        if (newFile) {
            newFile.addEventListener('click', () => {
                this.newDocument();
            });
        }

        // Save file button
        const saveFile = document.getElementById('saveFile');
        if (saveFile) {
            saveFile.addEventListener('click', () => {
                EventManager.emit(EVENTS.DOCUMENT_SAVE, { type: 'manual' });
            });
        }

        // Download PDF button
        const downloadPDF = document.getElementById('downloadPDF');
        if (downloadPDF) {
            downloadPDF.addEventListener('click', async () => {
                const content = document.getElementById('preview').innerHTML;
                const filename = this.getCurrentDocumentTitle() || 'document';
                
                try {
                    await fileSystem.exportPDF(content, filename);
                    uiComponents.showToast('PDF exported successfully', 'success');
                } catch (error) {
                    uiComponents.showToast('Failed to export PDF', 'error');
                }
            });
        }

        // Copy output button
        const copyOutput = document.getElementById('copyOutput');
        if (copyOutput) {
            copyOutput.addEventListener('click', () => {
                const content = document.getElementById('preview').textContent;
                navigator.clipboard.writeText(content)
                    .then(() => uiComponents.showToast('Content copied to clipboard', 'success'))
                    .catch(() => uiComponents.showToast('Failed to copy content', 'error'));
            });
        }

        // Editor toolbar buttons
        const editorToolbar = document.querySelector('.editor-toolbar');
        if (editorToolbar) {
            editorToolbar.addEventListener('click', (e) => {
                const button = e.target.closest('[data-command]');
                if (button) {
                    const command = button.dataset.command;
                    editorUI.executeCommand(command);
                }
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                const dialog = document.getElementById('settingsDialog');
                if (dialog) {
                    dialog.showModal();
                }
            });
        }

        // Theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.dataset.theme;
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.dataset.theme = newTheme;
                localStorage.setItem('theme', newTheme);
                EventManager.emit(EVENTS.THEME_CHANGE, newTheme);
            });
        }
    }

    /**
     * Get current document title
     * @returns {string} Document title or default name
     */
    getCurrentDocumentTitle() {
        return storageManager.currentDocument?.title || 'Untitled Document';
    }

    // ... (rest of the existing code remains the same)
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new LatexEditor();
    app.init();
});
