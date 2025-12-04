const { handleRequest } = require('./notionClient');
const logger = require('./utils/logger');

async function main() {
    let payload;

    // 1. Construct payload from individual environment variables
    if (process.env.ACTION) {
        let params = {};
        if (process.env.PAYLOAD) {
            try {
                let payloadStr = process.env.PAYLOAD;

                console.log('[DEBUG] Raw PAYLOAD type:', typeof payloadStr);
                console.log('[DEBUG] Raw PAYLOAD length:', payloadStr.length);
                console.log('[DEBUG] First 100 chars:', payloadStr.substring(0, 100));
                console.log('[DEBUG] Last 100 chars:', payloadStr.substring(payloadStr.length - 100));

                // Try to parse directly first
                try {
                    params = JSON.parse(payloadStr);
                    console.log('[DEBUG] Direct parse succeeded');
                } catch (directError) {
                    console.log('[DEBUG] Direct parse failed:', directError.message);

                    // If direct parse fails and string is wrapped in quotes, try unwrapping
                    if (payloadStr.startsWith('"') && payloadStr.endsWith('"')) {
                        console.log('[DEBUG] Attempting to unwrap quoted string');
                        payloadStr = payloadStr.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                        console.log('[DEBUG] After unwrap, first 100 chars:', payloadStr.substring(0, 100));
                        params = JSON.parse(payloadStr);
                        console.log('[DEBUG] Unwrap parse succeeded');
                    } else {
                        throw directError;
                    }
                }

                console.log('[DEBUG] Parsed params keys:', Object.keys(params));
            } catch (error) {
                logger.error('Failed to parse PAYLOAD JSON', { error: error.message, payload: process.env.PAYLOAD });
                console.error('[DEBUG] Parse failed completely. Raw value:');
                console.error(process.env.PAYLOAD);
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
