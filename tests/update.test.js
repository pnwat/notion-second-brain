const { updateNote } = require('../src/modules/updateNote');
const { notion } = require('../src/notion');

jest.mock('../src/notion', () => ({
    notion: {
        pages: {
            update: jest.fn(),
        },
        blocks: {
            children: {
                append: jest.fn(),
            },
        },
    },
}));

describe('updateNote', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update properties and append content', async () => {
        notion.pages.update.mockResolvedValue({ url: 'https://notion.so/updated-page' });
        notion.blocks.children.append.mockResolvedValue({});

        const params = {
            pageId: '12345678-1234-1234-1234-1234567890ab',
            title: 'Updated Title',
            content: 'Appended Content',
            tags: ['New Tag'],
            category: 'Life',
        };

        const url = await updateNote(params);

        expect(notion.pages.update).toHaveBeenCalledWith({
            page_id: '12345678-1234-1234-1234-1234567890ab',
            properties: {
                '名前': { title: [{ text: { content: 'Updated Title' } }] },
                'カテゴリ': { select: { name: 'Life' } },
                'タグ': { multi_select: [{ name: 'New Tag' }] },
            },
        });

        expect(notion.blocks.children.append).toHaveBeenCalledWith({
            block_id: '12345678-1234-1234-1234-1234567890ab',
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: 'Appended Content' } }],
                    },
                },
            ],
        });

        expect(url).toBe('https://notion.so/updated-page');
    });

    it('should only update provided fields', async () => {
        notion.pages.update.mockResolvedValue({ url: 'https://notion.so/updated-page' });

        await updateNote({ pageId: '12345678-1234-1234-1234-1234567890ab', title: 'Only Title' });

        expect(notion.pages.update).toHaveBeenCalledWith({
            page_id: '12345678-1234-1234-1234-1234567890ab',
            properties: {
                '名前': { title: [{ text: { content: 'Only Title' } }] },
            },
        });

        expect(notion.blocks.children.append).not.toHaveBeenCalled();
    });
});
