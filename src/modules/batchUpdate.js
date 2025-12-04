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
});
        }
    }

const successCount = results.filter(r => r.status === 'success').length;
logger.info(`Batch update completed. Success: ${successCount}, Failed: ${results.length - successCount}`);

return results;
}

module.exports = { batchUpdate };
