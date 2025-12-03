const { listRecent } = require('../src/modules/listRecent');
const { notion } = require('../src/notion');

jest.mock('../src/notion', () => ({
    notion: {
        databases: {
            query: jest.fn(),
        },
    },
    databaseId: 'test-database-id',
}));

describe('listRecent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return a list of recent notes', async () => {
        const mockResponse = {
            results: [
                {
                    id: 'page-1',
                    url: 'https://notion.so/page-1',
                    last_edited_time: '2023-10-27T10:00:00.000Z',
                    properties: {
                        '名前': { title: [{ plain_text: 'Note 1' }] },
                        'カテゴリ': { select: { name: 'Tech' } },
                        'タグ': { multi_select: [{ name: 'Tag1' }, { name: 'Tag2' }] },
                    },
                },
                {
                    id: 'page-2',
                    url: 'https://notion.so/page-2',
                    last_edited_time: '2023-10-26T10:00:00.000Z',
                    properties: {
                        '名前': { title: [{ plain_text: 'Note 2' }] },
                        'カテゴリ': { select: { name: 'Life' } },
                        'タグ': { multi_select: [] },
                    },
                },
            ],
        };

        notion.databases.query.mockResolvedValue(mockResponse);

        const results = await listRecent({ limit: 5 });

        expect(notion.databases.query).toHaveBeenCalledWith({
            database_id: 'test-database-id',
            sorts: [
                {
                    timestamp: 'last_edited_time',
                    direction: 'descending',
                },
            ],
            page_size: 5,
        });

        expect(results).toHaveLength(2);
        expect(results[0]).toEqual({
            id: 'page-1',
            title: 'Note 1',
            category: 'Tech',
            tags: ['Tag1', 'Tag2'],
            url: 'https://notion.so/page-1',
            last_edited: '2023-10-27T10:00:00.000Z',
        });
    });

    it('should handle default limit', async () => {
        notion.databases.query.mockResolvedValue({ results: [] });

        await listRecent({});

        expect(notion.databases.query).toHaveBeenCalledWith(expect.objectContaining({
            page_size: 10,
        }));
    });
});
