const { notion } = require('../notion');
const { splitText } = require('../utils');
const { convertMarkdownToBlocks } = require('../utils/markdownConverter');
const { formatMarkdown } = require('../utils/markdownFormatter');
const logger = require('../utils/logger');

async function updateNote({ pageId, title, content, tags, category, replaceContent = false, mode = 'append', section, useMarkdown = true, autoFormat = true }) {
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
            const searchResponse = await searchNotes({ query: title });
            const results = searchResponse.results;

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
            logger.info('Updating properties:', { properties });
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
            // Determine mode: explicit mode > replaceContent flag > default 'append'
            let updateMode = mode;
            if (!updateMode && replaceContent) {
                updateMode = 'replace';
            }
            if (!updateMode) {
                updateMode = 'append';
            }

            logger.info(`Updating content with mode: ${updateMode}`);

            let targetBlockId = targetPageId;

            // If section is specified, try to find the target block (toggle heading)
            if (section) {
                logger.info(`Looking for section: "${section}"`);
                const pageBlocks = await notion.blocks.children.list({
                    block_id: targetPageId,
                });

                // Normalize string for comparison (remove spaces)
                const normalize = (str) => str.replace(/\s+/g, '').toLowerCase();
                const targetSection = normalize(section);

                const sectionBlock = pageBlocks.results.find(block => {
                    const type = block.type;
                    if (['heading_1', 'heading_2', 'heading_3'].includes(type)) {
                        const text = block[type].rich_text.map(t => t.plain_text).join('');
                        return normalize(text).includes(targetSection);
                    }
                    return false;
                });

                if (sectionBlock) {
                    logger.info(`Found section block: ${sectionBlock.id} (${sectionBlock.type})`);

                    // Check if it is a toggle heading
                    if (sectionBlock[sectionBlock.type].is_toggleable) {
                        targetBlockId = sectionBlock.id;

                        if (updateMode === 'replace') {
                            logger.info(`Clearing existing content in section "${section}"...`);
                            const sectionChildren = await notion.blocks.children.list({ block_id: targetBlockId });
                            for (const child of sectionChildren.results) {
                                await notion.blocks.delete({ block_id: child.id });
                            }
                        }
                    } else {
                        logger.warn(`Section "${section}" found but is NOT a toggle heading. Cannot append inside. Appending to end of page.`);
                    }
                } else {
                    logger.warn(`Section "${section}" not found. Appending to end of page.`);
                }
            } else if (updateMode === 'replace') {
                // Replace mode for whole page: delete all existing blocks first
                logger.info('Clearing existing content for replace mode...');
                const existingBlocks = await notion.blocks.children.list({
                    block_id: targetPageId,
                });

                // Delete all existing blocks
                for (const block of existingBlocks.results) {
                    await notion.blocks.delete({ block_id: block.id });
                }
            } else if (updateMode !== 'append') {
                logger.warn(`Unknown mode "${updateMode}", falling back to "append".`);
            }

            // Prepare new content blocks
            let newBlocks;
            if (useMarkdown) {
                // Auto-format if enabled
                let processedContent = content;
                if (autoFormat) {
                    processedContent = await formatMarkdown(content);
                    if (processedContent !== content) {
                        logger.info('Applied auto-formatting to content');
                    }
                }
                newBlocks = convertMarkdownToBlocks(processedContent);
            } else {
                // Existing plain text processing
                const chunks = splitText(content);
                newBlocks = chunks.map(chunk => ({
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
            }

            // Execute Append
            await notion.blocks.children.append({
                block_id: targetBlockId,
                children: newBlocks,
            });

            logger.info(`Successfully updated content (mode: ${updateMode}, section: ${section || 'none'})`);
        }

        logger.info(`Successfully updated note: ${response.url}`, { url: response.url });
        return response.url;
    } catch (error) {
        logger.error('Error updating note', { error: error.message });
        throw error;
    }
}

module.exports = { updateNote };
