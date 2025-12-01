const { notion, databaseId } = require('./notion');

async function addNote({ title, content, tags = [], category = 'Others' }) {
    try {
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
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [
                            {
                                type: 'text',
                                text: {
                                    content: content,
                                },
                            },
                        ],
                    },
                },
            ],
        });
        console.log(`Successfully added note: ${response.url}`);
        return response.url;
    } catch (error) {
        console.error('Error adding note:', error);
        throw error;
    }
}

module.exports = { addNote };
