/**
 * UI Components Module
 * @module components
 * @created 2025-02-28 11:06:27 UTC
 * @author slayer587
 */

class UIComponents {
    /**
     * Initialize UI components
     */
    init() {
        this.setupToasts();
        this.setupDialogs();
        this.setupDrawer();
        this.setupThemeToggle();
    }

    /**
     * Setup toast notification system
     */
    setupToasts() {
        this.showToast = (message, type = 'info') => {
            Toastify({
                text: message,
                duration: 3000,
                gravity: 'bottom',
                position: 'right',
                className: `toast-${type}`,
                style: {
                    background: type === 'error' ? 'var(--color-error)' :
                               type === 'success' ? 'var(--color-success)' :
                               type === 'warning' ? 'var(--color-warning)' :
                               'var(--color-accent)'
                }
            }).showToast();
        };
    }

    /**
     * Setup dialog components
     */
    setupDialogs() {
        // Settings dialog
        const settingsDialog = document.getElementById('settingsDialog');
        const settingsForm = document.getElementById('settingsForm');

        document.getElementById('settings').addEventListener('click', () => {
            settingsDialog.showModal();
        });

        settingsDialog.querySelectorAll('[data-close]').forEach(button => {
            button.addEventListener('click', () => {
                settingsDialog.close();
            });
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            const settings = {
                theme: document.getElementById('theme').value,
                fontSize: document.getElementById('fontSize').value,
                autoSaveInterval: parseInt(document.getElementById('autoSaveInterval').value),
                livePreview: document.getElementById('livePreview').checked
            };

            storageManager.saveSettings(settings);
            this.showToast('Settings saved successfully', 'success');
            settingsDialog.close();
        });
    }

    /**
     * Setup side drawer functionality
     */
    setupDrawer() {
        const drawer = document.getElementById('sideDrawer');
        const toggleBtn = document.getElementById('menuToggle');
        const pinBtn = document.getElementById('pinDrawer');

        toggleBtn.addEventListener('click', () => {
            drawer.classList.toggle('open');
        });

        pinBtn.addEventListener('click', () => {
            drawer.classList.toggle('pinned');
            pinBtn.classList.toggle('active');
        });

        // Auto-hide drawer when not pinned
        document.addEventListener('click', (e) => {
            if (!drawer.classList.contains('pinned') &&
                !drawer.contains(e.target) &&
                e.target !== toggleBtn) {
                drawer.classList.remove('open');
            }
        });
    }

    /**
     * Setup theme toggle functionality
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.dataset.theme;
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.dataset.theme = newTheme;
            storageManager.saveSettings({ theme: newTheme });
            
            EventManager.emit(EVENTS.THEME_CHANGE, newTheme);
        });
    }

    /**
     * Create a document list item
     * @param {Object} doc - Document object
     * @returns {HTMLElement} List item element
     */
    createDocumentListItem(doc) {
        const li = document.createElement('div');
        li.className = 'document-item';
        li.innerHTML = `
            <div class="document-info">
                <h3 class="document-title">${doc.title}</h3>
                <span class="document-date">
                    ${new Date(doc.lastModified).toLocaleString()}
                </span>
            </div>
            <div class="document-actions">
                <button class="icon-btn" title="Edit" data-action="edit">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="icon-btn" title="Delete" data-action="delete">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
        `;

        // Add event listeners
        li.querySelector('[data-action="edit"]').addEventListener('click', () => {
            EventManager.emit(EVENTS.DOCUMENT_LOAD, doc);
        });

        li.querySelector('[data-action="delete"]').addEventListener('click', () => {
            this.confirmDelete(doc);
        });

        return li;
    }

    /**
     * Show delete confirmation dialog
     * @param {Object} doc - Document to delete
     */
    confirmDelete(doc) {
        const dialog = document.createElement('dialog');
        dialog.className = 'dialog';
        dialog.innerHTML = `
            <div class="dialog-header">
                <h2>Confirm Delete</h2>
                <button class="icon-btn" data-close>×</button>
            </div>
            <div class="dialog-content">
                <p>Are you sure you want to delete "${doc.title}"?</p>
                <p class="text-warning">This action cannot be undone.</p>
            </div>
            <div class="dialog-footer">
                <button class="btn" data-close>Cancel</button>
                <button class="btn danger" data-confirm>Delete</button>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('[data-close]').addEventListener('click', () => {
            dialog.close();
            dialog.remove();
        });

        dialog.querySelector('[data-confirm]').addEventListener('click', () => {
            EventManager.emit(EVENTS.DOCUMENT_DELETE, doc);
            dialog.close();
            dialog.remove();
        });

        dialog.showModal();
    }
}

const uiComponents = new UIComponents();