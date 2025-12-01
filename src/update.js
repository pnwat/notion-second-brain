const { notion } = require('./notion');

async function updateNote({ pageId, title, content, tags, category, replaceContent = false }) {
    try {
        let targetPageId = pageId;

        // If pageId is not provided but title is, search for the page by title
        if (!targetPageId && title) {
            const { searchNotes } = require('./search');
            const results = await searchNotes({ query: title });

            if (results.length === 0) {
                throw new Error(`No page found with title: ${title}`);
            }

            // Use the first matching result
            targetPageId = results[0].id;
            console.log(`Found page by title "${title}": ${targetPageId}`);
        }

        if (!targetPageId) {
            throw new Error('Either pageId or title must be provided for update');
        }

        const properties = {};
        if (title && pageId) {
            // Only update title if pageId was explicitly provided
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

        // Update properties if any
        let response;
        if (Object.keys(properties).length > 0) {
            response = await notion.pages.update({
                page_id: targetPageId,
                properties: properties,
            });
        } else {
            // If no properties to update, just get the page info
            response = await notion.pages.retrieve({ page_id: targetPageId });
        }

        // Handle content update
        if (content) {
            if (replaceContent) {
                // Replace mode: delete all existing blocks first
                console.log('Replacing content (deleting existing blocks)...');
                const existingBlocks = await notion.blocks.children.list({
                    block_id: targetPageId,
                });

                // Delete all existing blocks
                for (const block of existingBlocks.results) {
                    await notion.blocks.delete({ block_id: block.id });
                }
            }

            // Add new content
            await notion.blocks.children.append({
                block_id: targetPageId,
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

            console.log(`Successfully ${replaceContent ? 'replaced' : 'appended'} content`);
        }

        console.log(`Successfully updated note: ${response.url}`);
        return response.url;
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
}

module.exports = { updateNote };
