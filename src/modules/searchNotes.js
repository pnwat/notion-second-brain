const { notion, databaseId } = require('../notion');
const logger = require('../utils/logger');

async function searchNotes({ query }) {
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

        const results = response.results.map((page) => {
            const title = page.properties['名前'].title[0]?.plain_text || 'Untitled';
            return {
                id: page.id,
                title: title,
                url: page.url,
            };
        });

        // Log results count instead of full JSON to reduce noise
        logger.info(`Search found ${results.length} results for query: "${query}"`);
        return results;
    } catch (error) {
        logger.error('Error searching notes', { error: error.message });
        throw error;
    }
}

module.exports = { searchNotes };
