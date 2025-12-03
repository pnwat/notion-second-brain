/**
 * Simple logger utility for consistent logging format.
 */
const logger = {
    info: (message, meta = {}) => {
        console.log(`[INFO] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    },
    error: (message, meta = {}) => {
        console.error(`[ERROR] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    },
    warn: (message, meta = {}) => {
        console.warn(`[WARN] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    },
    debug: (message, meta = {}) => {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
        }
    }
};

module.exports = logger;
