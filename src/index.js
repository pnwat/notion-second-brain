const { handleRequest } = require('./notionClient');
const logger = require('./utils/logger');

async function main() {
    let payload;

    // 1. Construct payload from individual environment variables
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
            mode: process.env.MODE,
            useMarkdown: process.env.USE_MARKDOWN !== 'false', // Default true
            autoFormat: process.env.AUTO_FORMAT !== 'false', // Default true
            updates: process.env.UPDATES ? (() => {
                try {
                    return JSON.parse(process.env.UPDATES);
                } catch (error) {
                    logger.error('Failed to parse UPDATES JSON', { error: error.message, updates: process.env.UPDATES });
                    throw new Error(`Invalid UPDATES JSON: ${error.message}`);
                }
            })() : undefined,
        };
    } else {
        logger.error('Error: No ACTION environment variable provided.');
        process.exit(1);
    }

    const { action, ...params } = payload;

    try {
        const result = await handleRequest(action, params);

        // Output success response as JSON
        const response = {
            status: 'success',
            action: action,
            result: result
        };
        console.log(JSON.stringify(response, null, 2));
        process.exit(0);
    } catch (error) {
        // Output error response as JSON
        const errorResponse = {
            status: 'error',
            action: action,
            error: {
                message: error.message,
                stack: process.env.DEBUG ? error.stack : undefined
            }
        };
        console.error(JSON.stringify(errorResponse, null, 2));
        // Exit with 0 so GitHub Actions doesn't fail, but include error in response
        process.exit(0);
    }
}

main();
