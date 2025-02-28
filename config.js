/**
 * Configuration settings for the LaTeX Editor
 * @created 2025-02-28 11:51:58 UTC
 * @author slayer587
 */

const CONFIG = {
    defaults: {
        theme: 'dark',
        fontSize: '14',
        autoSaveInterval: 30,
        livePreview: true,
        mathDelimiters: {
            inline: ['$', '$'],
            display: ['$$', '$$']
        }
    },

    mathJax: {
        loader: {load: ['[tex]/ams']},
        tex: {
            packages: {'[+]': ['ams']},
            inlineMath: [['$', '$']],
            displayMath: [['$$', '$$']],
            processEscapes: true,
            processEnvironments: true
        },
        options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
        }
    },

    storageKeys: {
        settings: 'latex-editor-settings',
        documents: 'latex-editor-documents',
        currentDoc: 'latex-editor-current',
        lastSaveTime: 'latex-editor-last-save'
    }
};

// Make sure CONFIG is available globally
window.CONFIG = CONFIG;
