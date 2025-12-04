const { notion, databaseId } = require('../notion');
const { splitText } = require('../utils');
const { convertMarkdownToBlocks } = require('../utils/markdownConverter');
const { formatMarkdown } = require('../utils/markdownFormatter');
const { applyTemplate } = require('../utils/templateManager');
const logger = require('../utils/logger');

async function addNote({ title, content, tags = [], category = 'Others', useMarkdown = true, autoFormat = true, template }) {
    try {
        let children;
        let finalContent = content || '';

        // Apply template if specified
        if (template) {
            const templateContent = await applyTemplate(template, { title });
            if (templateContent) {
                if (finalContent) {
                    finalContent = templateContent + '\n\n' + finalContent;
                } else {
                    finalContent = templateContent;
                }
                logger.info(`Applied template: ${template}`);
            } else {
                logger.warn(`Template not found: ${template}`);
            }
        }

        if (useMarkdown && finalContent) {
            // Auto-format if enabled
            let processedContent = finalContent;
            if (autoFormat) {
                processedContent = await formatMarkdown(finalContent);
                if (processedContent !== finalContent) {
                    logger.info('Applied auto-formatting to content');
                }
            }

            // Markdown → Notion blocks conversion
            children = convertMarkdownToBlocks(processedContent);
        } else if (finalContent) {
            // Existing plain text processing (backward compatibility)
            const chunks = splitText(content);
            children = chunks.map(chunk => ({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{
                        type: 'text',
                        text: { content: chunk }
                    }]
                }
            }));
        } else {
            children = [];
        }

        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                '名前': {
                    title: [{
                        text: { content: title }
                    }]
                },
                'カテゴリ': {
                    select: { name: category }
                },
                'タグ': {
                    multi_select: tags.map(tag => ({ name: tag }))
                }
            },
            children: children
        });

        logger.info(`Successfully added note: ${response.url}`, { title, id: response.id });
        return response.url;
    } catch (error) {
        logger.error('Error adding note', { error: error.message });
        throw error;
    }
}

module.exports = { addNote };
