const { notion } = require('./src/notion');
const { updateNote } = require('./src/modules/updateNote');
const logger = require('./src/utils/logger');

async function testSectionAppend() {
    try {
        const dbId = process.env.NOTION_DB_ID;
        if (!dbId) throw new Error('NOTION_DB_ID is required');

        // 1. Create a page with Standard Headings (Old Template)
        logger.info('Creating test page with Standard Headings...');
        const pageStandard = await notion.pages.create({
            parent: { database_id: dbId },
            properties: {
                '名前': { title: [{ text: { content: 'Test Standard Heading' } }] },
                'カテゴリ': { select: { name: 'Test' } }
            },
            children: [
                {
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ text: { content: 'メモ・フレーズ' } }]
                    }
                }
            ]
        });
        logger.info(`Created page: ${pageStandard.id}`);

        // 2. Try to append to Standard Heading
        logger.info('Testing append to Standard Heading...');
        try {
            await updateNote({
                pageId: pageStandard.id,
                content: 'Append to Standard',
                section: 'メモ・フレーズ',
                mode: 'append'
            });
        } catch (e) {
            logger.error('Append to Standard failed as expected (or unexpected): ' + e.message);
        }

        // 3. Create a page with Toggle Headings (New Template)
        logger.info('Creating test page with Toggle Headings...');
        const pageToggle = await notion.pages.create({
            parent: { database_id: dbId },
            properties: {
                '名前': { title: [{ text: { content: 'Test Toggle Heading' } }] },
                'カテゴリ': { select: { name: 'Test' } }
            },
            children: [
                {
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ text: { content: 'メモ・フレーズ' } }],
                        is_toggleable: true
                    }
                }
            ]
        });
        logger.info(`Created page: ${pageToggle.id}`);

        // 4. Try to append to Toggle Heading
        logger.info('Testing append to Toggle Heading...');
        await updateNote({
            pageId: pageToggle.id,
            content: 'Append to Toggle',
            section: 'メモ・フレーズ',
            mode: 'append'
        });
        logger.info('Append to Toggle success!');

    } catch (error) {
        logger.error('Test failed', { error: error.message });
    }
}

testSectionAppend();
