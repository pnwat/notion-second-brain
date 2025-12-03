const { notion, databaseId } = require('../notion');
const logger = require('../utils/logger');

/**
 * Searches for notes by title or tags.
 * @param {object} params - Parameters for the action.
 * @param {string} params.query - The search query.
 * @param {number} params.limit - Maximum number of results to return (default: 10).
 * @returns {Promise<object>} - Search results with metadata.
 */
async function searchNotes({ query, limit = 10 }) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                or: [
                    {
                        property: '名前',
                        title: {
                            contains: query,
                        },
                    },
                    {
                        property: 'タグ',
                        multi_select: {
                            contains: query,
                        },
                    },
                ],
            },
        });

        // Filter out archived pages
        const allResults = response.results.filter(page => !page.archived);
        const totalCount = allResults.length;
        const limitNum = parseInt(limit, 10) || 10;
        const limitedResults = allResults.slice(0, limitNum);

        const results = limitedResults.map((page) => {
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

        logger.info(`Search found ${totalCount} results for query: "${query}" (showing ${results.length})`);

        return {
            results: results,
            total_count: totalCount,
            showing_count: results.length,
            has_more: totalCount > limitNum,
        };
    } catch (error) {
        logger.error('Error searching notes', { error: error.message });
        throw error;
    }
}

module.exports = { searchNotes };
