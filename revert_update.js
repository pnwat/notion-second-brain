const { updateNote } = require('./src/modules/updateNote');
const logger = require('./src/utils/logger');

async function revertUpdate() {
    const pageId = '2bcb6f07-73e2-8113-b17e-e99c4ae334aa'; // Notion Second Brain 仕様書データベース
    const category = 'Second Brain 仕様';

    console.log(`Reverting page ${pageId} category to "${category}"...`);
    try {
        const url = await updateNote({ pageId, category });
        console.log('Revert successful:', url);
    } catch (error) {
        console.error('Revert failed:', error);
    }
}

revertUpdate();
