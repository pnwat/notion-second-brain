const { searchNotes } = require('../src/search');
const { notion } = require('../src/notion');

jest.mock('../src/notion', () => ({
    notion: {
        databases: {
            query: jest.fn(),
        },
    },
    databaseId: 'mock-db-id',
}));

describe('searchNotes', () => {
    it('should return formatted results', async () => {
        const mockResponse = {
            results: [
                {
                    id: 'page-1',
                    url: 'https://notion.so/page-1',
                    properties: {
                        Name: {
                            title: [{ plain_text: 'Result 1' }],
                        },
                    },
                },
            ],
        };
        notion.databases.query.mockResolvedValue(mockResponse);

        const results = await searchNotes({ query: 'Search Term' });

        expect(notion.databases.query).toHaveBeenCalledWith({
            database_id: 'mock-db-id',
            filter: {
                or: [
                    { property: 'Name', title: { contains: 'Search Term' } },
                    { property: 'Tags', multi_select: { contains: 'Search Term' } },
                ],
            },
        });

        expect(results).toEqual([
            { id: 'page-1', title: 'Result 1', url: 'https://notion.so/page-1' },
        ]);
    });
});
