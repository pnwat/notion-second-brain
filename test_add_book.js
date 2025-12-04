const { addNote } = require('./src/modules/addNote');
const logger = require('./src/utils/logger');

// Mock process.env
process.env.NOTION_API_KEY = 'mock_key';
process.env.NOTION_DB_ID = 'mock_db_id';

async function testAddBook() {
    try {
        logger.info('Testing addNote for Book...');
        const url = await addNote({
            title: 'イシューからはじめよ 改訂版',
            category: 'Book',
            content: 'Test content',
            tags: ['test']
        });
        logger.info('Success: ' + url);
    } catch (error) {
        logger.error('Failed: ' + error.message);
    }
}

testAddBook();
