const { batchUpdate } = require('./src/modules/batchUpdate');
const logger = require('./src/utils/logger');

async function testBatchVerification() {
    const updates = [
        {
            pageId: '2bcb6f07-73e2-8113-b17e-e99c4ae334aa',
            category: 'Tech'
        }
    ];

    console.log('Testing batch update with verification...');
    const results = await batchUpdate({ updates });
    console.log('Results:', JSON.stringify(results, null, 2));
}

testBatchVerification();
