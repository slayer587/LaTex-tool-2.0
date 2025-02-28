/**
 * Event management system
 * @created 2025-02-28 11:51:58 UTC
 * @author slayer587
 */

const EventManager = {
    events: {},

    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        console.log(`Subscribed to event: ${event}`);
    },

    unsubscribe(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
            console.log(`Unsubscribed from event: ${event}`);
        }
    },

    emit(event, data) {
        console.log(`Emitting event: ${event}`, data);
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
        return Promise.resolve(); // Make emit always return a promise
    }
};

const EVENTS = {
    CONTENT_CHANGE: 'content:change',
    DOCUMENT_SAVE: 'document:save',
    DOCUMENT_LOAD: 'document:load',
    DOCUMENT_DELETE: 'document:delete',
    SETTINGS_CHANGE: 'settings:change',
    THEME_CHANGE: 'theme:change',
    ERROR: 'error'
};

// Make sure these are available globally
window.EventManager = EventManager;
window.EVENTS = EVENTS;
