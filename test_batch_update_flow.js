// Test batch_update with search results
async function testBatchUpdate() {
    // First, search for notes
    delete process.env.UPDATES;
    delete process.env.LIMIT;
    delete process.env.PAGE_ID;
    delete process.env.TITLE;
    delete process.env.CONTENT;
    delete process.env.CATEGORY;
    delete process.env.TAGS;
    delete process.env.REPLACE_CONTENT;

    process.env.ACTION = 'search';
    process.env.QUERY = 'Second Brain';
    process.env.LIMIT = '3';

    console.log('=== Step 1: Searching for notes ===');
    const searchModule = require('./src/modules/searchNotes');
    const { notion, databaseId } = require('./src/notion');

    const searchResults = await searchModule.searchNotes({ query: 'Second Brain', limit: 3 });
    console.log('Search results:', JSON.stringify(searchResults, null, 2));

    // Now prepare batch update
    const updates = searchResults.results.map(note => ({
        pageId: note.id,
        category: 'テスト'
    }));

    console.log('\n=== Step 2: Preparing batch update ===');
    console.log('Updates:', JSON.stringify(updates, null, 2));

    // Execute batch update
    process.env.ACTION = 'batch_update';
    process.env.UPDATES = JSON.stringify(updates);

    console.log('\n=== Step 3: Executing batch update ===');
    require('./src/index');
}

testBatchUpdate().catch(console.error);
