/**
 * Configuration settings for the LaTeX Editor
 * @module config
 */

const CONFIG = {
    /**
     * Default application settings
     */
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

    /**
     * MathJax configuration
     */
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

    /**
     * Storage keys
     */
    storageKeys: {
        settings: 'latex-editor-settings',
        documents: 'latex-editor-documents',
        currentDoc: 'latex-editor-current',
        lastSaveTime: 'latex-editor-last-save'
    },

    /**
     * File system settings
     */
    fileSystem: {
        suggestedName: 'document.tex',
        types: [
            {
                description: 'LaTeX files',
                accept: {
                    'text/x-tex': ['.tex']
                }
            }
        ]
    }
};

// Prevent modifications to the configuration object
Object.freeze(CONFIG);