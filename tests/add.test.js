const { addNote } = require('../src/modules/addNote');
const { notion } = require('../src/notion');

jest.mock('../src/notion', () => ({
    notion: {
        pages: {
            create: jest.fn(),
        },
    },
    databaseId: 'mock-db-id',
}));

describe('addNote', () => {
    it('should call notion.pages.create with correct parameters', async () => {
        const mockResponse = { url: 'https://notion.so/new-page' };
        notion.pages.create.mockResolvedValue(mockResponse);

        const params = {
            title: 'Test Note',
            content: 'Test Content',
            tags: ['Tag1'],
            category: 'Tech',
        };

        const url = await addNote(params);

        expect(notion.pages.create).toHaveBeenCalledWith({
            parent: { database_id: 'mock-db-id' },
            properties: {
                '名前': { title: [{ text: { content: 'Test Note' } }] },
                'カテゴリ': { select: { name: 'Tech' } },
                'タグ': { multi_select: [{ name: 'Tag1' }] },
            },
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: 'Test Content' } }],
                    },
                },
            ],
        });
        expect(url).toBe('https://notion.so/new-page');
    });

    it('should handle errors', async () => {
        notion.pages.create.mockRejectedValue(new Error('API Error'));
        await expect(addNote({ title: 'Fail' })).rejects.toThrow('API Error');
    });
});
