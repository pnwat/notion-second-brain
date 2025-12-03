const { updateNote } = require('./updateNote');
const logger = require('../utils/logger');

/**
 * Updates multiple notes in a batch.
 * @param {object} params - Parameters for the action.
 * @param {Array} params.updates - List of update objects.
 * @returns {Promise<Array>} - List of results for each update.
 */
async function batchUpdate({ updates }) {
    if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error('No updates provided for batch operation.');
    }

    logger.info(`Starting batch update for ${updates.length} notes.`);

    const results = [];
    for (const update of updates) {
        try {
            logger.info(`Processing update for pageId: ${update.pageId || 'unknown'} / title: ${update.title || 'unknown'}`);
            const url = await updateNote(update);
            results.push({
                id: update.pageId,
                title: update.title,
                status: 'success',
                url: url,
            });
        } catch (error) {
            logger.error(`Failed to update note: ${update.pageId || update.title}`, { error: error.message });
            results.push({
                id: update.pageId,
                title: update.title,
                status: 'error',
                error: error.message,
            });
        }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    logger.info(`Batch update completed. Success: ${successCount}, Failed: ${results.length - successCount}`);

    return results;
}

module.exports = { batchUpdate };
