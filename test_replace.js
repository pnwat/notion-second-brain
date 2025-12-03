require('dotenv').config();
const { updateNote } = require('./src/update');

async function testReplace() {
    try {
        console.log('Testing replace content...');
        // First, ensure we have a page to test with
        // We'll use the one from the logs: "Notion Second Brain 改善提案仕様書（開発者向け）"
        const title = "Notion Second Brain 改善提案仕様書（開発者向け）";

        // Call updateNote with replaceContent: true
        await updateNote({
            title: title,
            content: "This is a TEST content replacement.\nIf you see this, the replace logic works!",
            replaceContent: true
        });

        console.log('Test finished.');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testReplace();
