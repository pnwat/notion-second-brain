const { notion, databaseId } = require('./notion');

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

        console.log(JSON.stringify(results, null, 2));
        return results;
    } catch (error) {
        console.error('Error searching notes:', error);
        throw error;
    }
}

module.exports = { searchNotes };
