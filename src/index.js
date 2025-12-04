const { handleRequest } = require('./notionClient');
const logger = require('./utils/logger');

async function main() {
    let payload;

    // 1. Construct payload from individual environment variables
    if (process.env.ACTION) {
        let params = {};
        if (process.env.PAYLOAD) {
            try {
                // GitHub Actions may escape quotes, so we need to handle that
                let payloadStr = process.env.PAYLOAD;

                // If the payload starts and ends with quotes, remove them and unescape
                if (payloadStr.startsWith('"') && payloadStr.endsWith('"')) {
                    payloadStr = payloadStr.slice(1, -1).replace(/\\"/g, '"');
                }

                params = JSON.parse(payloadStr);
            } catch (error) {
                logger.error('Failed to parse PAYLOAD JSON', { error: error.message, payload: process.env.PAYLOAD });
                throw new Error(`Invalid PAYLOAD JSON: ${error.message}`);
            }
        }

        payload = {
            action: process.env.ACTION,
            ...params,
            useMarkdown: process.env.USE_MARKDOWN !== 'false', // Default true
            autoFormat: process.env.AUTO_FORMAT !== 'false', // Default true
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
