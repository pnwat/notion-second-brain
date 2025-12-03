const { handleRequest } = require('./src/notionClient');
const logger = require('./src/utils/logger');

async function testCategoryUpdate() {
    try {
        // 1. Create a test note
        const title = `Category Test ${Date.now()}`;
        logger.info(`Creating test note: ${title}`);

        // Mocking params as if they came from index.js
        const addParams = {
            title: title,
            content: 'Testing category update',
            category: 'Others', // Initial category
            tags: ['Test']
        };

        // We need to capture the URL or ID from the result, but addNote returns URL.
        // We'll search for it afterwards to get the ID.
        await handleRequest('add', addParams);

        // 2. Search for the note to get ID
        logger.info('Searching for the note...');
        const searchResults = await handleRequest('search', { query: title });
        if (searchResults.length === 0) {
            throw new Error('Could not find created note');
        }
        const pageId = searchResults[0].id;
        logger.info(`Found note ID: ${pageId}`);

        // 3. Update category to "Tech"
        logger.info('Updating category to "Tech"...');
        const updateParams = {
            pageId: pageId,
            category: 'Tech'
        };
        await handleRequest('update', updateParams);

        logger.info('Category update request sent.');

    } catch (error) {
        logger.error('Test failed', { error: error.message });
    }
}

testCategoryUpdate();
