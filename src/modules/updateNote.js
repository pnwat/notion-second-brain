const { notion } = require('../notion');
const { splitText } = require('../utils');
const logger = require('../utils/logger');

async function updateNote({ pageId, title, content, tags, category, replaceContent = false }) {
    try {
        let targetPageId = pageId;

        // Validate pageId format (simple UUID check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (targetPageId && !uuidRegex.test(targetPageId)) {
            logger.warn(`Invalid pageId format "${targetPageId}". Ignoring and trying title search.`);
            targetPageId = null;
        }

        // If pageId is not provided (or invalid) but title is, search for the page by title
        if (!targetPageId && title) {
            const { searchNotes } = require('./searchNotes');
            const results = await searchNotes({ query: title });

            if (results.length === 0) {
                throw new Error(`No page found with title: ${title}`);
            }

            // Use the first matching result
            targetPageId = results[0].id;
            logger.info(`Found page by title "${title}": ${targetPageId}`);
        }

        if (!targetPageId) {
            throw new Error('Either valid pageId or title must be provided for update');
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
                logger.info('Replacing content (deleting existing blocks)...');
                const existingBlocks = await notion.blocks.children.list({
                    block_id: targetPageId,
                });

                // Delete all existing blocks
                for (const block of existingBlocks.results) {
                    await notion.blocks.delete({ block_id: block.id });
                }
            }

            // Split content into chunks if it exceeds 2000 characters
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

            // Add new content
            await notion.blocks.children.append({
                block_id: targetPageId,
                children: children,
            });

            logger.info(`Successfully ${replaceContent ? 'replaced' : 'appended'} content`);
        }

        logger.info(`Successfully updated note: ${response.url}`, { url: response.url });
        return response.url;
    } catch (error) {
        logger.error('Error updating note', { error: error.message });
        throw error;
    }
}

module.exports = { updateNote };
