const { addNote } = require('./src/modules/addNote');
const { updateNote } = require('./src/modules/updateNote');
const { notion } = require('./src/notion');
const logger = require('./src/utils/logger');

async function testModeUpdate() {
    try {
        logger.info('Starting mode update test...');

        // 1. Create a test page
        const title = `Mode Test ${Date.now()}`;
        logger.info(`Creating test page: ${title}`);
        const createResult = await addNote({
            title: title,
            content: 'Initial content.',
            category: 'Tech',
            tags: ['test']
        });

        // Extract pageId from URL or search for it (addNote returns URL)
        // For simplicity, let's search for it to get the ID
        const { searchNotes } = require('./src/modules/searchNotes');
        const searchResponse = await searchNotes({ query: title });
        if (searchResponse.results.length === 0) {
            throw new Error('Failed to find created test page');
        }
        const pageId = searchResponse.results[0].id;
        logger.info(`Test page ID: ${pageId}`);

        // 2. Test Append Mode
        logger.info('Testing APPEND mode...');
        await updateNote({
            pageId: pageId,
            content: 'Appended content.',
            mode: 'append'
        });
        logger.info('Append executed.');

        // Verify content (optional, but good for logs)
        // ...

        // 3. Test Replace Mode
        logger.info('Testing REPLACE mode...');
        await updateNote({
            pageId: pageId,
            content: 'Replaced content.',
            mode: 'replace'
        });
        logger.info('Replace executed.');

        logger.info('Test completed successfully.');

    } catch (error) {
        logger.error('Test failed:', error);
        console.error(error); // Ensure full error is printed
    }
}

testModeUpdate();
