/**
 * LaTeX Renderer Module
 * @module renderer
 * @created 2025-02-28 11:05:10 UTC
 * @author slayer587
 */

class LatexRenderer {
    constructor() {
        this.renderQueue = [];
        this.isProcessing = false;
        this.debounceTimer = null;
    }

    /**
     * Initialize MathJax with configuration
     */
    init() {
        window.MathJax = CONFIG.mathJax;
        
        // Wait for MathJax to be fully loaded
        return new Promise((resolve) => {
            window.MathJax.startup = {
                pageReady: () => {
                    resolve();
                }
            };
        });
    }

    /**
     * Process LaTeX content with debouncing
     * @param {string} content - Raw LaTeX content
     * @param {number} delay - Debounce delay in ms
     */
    processContent(content, delay = 500) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            const processed = this.preProcess(content);
            this.queueRender(processed);
        }, delay);
    }

    /**
     * Pre-process LaTeX content
     * @param {string} content - Raw LaTeX content
     * @returns {string} Processed content
     */
    preProcess(content) {
        // Convert special characters
        content = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Process inline and display math
        content = this.processInlineMath(content);
        content = this.processDisplayMath(content);

        // Convert line breaks to paragraphs
        content = content
            .split(/\n\n+/)
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('\n');

        return content;
    }

    /**
     * Process inline math delimiters
     * @param {string} content - Content to process
     * @returns {string} Processed content
     */
    processInlineMath(content) {
        const [start, end] = CONFIG.defaults.mathDelimiters.inline;
        const regex = new RegExp(`${start}([^${end}]+)${end}`, 'g');
        return content.replace(regex, (match, latex) => {
            return `\\(${latex}\\)`;
        });
    }

    /**
     * Process display math delimiters
     * @param {string} content - Content to process
     * @returns {string} Processed content
     */
    processDisplayMath(content) {
        const [start, end] = CONFIG.defaults.mathDelimiters.display;
        const regex = new RegExp(`${start}([^${end}]+)${end}`, 'g');
        return content.replace(regex, (match, latex) => {
            return `\\[${latex}\\]`;
        });
    }

    /**
     * Queue content for rendering
     * @param {string} content - Processed content
     */
    queueRender(content) {
        this.renderQueue.push(content);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Process the render queue
     */
    async processQueue() {
        if (this.renderQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const content = this.renderQueue.pop();
        this.renderQueue = []; // Clear queue, keep only latest

        try {
            const preview = document.getElementById('preview');
            preview.innerHTML = content;
            
            // Trigger MathJax rendering
            await MathJax.typesetPromise([preview]);
            
            EventManager.emit(EVENTS.CONTENT_CHANGE, { success: true });
        } catch (error) {
            console.error('Rendering error:', error);
            EventManager.emit(EVENTS.ERROR, {
                type: 'render',
                message: 'Failed to render LaTeX content',
                error
            });
        }

        // Process next item in queue
        this.processQueue();
    }
}

const renderer = new LatexRenderer();