/**
 * Simple logger utility for consistent logging format.
 */
const logger = {
    info: (message, meta = {}) => {
        console.error(`[INFO] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    },
    error: (message, meta = {}) => {
        console.error(`[ERROR] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    },
    warn: (message, meta = {}) => {
        console.error(`[WARN] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    },
    debug: (message, meta = {}) => {
        if (process.env.DEBUG) {
            console.error(`[DEBUG] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
        }
    }
};

module.exports = logger;
