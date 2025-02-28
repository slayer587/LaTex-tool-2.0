/**
 * Main Application Module
 * @module app
 * @created 2025-02-28 11:38:45 UTC
 * @author slayer587
 */

class LatexEditor {
    constructor() {
        this.initialized = false;
        this.editor = null;
        this.preview = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        try {
            // Cache DOM elements
            this.editor = document.getElementById('editor');
            this.preview = document.getElementById('preview');

            // Initialize components in correct order
            await this.initializeComponents();
            
            // Setup all event handlers
            this.setupButtonHandlers();
            this.setupEventListeners();

            // Mark as initialized
            this.initialized = true;

            console.log('LaTeX Editor initialized successfully');
            uiComponents.showToast('Welcome to LaTeX Editor Pro', 'info');
        } catch (error) {
            console.error('Initialization error:', error);
            uiComponents.showToast('Failed to initialize application', 'error');
        }
    }

    /**
     * Initialize all components in correct order
     */
    async initializeComponents() {
        // 1. Initialize renderer first (MathJax dependency)
        if (typeof renderer !== 'undefined') {
            await renderer.init();
            console.log('Renderer initialized');
        }

        // 2. Initialize storage manager
        if (typeof storageManager !== 'undefined') {
            await storageManager.init();
            console.log('Storage manager initialized');
        }

        // 3. Initialize UI components
        if (typeof uiComponents !== 'undefined') {
            uiComponents.init();
            console.log('UI components initialized');
        }

        // 4. Initialize editor UI
        if (typeof editorUI !== 'undefined') {
            editorUI.init();
            console.log('Editor UI initialized');
        }

        // 5. Initialize sidebar
        if (typeof sidebar !== 'undefined') {
            sidebar.init();
            console.log('Sidebar initialized');
        }
    }

    /**
     * Setup all button handlers
     */
    setupButtonHandlers() {
        // Menu toggle
        this.setupButton('menuToggle', () => sidebar.toggle());

        // File operations
        this.setupButton('newFile', () => this.newDocument());
        this.setupButton('saveFile', () => this.saveDocument());
        
        // Output operations
        this.setupButton('copyOutput', () => this.copyOutput());
        this.setupButton('downloadPDF', () => this.exportToPDF());
        
        // Settings and theme
        this.setupButton('settings', () => this.openSettings());
        this.setupButton('themeToggle', () => this.toggleTheme());

        // Editor toolbar
        this.setupEditorToolbar();

        console.log('Button handlers setup completed');
    }

    /**
     * Helper function to safely setup button click handlers
     */
    setupButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                handler();
            });
            console.log(`Handler setup for button: ${id}`);
        } else {
            console.warn(`Button not found: ${id}`);
        }
    }

    /**
     * Setup editor toolbar buttons
     */
    setupEditorToolbar() {
        const toolbar = document.querySelector('.editor-toolbar');
        if (toolbar) {
            toolbar.addEventListener('click', (e) => {
                const button = e.target.closest('[data-command]');
                if (button) {
                    e.preventDefault();
                    const command = button.dataset.command;
                    editorUI.executeCommand(command);
                }
            });
            console.log('Editor toolbar setup completed');
        }
    }

    /**
     * Document operations
     */
    newDocument() {
        if (this.editor.value.trim()) {
            if (confirm('Do you want to save the current document first?')) {
                this.saveDocument().then(() => {
                    this.editor.value = '';
                    renderer.processContent('');
                });
            } else {
                this.editor.value = '';
                renderer.processContent('');
            }
        } else {
            this.editor.value = '';
            renderer.processContent('');
        }
    }

    async saveDocument() {
        try {
            await EventManager.emit(EVENTS.DOCUMENT_SAVE, { type: 'manual' });
            uiComponents.showToast('Document saved successfully', 'success');
        } catch (error) {
            uiComponents.showToast('Failed to save document', 'error');
        }
    }

    /**
     * Output operations
     */
    async copyOutput() {
        try {
            const content = this.preview.textContent;
            await navigator.clipboard.writeText(content);
            uiComponents.showToast('Content copied to clipboard', 'success');
        } catch (error) {
            uiComponents.showToast('Failed to copy content', 'error');
        }
    }

    async exportToPDF() {
        try {
            const content = this.preview.innerHTML;
            const filename = storageManager.currentDocument?.title || 'document';
            await fileSystem.exportPDF(content, filename);
            uiComponents.showToast('PDF exported successfully', 'success');
        } catch (error) {
            uiComponents.showToast('Failed to export PDF', 'error');
        }
    }

    /**
     * Settings and theme operations
     */
    openSettings() {
        const dialog = document.getElementById('settingsDialog');
        if (dialog) {
            dialog.showModal();
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        EventManager.emit(EVENTS.THEME_CHANGE, newTheme);
    }

    /**
     * Setup application event listeners
     */
    setupEventListeners() {
        // Document events
        EventManager.subscribe(EVENTS.DOCUMENT_SAVE, () => {
            this.updateUI();
        });

        EventManager.subscribe(EVENTS.DOCUMENT_LOAD, (doc) => {
            this.loadDocument(doc);
        });

        // Error handling
        EventManager.subscribe(EVENTS.ERROR, (error) => {
            console.error('Application error:', error);
            uiComponents.showToast(error.message, 'error');
        });

        // Settings changes
        EventManager.subscribe(EVENTS.SETTINGS_CHANGE, (settings) => {
            this.applySettings(settings);
        });

        console.log('Event listeners setup completed');
    }

    /**
     * Update UI state
     */
    updateUI() {
        const hasContent = this.editor.value.trim().length > 0;
        document.getElementById('saveFile').disabled = !hasContent;
        document.getElementById('copyOutput').disabled = !hasContent;
        document.getElementById('downloadPDF').disabled = !hasContent;
    }

    /**
     * Load document
     */
    loadDocument(doc) {
        if (doc && doc.content) {
            this.editor.value = doc.content;
            renderer.processContent(doc.content);
            this.updateUI();
        }
    }

    /**
     * Apply settings
     */
    applySettings(settings) {
        if (settings.fontSize) {
            this.editor.style.fontSize = `${settings.fontSize}px`;
        }
        if (settings.theme) {
            document.documentElement.dataset.theme = settings.theme;
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    const app = new LatexEditor();
    app.init().catch(error => {
        console.error('Failed to initialize application:', error);
    });
});
