/**
 * Editor UI Module
 * @module editor
 * @created 2025-02-28 11:06:27 UTC
 * @author slayer587
 */

class EditorUI {
    constructor() {
        this.editor = document.getElementById('editor');
        this.editorToolbar = document.querySelector('.editor-toolbar');
        this.preview = document.getElementById('preview');
        this.lastContent = '';
    }

    /**
     * Initialize editor functionality
     */
    init() {
        this.setupEditorEvents();
        this.setupToolbarActions();
        this.setupKeyboardShortcuts();
        this.setupClipboard();
    }

    /**
     * Setup editor events
     */
    setupEditorEvents() {
        let updateTimeout;

        this.editor.addEventListener('input', () => {
            const content = this.editor.value;
            
            // Skip if content hasn't changed
            if (content === this.lastContent) return;
            this.lastContent = content;

            // Debounce preview update
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                renderer.processContent(content);
            }, 300);
        });

        // Handle editor focus
        this.editor.addEventListener('focus', () => {
            this.editor.parentElement.classList.add('focused');
        });

        this.editor.addEventListener('blur', () => {
            this.editor.parentElement.classList.remove('focused');
        });
    }

    /**
     * Setup toolbar actions
     */
    setupToolbarActions() {
        this.editorToolbar.addEventListener('click', (e) => {
            const button = e.target.closest('[data-command]');
            if (!button) return;

            const command = button.dataset.command;
            this.executeCommand(command);
        });
    }

    /**
     * Execute editor command
     * @param {string} command - Command to execute
     */
    executeCommand(command) {
        const commands = {
            bold: { start: '\\textbf{', end: '}' },
            italic: { start: '\\textit{', end: '}' },
            math: { start: '$', end: '$' },
            displaymath: { start: '$$', end: '$$' }
        };

        const cmd = commands[command];
        if (!cmd) return;

        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selection = this.editor.value.substring(start, end);
        const replacement = cmd.start + selection + cmd.end;

        this.editor.value = 
            this.editor.value.substring(0, start) +
            replacement +
            this.editor.value.substring(end);

        // Update cursor position
        if (start === end) {
            // No selection, place cursor inside tags
            this.editor.selectionStart = start + cmd.start.length;
            this.editor.selectionEnd = start + cmd.start.length;
        } else {
            // Selection, place cursor after tags
            this.editor.selectionStart = start + replacement.length;
            this.editor.selectionEnd = start + replacement.length;
        }

        this.editor.focus();
        renderer.processContent(this.editor.value);
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        EventManager.emit(EVENTS.DOCUMENT_SAVE);
                        break;
                    case 'b':
                        e.preventDefault();
                        this.executeCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.executeCommand('italic');
                        break;
                }
            }
        });
    }

    /**
     * Setup clipboard functionality
     */
    setupClipboard() {
        document.getElementById('copyOutput').addEventListener('click', () => {
            const content = this.preview.textContent;
            navigator.clipboard.writeText(content).then(() => {
                uiComponents.showToast('Content copied to clipboard', 'success');
            }).catch(error => {
                uiComponents.showToast('Failed to copy content', 'error');
                console.error('Clipboard error:', error);
            });
        });
    }

    /**
     * Set editor content
     * @param {string} content - Content to set
     */
    setContent(content) {
        this.editor.value = content;
        this.lastContent = content;
        renderer.processContent(content);
    }

    /**
     * Get editor content
     * @returns {string} Editor content
     */
    getContent() {
        return this.editor.value;
    }
}

const editorUI = new EditorUI();