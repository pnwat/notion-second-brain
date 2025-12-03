const { handleRequest } = require('./notionClient');
const logger = require('./utils/logger');

async function main() {
    let payload;

    // 1. Try to construct payload from individual environment variables
    if (process.env.ACTION) {
        payload = {
            action: process.env.ACTION,
            title: process.env.TITLE,
            content: process.env.CONTENT,
            category: process.env.CATEGORY,
            tags: process.env.TAGS ? process.env.TAGS.split(',') : undefined,
            pageId: process.env.PAGE_ID,
            query: process.env.QUERY,
            limit: process.env.LIMIT,
            replaceContent: process.env.REPLACE_CONTENT === 'true',
            updates: process.env.UPDATES ? JSON.parse(process.env.UPDATES) : undefined,
        };
    }
    // 2. Fallback to PAYLOAD JSON string (for backward compatibility or local dev)
    else if (process.env.PAYLOAD) {
        try {
            payload = JSON.parse(process.env.PAYLOAD);
        } catch (error) {
            logger.error('Error: Invalid JSON in PAYLOAD.');
            process.exit(1);
        }
    } else {
        logger.error('Error: No ACTION or PAYLOAD environment variable provided.');
        process.exit(1);
    }

    const { action, ...params } = payload;

    try {
        await handleRequest(action, params);
    } catch (error) {
        logger.error('Operation failed', { error: error.message });
        process.exit(1);
    }
}

main();
