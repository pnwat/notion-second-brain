const { updateNote } = require('./src/modules/updateNote');
const logger = require('./src/utils/logger');

async function testUpdate() {
    const pageId = '2bcb6f07-73e2-8113-b17e-e99c4ae334aa'; // Notion Second Brain 仕様書データベース
    const category = 'Tech';

    console.log(`Attempting to update page ${pageId} category to "${category}"...`);
    try {
        const url = await updateNote({ pageId, category });
        console.log('Update successful:', url);
    } catch (error) {
        console.error('Update failed:', error);
    }
}

testUpdate();
