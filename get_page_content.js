const { notion } = require('./src/notion');

const pageId = '2beb6f07-73e2-81c3-a9de-ca3206a3b41a';

async function getPageContent() {
    try {
        // Get page metadata
        const page = await notion.pages.retrieve({ page_id: pageId });
        console.log('=== PAGE METADATA ===');
        console.log(JSON.stringify(page, null, 2));

        // Get page blocks (content)
        const blocks = await notion.blocks.children.list({ block_id: pageId });
        console.log('\n=== PAGE BLOCKS ===');
        console.log(JSON.stringify(blocks, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

getPageContent();
