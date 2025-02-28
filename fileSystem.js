/**
 * File System Access API Module
 * @module fileSystem
 * @created 2025-02-28 11:08:12 UTC
 * @author slayer587
 */

class FileSystemManager {
    constructor() {
        this.handle = null;
        this.permissions = null;
    }

    /**
     * Request directory access
     * @returns {Promise<boolean>} Success status
     */
    async requestDirectoryAccess() {
        try {
            this.handle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });
            return true;
        } catch (error) {
            console.error('Directory access error:', error);
            return false;
        }
    }

    /**
     * Verify permissions for directory
     * @returns {Promise<boolean>} Permission status
     */
    async verifyPermissions() {
        if (!this.handle) return false;

        try {
            this.permissions = await this.handle.queryPermission({ mode: 'readwrite' });
            
            if (this.permissions === 'prompt') {
                this.permissions = await this.handle.requestPermission({ mode: 'readwrite' });
            }
            
            return this.permissions === 'granted';
        } catch (error) {
            console.error('Permission verification error:', error);
            return false;
        }
    }

    /**
     * Save file to selected directory
     * @param {string} filename - Name of the file
     * @param {string} content - File content
     * @returns {Promise<boolean>} Success status
     */
    async saveFile(filename, content) {
        if (!this.handle || !(await this.verifyPermissions())) {
            await this.requestDirectoryAccess();
        }

        try {
            const fileHandle = await this.handle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();
            return true;
        } catch (error) {
            console.error('File save error:', error);
            EventManager.emit(EVENTS.ERROR, {
                type: 'fileSystem',
                message: 'Failed to save file',
                error
            });
            return false;
        }
    }

    /**
     * Load file from selected directory
     * @param {string} filename - Name of the file
     * @returns {Promise<string|null>} File content
     */
    async loadFile(filename) {
        if (!this.handle || !(await this.verifyPermissions())) {
            await this.requestDirectoryAccess();
        }

        try {
            const fileHandle = await this.handle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            return await file.text();
        } catch (error) {
            console.error('File load error:', error);
            EventManager.emit(EVENTS.ERROR, {
                type: 'fileSystem',
                message: 'Failed to load file',
                error
            });
            return null;
        }
    }

    /**
     * Delete file from selected directory
     * @param {string} filename - Name of the file
     * @returns {Promise<boolean>} Success status
     */
    async deleteFile(filename) {
        if (!this.handle || !(await this.verifyPermissions())) {
            await this.requestDirectoryAccess();
        }

        try {
            await this.handle.removeEntry(filename);
            return true;
        } catch (error) {
            console.error('File deletion error:', error);
            EventManager.emit(EVENTS.ERROR, {
                type: 'fileSystem',
                message: 'Failed to delete file',
                error
            });
            return false;
        }
    }

    /**
     * List files in selected directory
     * @returns {Promise<Array>} List of files
     */
    async listFiles() {
        if (!this.handle || !(await this.verifyPermissions())) {
            await this.requestDirectoryAccess();
        }

        const files = [];
        try {
            for await (const entry of this.handle.values()) {
                if (entry.kind === 'file' && entry.name.endsWith('.tex')) {
                    const file = await entry.getFile();
                    files.push({
                        name: entry.name,
                        lastModified: new Date(file.lastModified),
                        size: file.size
                    });
                }
            }
            return files;
        } catch (error) {
            console.error('File listing error:', error);
            EventManager.emit(EVENTS.ERROR, {
                type: 'fileSystem',
                message: 'Failed to list files',
                error
            });
            return [];
        }
    }

    /**
     * Import a file into the editor
     * @returns {Promise<Object|null>} Imported file data
     */
    async importFile() {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'Text Files',
                        accept: {
                            'text/*': ['.tex', '.txt', '.md']
                        }
                    }
                ]
            });

            const file = await fileHandle.getFile();
            const content = await file.text();

            return {
                name: file.name,
                content,
                lastModified: new Date(file.lastModified)
            };
        } catch (error) {
            console.error('File import error:', error);
            EventManager.emit(EVENTS.ERROR, {
                type: 'fileSystem',
                message: 'Failed to import file',
                error
            });
            return null;
        }
    }

    /**
     * Export file as PDF
     * @param {string} content - Content to export
     * @param {string} filename - Name of the file
     * @returns {Promise<boolean>} Success status
     */
    async exportPDF(content, filename) {
        try {
            // Create temporary element for PDF generation
            const element = document.createElement('div');
            element.innerHTML = content;
            document.body.appendChild(element);

            // Generate PDF using html2pdf
            await html2pdf()
                .set({
                    margin: 10,
                    filename: filename.replace(/\.tex$/, '.pdf'),
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                })
                .from(element)
                .save();

            document.body.removeChild(element);
            return true;
        } catch (error) {
            console.error('PDF export error:', error);
            EventManager.emit(EVENTS.ERROR, {
                type: 'fileSystem',
                message: 'Failed to export PDF',
                error
            });
            return false;
        }
    }
}

const fileSystem = new FileSystemManager();