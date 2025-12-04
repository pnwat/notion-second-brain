const { notion } = require('./src/notion');

async function verifyPages() {
    const pageIds = [
        '2bcb6f07-73e2-8113-b17e-e99c4ae334aa',
        '2bcb6f07-73e2-81a0-8ea4-e014a0015291',
        '2beb6f07-73e2-811f-851e-fcb97d9a7f3a'
    ];

    console.log('Verifying current category for each page:\n');

    for (const pageId of pageIds) {
        try {
            const page = await notion.pages.retrieve({ page_id: pageId });
            const title = page.properties['名前'].title[0]?.plain_text || 'Untitled';
            const category = page.properties['カテゴリ']?.select?.name || 'No category';
            const url = page.url;

            console.log(`Title: ${title}`);
            console.log(`Category: ${category}`);
            console.log(`URL: ${url}`);
            console.log('---');
        } catch (error) {
            console.error(`Error retrieving page ${pageId}:`, error.message);
        }
    }
}

verifyPages();
