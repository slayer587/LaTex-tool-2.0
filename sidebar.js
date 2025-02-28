/**
 * Sidebar Management Module
 * @module sidebar
 * @created 2025-02-28 11:19:11 UTC
 * @author slayer587
 */

class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sideDrawer');
        this.searchInput = document.getElementById('searchDocs');
        this.sortSelect = document.getElementById('sortDocs');
        this.documentsList = document.getElementById('savedList');
        this.isPinned = localStorage.getItem('sidebar-pinned') === 'true';
    }

    /**
     * Initialize sidebar functionality
     */
    init() {
        this.setupEventListeners();
        this.updatePinnedState();
        this.refreshDocumentsList();
    }

    /**
     * Setup sidebar event listeners
     */
    setupEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', () => {
            this.filterDocuments();
        });

        // Sort functionality
        this.sortSelect.addEventListener('change', () => {
            this.refreshDocumentsList();
        });

        // Pin/unpin functionality
        document.getElementById('pinDrawer').addEventListener('click', () => {
            this.isPinned = !this.isPinned;
            localStorage.setItem('sidebar-pinned', this.isPinned);
            this.updatePinnedState();
        });

        // Auto-hide when clicking outside (if not pinned)
        document.addEventListener('click', (e) => {
            if (!this.isPinned && 
                !this.sidebar.contains(e.target) && 
                !e.target.closest('#menuToggle')) {
                this.sidebar.classList.remove('open');
            }
        });

        // Subscribe to document events
        EventManager.subscribe(EVENTS.DOCUMENT_SAVE, () => {
            this.refreshDocumentsList();
        });

        EventManager.subscribe(EVENTS.DOCUMENT_DELETE, (doc) => {
            this.deleteDocument(doc);
        });
    }

    /**
     * Update sidebar pinned state
     */
    updatePinnedState() {
        if (this.isPinned) {
            this.sidebar.classList.add('pinned', 'open');
            document.getElementById('pinDrawer').classList.add('active');
        } else {
            this.sidebar.classList.remove('pinned');
            document.getElementById('pinDrawer').classList.remove('active');
        }
    }

    /**
     * Refresh documents list
     */
    async refreshDocumentsList() {
        const documents = storageManager.getDocumentsList();
        this.renderDocumentsList(this.sortDocuments(documents));
    }

    /**
     * Sort documents based on selected criteria
     * @param {Array} documents - List of documents to sort
     * @returns {Array} Sorted documents
     */
    sortDocuments(documents) {
        const sortBy = this.sortSelect.value;
        
        return documents.sort((a, b) => {
            switch (sortBy) {
                case 'modified':
                    return new Date(b.lastModified) - new Date(a.lastModified);
                case 'created':
                    return new Date(b.created) - new Date(a.created);
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }

    /**
     * Filter documents based on search input
     */
    filterDocuments() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const documents = storageManager.getDocumentsList();
        
        const filtered = documents.filter(doc => 
            doc.title.toLowerCase().includes(searchTerm) ||
            doc.content.toLowerCase().includes(searchTerm)
        );

        this.renderDocumentsList(this.sortDocuments(filtered));
    }

    /**
     * Render documents list
     * @param {Array} documents - List of documents to render
     */
    renderDocumentsList(documents) {
        this.documentsList.innerHTML = '';

        if (documents.length === 0) {
            this.documentsList.innerHTML = `
                <div class="empty-state">
                    <p class="text-muted">No documents found</p>
                </div>
            `;
            return;
        }

        documents.forEach(doc => {
            const item = uiComponents.createDocumentListItem(doc);
            this.documentsList.appendChild(item);
        });
    }

    /**
     * Delete document
     * @param {Object} doc - Document to delete
     */
    async deleteDocument(doc) {
        try {
            const documents = storageManager.getDocumentsList();
            const updatedDocs = documents.filter(d => d.id !== doc.id);
            
            localStorage.setItem(
                CONFIG.storageKeys.documents,
                JSON.stringify(updatedDocs)
            );

            if (doc.filename) {
                await fileSystem.deleteFile(doc.filename);
            }

            this.refreshDocumentsList();
            uiComponents.showToast('Document deleted successfully', 'success');
        } catch (error) {
            console.error('Delete error:', error);
            uiComponents.showToast('Failed to delete document', 'error');
        }
    }

    /**
     * Toggle sidebar visibility
     */
    toggle() {
        this.sidebar.classList.toggle('open');
    }

    /**
     * Show sidebar
     */
    show() {
        this.sidebar.classList.add('open');
    }

    /**
     * Hide sidebar
     */
    hide() {
        if (!this.isPinned) {
            this.sidebar.classList.remove('open');
        }
    }
}

const sidebar = new Sidebar();