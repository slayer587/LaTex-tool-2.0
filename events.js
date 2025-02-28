/**
 * Event management system for the LaTeX Editor
 * @module events
 */

const EventManager = {
    events: {},

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    unsubscribe(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    },

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Data to pass to event handlers
     */
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
};

// Define common events
const EVENTS = {
    CONTENT_CHANGE: 'content:change',
    DOCUMENT_SAVE: 'document:save',
    DOCUMENT_LOAD: 'document:load',
    SETTINGS_CHANGE: 'settings:change',
    THEME_CHANGE: 'theme:change',
    ERROR: 'error'
};

Object.freeze(EVENTS);