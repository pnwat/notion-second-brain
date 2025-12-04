const { notion, databaseId } = require('../notion');
const { splitText } = require('../utils');
const { convertMarkdownToBlocks } = require('../utils/markdownConverter');
const { formatMarkdown } = require('../utils/markdownFormatter');
const { applyTemplate } = require('../utils/templateManager');
const { enrichBookMetadata } = require('./enrichBookMetadata');
const logger = require('../utils/logger');

async function addNote({ title, content, tags = [], category = 'Others', useMarkdown = true, autoFormat = true, template }) {
    try {
        let children;
        let finalContent = content || '';

        // Clean title for book notes (remove common suffixes)
        let cleanTitle = title;
        if (category === 'Book' || category === '読書') {
            cleanTitle = title
                .replace(/\s*(読書)?メモ\s*$/, '')
                .replace(/\s*の?読書ノート\s*$/, '')
                .replace(/\s*Book\s*Note\s*$/i, '')
                .replace(/\s*Reading\s*Note\s*$/i, '')
                .trim();
            if (cleanTitle !== title) {
                logger.info(`Cleaned title: "${title}" -> "${cleanTitle}"`);
            }
        }

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
        } else if (category === 'Book' || category === '読書') {
            // For book notes, apply template and optionally append user content
            const templateContent = await applyTemplate('book_note', { title });
            if (templateContent) {
                // Check if content looks like user-provided text (short, personal)
                // vs AI-generated summary (long, formal, contains phrases like "本書は", "について書かれた")
                const isLikelyAISummary = content && (
                    content.length > 200 ||
                    /本書は|について書かれた|概要|要約|まとめ/.test(content)
                );

                if (content && !isLikelyAISummary) {
                    // User provided short personal note/impression
                    finalContent = templateContent + '\n\n' + content;
                    logger.info('Applied book_note template with user content');
                } else {
                    // No content or AI-generated summary detected
                    finalContent = templateContent;
                    logger.info('Applied book_note template (AI content filtered)');
                }
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

        // Log database info for diagnostics
        try {
            const dbInfo = await notion.databases.retrieve({ database_id: databaseId });
            logger.info(`Target database: ${dbInfo.title[0]?.plain_text || 'Untitled'} (${dbInfo.url})`);
        } catch (error) {
            logger.warn(`Could not retrieve database info: ${error.message}`);
        }

        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                '名前': {
                    title: [{
                        text: { content: category === 'Book' || category === '読書' ? cleanTitle : title }
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

        // Enrich metadata if category is Book or 読書
        if (category === 'Book' || category === '読書') {
            // Run in background (don't await if we want faster response, but for CLI/Actions awaiting is safer to ensure completion)
            await enrichBookMetadata(response.id, title);
        }

        return response.url;
    } catch (error) {
        logger.error('Error adding note', { error: error.message });
        throw error;
    }
}

module.exports = { addNote };
