const { addNote } = require('./modules/addNote');
const { updateNote } = require('./modules/updateNote');
const { searchNotes } = require('./modules/searchNotes');
const { listRecent } = require('./modules/listRecent');
const { batchUpdate } = require('./modules/batchUpdate');
const logger = require('./utils/logger');

/**
 * Main dispatcher for Notion operations.
 * @param {string} action - The action to perform (add, update, search).
 * @param {object} params - The parameters for the action.
 * @returns {Promise<any>} - The result of the operation.
 */
async function handleRequest(action, params) {
    logger.info(`Received request: ${action}`, { params: { ...params, content: params.content ? '(content hidden)' : undefined } });

    switch (action) {
        case 'add':
            return await addNote(params);
        case 'update':
            return await updateNote(params);
        case 'search':
            return await searchNotes(params);
        case 'list_recent':
            return await listRecent(params);
        case 'batch_update':
            return await batchUpdate(params);
        default:
            const error = new Error(`Unknown action "${action}"`);
            logger.error(error.message);
            throw error;
    }
}

module.exports = { handleRequest };
