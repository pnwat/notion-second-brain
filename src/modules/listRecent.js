const { notion, databaseId } = require('../notion');
const logger = require('../utils/logger');

/**
 * Lists the most recently edited notes.
 * @param {object} params - Parameters for the action.
 * @param {number} params.limit - The number of notes to return (default: 10).
 * @returns {Promise<Array>} - A list of recent notes.
 */
async function listRecent({ limit = 10 }) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                {
                    timestamp: 'last_edited_time',
                    direction: 'descending',
                },
            ],
            page_size: parseInt(limit, 10) || 10,
        });

        const results = response.results.map((page) => {
            const title = page.properties['名前'].title[0]?.plain_text || 'Untitled';
            const category = page.properties['カテゴリ']?.select?.name || 'Uncategorized';
            const tags = page.properties['タグ']?.multi_select?.map(t => t.name) || [];

            return {
                id: page.id,
                title: title,
                category: category,
                tags: tags,
                url: page.url,
                last_edited: page.last_edited_time,
            };
        });

        logger.info(`Retrieved ${results.length} recent notes.`);
        return results;
    } catch (error) {
        logger.error('Error listing recent notes', { error: error.message });
        throw error;
    }
}

module.exports = { listRecent };
