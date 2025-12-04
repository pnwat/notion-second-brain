const { notion } = require('./src/notion');

async function testDirectUpdate() {
    const pageId = '2bcb6f07-73e2-81a0-8ea4-e014a0015291'; // 改善提案仕様書（現在「テスト」）

    console.log('Before update:');
    let page = await notion.pages.retrieve({ page_id: pageId });
    console.log('Category:', page.properties['カテゴリ']?.select?.name);

    console.log('\nUpdating to Tech...');
    const response = await notion.pages.update({
        page_id: pageId,
        properties: {
            'カテゴリ': {
                select: {
                    name: 'Tech'
                }
            }
        }
    });
    console.log('Update response URL:', response.url);

    console.log('\nAfter update (immediate check):');
    page = await notion.pages.retrieve({ page_id: pageId });
    console.log('Category:', page.properties['カテゴリ']?.select?.name);
}

testDirectUpdate();
