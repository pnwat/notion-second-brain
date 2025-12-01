const { notion } = require('./notion');

async function updateNote({ pageId, title, content, tags, category }) {
    try {
        const properties = {};
        if (title) {
            properties['名前'] = {
                title: [
                    {
                        text: {
                            content: title,
                        },
                    },
                ],
            };
        }
        if (category) {
            properties['カテゴリ'] = {
                select: {
                    name: category,
                },
            };
        }
        if (tags) {
            properties['タグ'] = {
                multi_select: tags.map((tag) => ({ name: tag })),
            };
        }

        // Update properties
        const response = await notion.pages.update({
            page_id: pageId,
            properties: properties,
        });

        // Append content if provided
        if (content) {
            await notion.blocks.children.append({
                block_id: pageId,
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
        }

        console.log(`Successfully updated note: ${response.url}`);
        return response.url;
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
}

module.exports = { updateNote };
