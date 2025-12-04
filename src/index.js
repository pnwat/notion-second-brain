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
            template: process.env.TEMPLATE,
            subAction: process.env.SUB_ACTION,
            name: process.env.NAME,
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
