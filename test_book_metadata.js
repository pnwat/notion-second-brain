// Test book metadata extraction
process.env.ACTION = 'add';
process.env.TITLE = 'Clean Code';
process.env.CONTENT = '読書メモのテスト';
process.env.CATEGORY = 'Book';
process.env.NOTION_API_KEY = process.env.NOTION_API_KEY || 'dummy';
process.env.NOTION_DB_ID = process.env.NOTION_DB_ID || 'dummy';

// Mock Notion API for local testing without actual API calls if needed, 
// but here we want to test the logic flow.
// Since we don't have real credentials in this environment, we expect it to fail at Notion API call,
// but we can verify the Google Books API call if we mock the Notion part or check logs.

// However, to verify Google Books API specifically:
const { enrichBookMetadata } = require('./src/modules/enrichBookMetadata');

async function testMetadata() {
    console.log('Testing Google Books API fetch...');
    // We pass a dummy pageId because we just want to see if it fetches data.
    // The update call will fail with dummy credentials, which is expected.
    await enrichBookMetadata('dummy-page-id', 'Clean Code');
}

testMetadata();
