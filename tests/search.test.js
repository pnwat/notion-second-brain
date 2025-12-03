const { searchNotes } = require('../src/modules/searchNotes');
const { notion } = require('../src/notion');

jest.mock('../src/notion', () => ({
    notion: {
        databases: {
            query: jest.fn(),
        },
    },
    databaseId: 'test-database-id',
}));

describe('searchNotes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return enhanced search results with metadata', async () => {
        const mockResponse = {
            results: [
                {
                    id: 'page-1',
                    url: 'https://notion.so/page-1',
                    archived: false,
                    last_edited_time: '2023-10-27T10:00:00.000Z',
                    properties: {
                        '名前': { title: [{ plain_text: 'Test Note 1' }] },
                        'カテゴリ': { select: { name: 'Tech' } },
                        'タグ': { multi_select: [{ name: 'Tag1' }] },
                    },
                },
                {
                    id: 'page-2',
                    url: 'https://notion.so/page-2',
                    archived: false,
                    last_edited_time: '2023-10-26T10:00:00.000Z',
                    properties: {
                        '名前': { title: [{ plain_text: 'Test Note 2' }] },
                        'カテゴリ': { select: { name: 'Life' } },
                        'タグ': { multi_select: [] },
                    },
                },
            ],
        };

        notion.databases.query.mockResolvedValue(mockResponse);

        const result = await searchNotes({ query: 'test', limit: 10 });

        expect(result.results).toHaveLength(2);
        expect(result.total_count).toBe(2);
        expect(result.showing_count).toBe(2);
        expect(result.has_more).toBe(false);
        expect(result.results[0]).toEqual({
            id: 'page-1',
            title: 'Test Note 1',
            category: 'Tech',
            tags: ['Tag1'],
            url: 'https://notion.so/page-1',
            last_edited: '2023-10-27T10:00:00.000Z',
        });
    });

    it('should filter out archived pages', async () => {
        const mockResponse = {
            results: [
                {
                    id: 'page-1',
                    archived: false,
                    last_edited_time: '2023-10-27T10:00:00.000Z',
                    properties: {
                        '名前': { title: [{ plain_text: 'Active Note' }] },
                        'カテゴリ': { select: { name: 'Tech' } },
                        'タグ': { multi_select: [] },
                    },
                },
                {
                    id: 'page-2',
                    archived: true,
                    last_edited_time: '2023-10-26T10:00:00.000Z',
                    properties: {
                        '名前': { title: [{ plain_text: 'Archived Note' }] },
                        'カテゴリ': { select: { name: 'Tech' } },
                        'タグ': { multi_select: [] },
                    },
                },
            ],
        };

        notion.databases.query.mockResolvedValue(mockResponse);

        const result = await searchNotes({ query: 'test' });

        expect(result.results).toHaveLength(1);
        expect(result.results[0].title).toBe('Active Note');
    });

    it('should limit results correctly', async () => {
        const mockResponse = {
            results: Array(5).fill(null).map((_, i) => ({
                id: `page-${i}`,
                archived: false,
                url: `https://notion.so/page-${i}`,
                last_edited_time: '2023-10-27T10:00:00.000Z',
                properties: {
                    '名前': { title: [{ plain_text: `Note ${i}` }] },
                    'カテゴリ': { select: { name: 'Tech' } },
                    'タグ': { multi_select: [] },
                },
            })),
        };

        notion.databases.query.mockResolvedValue(mockResponse);

        const result = await searchNotes({ query: 'test', limit: 3 });

        expect(result.results).toHaveLength(3);
        expect(result.total_count).toBe(5);
        expect(result.has_more).toBe(true);
    });
});
