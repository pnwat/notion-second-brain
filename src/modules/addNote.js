const { notion, databaseId } = require('../notion');
const { splitText } = require('../utils');
const logger = require('../utils/logger');

async function addNote({ title, content, tags = [], category = 'Others' }) {
    try {
        const chunks = splitText(content);
        const children = chunks.map(chunk => ({
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: chunk,
                        },
                    },
                ],
            },
        }));

        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                '名前': {
                    title: [
                        {
                            text: {
                                content: title,
                            },
                        },
                    ],
                },
                'カテゴリ': {
                    select: {
                        name: category,
                    },
                },
                'タグ': {
                    multi_select: tags.map((tag) => ({ name: tag })),
                },
            },
            children: children,
        });
        logger.info(`Successfully added note: ${response.url}`, { title, id: response.id });
        return response.url;
    } catch (error) {
        logger.error('Error adding note', { error: error.message });
        throw error;
    }
}

module.exports = { addNote };
