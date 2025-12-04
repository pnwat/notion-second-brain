const { updateNote } = require('./src/modules/updateNote');
const logger = require('./src/utils/logger');

async function testChatGPTUpdate() {
    try {
        logger.info('Testing update as ChatGPT would call it...');

        const result = await updateNote({
            title: 'モード挙動テスト',
            content: '検索後の追記テスト成功',
            mode: 'append'
        });

        logger.info('Update result:', result);
        console.log('SUCCESS:', result);
    } catch (error) {
        logger.error('Update failed:', error);
        console.error('ERROR:', error.message);
        console.error(error.stack);
    }
}

testChatGPTUpdate();
