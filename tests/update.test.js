const { updateNote } = require('../src/update');
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
            pageId: 'page-id-123',
            title: 'Updated Title',
            content: 'Appended Content',
            tags: ['New Tag'],
            category: 'Life',
        };

        const url = await updateNote(params);

        expect(notion.pages.update).toHaveBeenCalledWith({
            page_id: 'page-id-123',
            properties: {
                Name: { title: [{ text: { content: 'Updated Title' } }] },
                Category: { select: { name: 'Life' } },
                Tags: { multi_select: [{ name: 'New Tag' }] },
            },
        });

        expect(notion.blocks.children.append).toHaveBeenCalledWith({
            block_id: 'page-id-123',
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

        await updateNote({ pageId: 'page-id-123', title: 'Only Title' });

        expect(notion.pages.update).toHaveBeenCalledWith({
            page_id: 'page-id-123',
            properties: {
                Name: { title: [{ text: { content: 'Only Title' } }] },
            },
        });

        expect(notion.blocks.children.append).not.toHaveBeenCalled();
    });
});
