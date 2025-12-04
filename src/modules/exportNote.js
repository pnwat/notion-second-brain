const { notion } = require('../notion');
const { convertBlocksToMarkdown } = require('../utils/markdownConverter');
const logger = require('../utils/logger');

/**
 * Export a Notion page as Markdown
 * @param {object} params - Parameters
 * @param {string} params.pageId - Page ID
 * @param {string} params.title - Page title (for search)
 * @returns {Promise<object>} Markdown content and metadata
 */
async function exportNote({ pageId, title }) {
    try {
        let targetPageId = pageId;

        // If pageId not provided, search by title
        if (!targetPageId && title) {
            const { searchNotes } = require('./searchNotes');
            const searchResponse = await searchNotes({ query: title });
            const results = searchResponse.results;

            if (results.length === 0) {
                throw new Error(`No page found with title: ${title}`);
            }

            targetPageId = results[0].id;
            logger.info(`Found page by title "${title}": ${targetPageId}`);
        }

        if (!targetPageId) {
            throw new Error('Either pageId or title must be provided');
        }

        // Get page metadata
        const page = await notion.pages.retrieve({ page_id: targetPageId });
        const pageTitle = page.properties['名前']?.title[0]?.plain_text || 'Untitled';
        const category = page.properties['カテゴリ']?.select?.name || 'Uncategorized';
        const tags = page.properties['タグ']?.multi_select?.map(t => t.name) || [];

        // Get page blocks
        const blocks = await notion.blocks.children.list({
            block_id: targetPageId,
            page_size: 100
        });

        // Convert to Markdown
        const markdown = convertBlocksToMarkdown(blocks.results);

        logger.info(`Successfully exported note to Markdown: ${pageTitle}`);

        return {
            title: pageTitle,
            category: category,
            tags: tags,
            markdown: markdown,
            url: page.url,
            last_edited: page.last_edited_time
        };
    } catch (error) {
        logger.error('Error exporting note', { error: error.message });
        throw error;
    }
}

module.exports = { exportNote };
