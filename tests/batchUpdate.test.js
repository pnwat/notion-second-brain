const { batchUpdate } = require('../src/modules/batchUpdate');
const { updateNote } = require('../src/modules/updateNote');

jest.mock('../src/modules/updateNote');
jest.mock('../src/utils/logger'); // Mock logger to avoid cluttering output

describe('batchUpdate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should process multiple updates', async () => {
        updateNote.mockResolvedValueOnce('https://notion.so/page-1');
        updateNote.mockResolvedValueOnce('https://notion.so/page-2');

        const updates = [
            { pageId: 'page-1', title: 'Title 1' },
            { pageId: 'page-2', category: 'Tech' },
        ];

        const results = await batchUpdate({ updates });

        expect(updateNote).toHaveBeenCalledTimes(2);
        expect(updateNote).toHaveBeenCalledWith(updates[0]);
        expect(updateNote).toHaveBeenCalledWith(updates[1]);

        expect(results).toEqual([
            { id: 'page-1', title: 'Title 1', status: 'success', url: 'https://notion.so/page-1' },
            { id: 'page-2', title: undefined, status: 'success', url: 'https://notion.so/page-2' },
        ]);
    });

    it('should handle errors in individual updates', async () => {
        updateNote.mockResolvedValueOnce('https://notion.so/page-1');
        updateNote.mockRejectedValueOnce(new Error('Update failed'));

        const updates = [
            { pageId: 'page-1' },
            { pageId: 'page-2' },
        ];

        const results = await batchUpdate({ updates });

        expect(updateNote).toHaveBeenCalledTimes(2);
        expect(results).toEqual([
            { id: 'page-1', title: undefined, status: 'success', url: 'https://notion.so/page-1' },
            { id: 'page-2', title: undefined, status: 'error', error: 'Update failed' },
        ]);
    });

    it('should throw error if updates array is empty', async () => {
        await expect(batchUpdate({ updates: [] })).rejects.toThrow('No updates provided');
    });
});
